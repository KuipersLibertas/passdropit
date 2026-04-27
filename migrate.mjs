/**
 * Passdropit — CSV → Supabase migration script
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... node migrate.mjs
 *
 * Optional env vars:
 *   OLD_SITE_URL  — base URL of the old server for logo downloads
 *                   (default: https://passdropit.com)
 *
 * CSV files expected in the same directory as this script:
 *   users.csv, file_list_user.csv, daily_downloads.csv, ip_tracker.csv
 *
 * Run steps in order. Comment out completed steps on re-runs.
 */

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OLD_SITE_URL = (process.env.OLD_SITE_URL ?? 'https://passdropit.com').replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── HELPERS ───────────────────────────────────────────────────────────────

function parseCsvLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === delimiter && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/** Read entire CSV into memory — only use for smaller tables (< 200k rows). */
function readCsv(filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, filename);
    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  ${filename} not found — skipping.`);
      return resolve([]);
    }
    const rows = [];
    let headers = null;
    let delimiter = ',';
    const rl = createInterface({ input: createReadStream(filepath), crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!headers) delimiter = line.includes(';') ? ';' : ',';
      const cols = parseCsvLine(line, delimiter);
      if (!headers) { headers = cols.map((h) => h.trim()); }
      else { const row = {}; headers.forEach((h, i) => { row[h] = cols[i] ?? ''; }); rows.push(row); }
    });
    rl.on('close', () => resolve(rows));
    rl.on('error', reject);
  });
}

/**
 * Stream a large CSV and process rows in batches without loading all into RAM.
 * processBatch(rows) is called for each batch.
 */
async function streamCsv(filename, processBatch, batchSize = 500) {
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  ${filename} not found — skipping.`);
    return 0;
  }
  return new Promise((resolve, reject) => {
    let headers = null;
    let delimiter = ',';
    let batch = [];
    let total = 0;
    let pending = Promise.resolve();
    let rlClosed = false;

    const rl = createInterface({ input: createReadStream(filepath), crlfDelay: Infinity });

    rl.on('line', (line) => {
      if (!headers) delimiter = line.includes(';') ? ';' : ',';
      const cols = parseCsvLine(line, delimiter);
      if (!headers) { headers = cols.map((h) => h.trim()); return; }
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] ?? ''; });
      batch.push(row);
      if (batch.length >= batchSize) {
        const toProcess = batch;
        batch = [];
        rl.pause();
        pending = pending.then(() => processBatch(toProcess).then((n) => {
          total += n;
          process.stdout.write(`   ${total} rows inserted...\r`);
          if (!rlClosed) rl.resume();
        }));
      }
    });

    rl.on('close', () => {
      rlClosed = true;
      const last = batch;
      pending
        .then(() => last.length ? processBatch(last) : Promise.resolve(0))
        .then((n) => { total += (n || 0); resolve(total); })
        .catch(reject);
    });
    rl.on('error', reject);
  });
}

function toNull(val) {
  if (val === '' || val === 'NULL' || val === 'null' || val === undefined) return null;
  return val;
}
function toInt(val) {
  const v = toNull(val); if (v === null) return null;
  const n = parseInt(v, 10); return isNaN(n) ? null : n;
}
function toFloat(val) {
  const v = toNull(val); if (v === null) return null;
  const n = parseFloat(v); return isNaN(n) ? null : n;
}
function toBool(val) {
  const v = toNull(val); if (v === null) return false;
  return v === '1' || v === 'true' || v === 'TRUE';
}
function toDate(val) {
  const v = toNull(val);
  if (!v || v === '0000-00-00') return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return null;
}
function toTimestamp(val) {
  const v = toNull(val); if (!v) return null;
  try { const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); } catch { return null; }
}

async function batchUpsert(table, rows, conflict = 'id') {
  if (!rows.length) return 0;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: true });
  if (error) {
    console.error(`\n❌  Upsert error in ${table}:`, error.message);
    console.error('    First row:', JSON.stringify(rows[0]));
    throw error;
  }
  return rows.length;
}

async function batchInsertIgnore(table, rows) {
  if (!rows.length) return 0;
  const { error } = await supabase.from(table).insert(rows);
  if (error && !error.message.includes('duplicate')) {
    console.error(`\n❌  Insert error in ${table}:`, error.message);
    throw error;
  }
  return rows.length;
}

// ─── MIGRATION STEPS ───────────────────────────────────────────────────────

async function migrateUsers() {
  console.log('\n📥  Migrating users...');
  const rows = await readCsv('users.csv');
  if (!rows.length) return;

  const allMapped = rows.map((r) => ({
    id:              toInt(r.id ?? r.user_id),
    user_name:       toNull(r.user_name) ?? toNull(r.user_email)?.split('@')[0] ?? 'user',
    user_email:      toNull(r.user_email),
    password_hash:   toNull(r.password_hash ?? r.user_password_hash ?? r.user_password),
    is_pro:          toInt(r.is_pro) ?? 0,
    stripe_id:       toNull(r.stripe_id),
    subscription_id: toNull(r.subscription_id),
    logo:            toNull(r.logo),
    balance:         toFloat(r.balance) ?? 0,
    paypal_id:       toNull(r.paypal_id),
  })).filter((r) => r.id && r.user_email && r.password_hash);

  // Deduplicate by email — keep the row with the lowest id (oldest account)
  const emailSeen = new Map();
  for (const r of allMapped) {
    const existing = emailSeen.get(r.user_email);
    if (!existing || r.id < existing.id) emailSeen.set(r.user_email, r);
  }
  const mapped = Array.from(emailSeen.values());
  console.log(`   (${allMapped.length - mapped.length} duplicate-email rows removed)`);

  let inserted = 0;
  for (let i = 0; i < mapped.length; i += 500) {
    inserted += await batchUpsert('users', mapped.slice(i, i + 500), 'user_email');
    process.stdout.write(`   ${inserted}/${mapped.length} users...\r`);
  }
  console.log(`\n✅  ${inserted} users`);
}

async function migrateLinks() {
  console.log('\n📥  Migrating file_list_user...');
  const rows = await readCsv('file_list_user.csv');
  if (!rows.length) return;

  console.log('    Loading valid user IDs from Supabase...');
  const validUserIds = await fetchAllIds('users');
  console.log(`    ${validUserIds.size} valid user IDs loaded.`);

  const serviceMap = { notion: 3, google_drive: 2, gdrive: 2, dropbox: 1 };
  const linkTypeMap = { link: 4, folder: 3, multiple: 2, single: 1 };

  const mapped = rows.map((r) => {
    const userId = toInt(r.user_id);
    return {
      id:                 toInt(r.id),
      user_id:            (userId && validUserIds.has(userId)) ? userId : null,
      dropbox_url:        toNull(r.dropbox_url),
      filename:           toNull(r.filename),
      passdrop_url:       toNull(r.passdrop_url),
      passdrop_pwd:       toNull(r.passdrop_pwd),
      service:            serviceMap[toNull(r.service)] ?? toInt(r.service) ?? 3,
      link_type:          linkTypeMap[toNull(r.link_type)] ?? toInt(r.link_type) ?? 4,
      is_verified:        toInt(r.is_verified) ?? 0,
      alt_email:          toNull(r.alt_email),
      download_count:     toInt(r.download_count) ?? 0,
      expires_on:         toDate(r.expires_on),
      expire_count:       toInt(r.expire_count) ?? 0,
      track_ip:           toBool(r.track_ip),
      email_notify:       toBool(r.email_notify),
      is_paid:            toFloat(r.is_paid),
      paypop_title:       toNull(r.paypop_title),
      paypop_sub:         toNull(r.paypop_sub),
      is_expiry_extended: toBool(r.is_expiry_extended),
      created_on:         toDate(r.created_on),
      last_download:      toTimestamp(r.last_download),
    };
  }).filter((r) => r.id && r.passdrop_url);

  // Deduplicate by passdrop_url — keep lowest id
  const urlSeen = new Map();
  for (const r of mapped) {
    const existing = urlSeen.get(r.passdrop_url);
    if (!existing || r.id < existing.id) urlSeen.set(r.passdrop_url, r);
  }
  const deduped = Array.from(urlSeen.values());
  console.log(`   (${mapped.length - deduped.length} duplicate-url rows removed)`);

  let inserted = 0;
  for (let i = 0; i < deduped.length; i += 500) {
    inserted += await batchUpsert('file_list_user', deduped.slice(i, i + 500));
    process.stdout.write(`   ${inserted}/${deduped.length} links...\r`);
  }
  console.log(`\n✅  ${inserted} links`);
}

/** Fetch all IDs from a table in paginated batches (Supabase default cap is 1000/request). */
async function fetchAllIds(table) {
  const ids = new Set();
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select('id').range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    data.forEach((r) => ids.add(r.id));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return ids;
}

async function migrateIpTracker() {
  console.log('\n📥  Migrating ip_tracker (streaming)...');
  console.log('    Loading valid link IDs from Supabase...');
  const validLinkIds = await fetchAllIds('file_list_user');
  console.log(`    ${validLinkIds.size} valid link IDs loaded.`);

  // Find the max id already inserted so we can resume
  const { data: maxRow } = await supabase.from('ip_tracker').select('id').order('id', { ascending: false }).limit(1);
  const resumeFromId = maxRow?.[0]?.id ?? 0;
  if (resumeFromId > 0) console.log(`    Resuming from id > ${resumeFromId}`);
  let skipped = 0;

  const total = await streamCsv('ip_tracker.csv', async (rows) => {
    const mapped = rows.map((r) => ({
      id:       toInt(r.id),
      link_id:  toInt(r.link_id),
      ip:       toNull(r.ip),
      city:     toNull(r.city),
      country:  toNull(r.country),
      reserved: toNull(r.reserved),
      latlong:  toNull(r.latlong),
    })).filter((r) => {
      if (!r.id || !r.link_id || !validLinkIds.has(r.link_id) || r.id <= resumeFromId) { skipped++; return false; }
      return true;
    });

    if (!mapped.length) return 0;
    return batchUpsert('ip_tracker', mapped);
  }, 500);

  console.log(`\n✅  ${total} ip_tracker rows (${skipped} skipped — orphaned FK)`);
}

async function migrateDailyDownloads() {
  console.log('\n📥  Migrating daily_downloads (streaming ~2M rows — this will take a while)...');
  console.log('    Loading valid link and user IDs from Supabase...');
  const [validLinkIds, validUserIds] = await Promise.all([
    fetchAllIds('file_list_user'),
    fetchAllIds('users'),
  ]);
  console.log(`    ${validLinkIds.size} links, ${validUserIds.size} users loaded.`);
  let skipped = 0;

  const total = await streamCsv('daily_downloads.csv', async (rows) => {
    const mapped = rows.map((r) => {
      const userId = toInt(r.user_id);
      return {
        user_id:       (userId && validUserIds.has(userId)) ? userId : null,
        link_id:       toInt(r.link_id),
        passdrop_url:  toNull(r.passdrop_url),
        downloads:     toInt(r.downloads) ?? 0,
        download_date: toDate(r.download_date),
      };
    }).filter((r) => {
      if (!r.link_id || !validLinkIds.has(r.link_id)) { skipped++; return false; }
      return true;
    });

    if (!mapped.length) return 0;
    return batchInsertIgnore('daily_downloads', mapped);
  }, 500);

  console.log(`\n✅  ${total} daily_downloads rows (${skipped} skipped — orphaned FK)`);
}

// ─── LOGO MIGRATION ────────────────────────────────────────────────────────

/**
 * Downloads logos from the old server for the 4 active users who had one,
 * uploads each to Supabase Storage (bucket: logos, path: {userId}/logo.png),
 * and updates the users.logo column with the resulting public URL.
 *
 * The list below was determined by cross-referencing users.csv and
 * file_list_user.csv: only users with link activity in the last 6 months
 * and a real logo file are included.
 */
const LOGO_USERS = [
  { userId: 6128,  oldPath: 'uploads/passdropit/6128.png' },
  { userId: 6907,  oldPath: 'uploads/passdropit/6907.png' },
  { userId: 7328,  oldPath: 'uploads/passdropit/7328.png' },
  { userId: 33762, oldPath: 'uploads/passdropit/33762.png' },
];

async function migrateLogos() {
  console.log('\n🖼️   Migrating user logos...');

  for (const { userId, oldPath } of LOGO_USERS) {
    process.stdout.write(`   Processing user ${userId} ... `);

    const localPath = path.join(__dirname, `logo_${userId}.png`);
    if (!fs.existsSync(localPath)) {
      console.log(`❌  File not found: ${localPath} — skipping user ${userId}`);
      continue;
    }

    const imageBuffer = fs.readFileSync(localPath);
    const contentType = 'image/png';
    console.log(`${imageBuffer.length} bytes (local file)`);

    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'png';
    const storagePath = `${userId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(storagePath, imageBuffer, { contentType, upsert: true });

    if (uploadError) {
      console.error(`   ❌  Storage upload failed for user ${userId}:`, uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('users')
      .update({ logo: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error(`   ❌  DB update failed for user ${userId}:`, updateError.message);
      continue;
    }

    console.log(`   ✅  User ${userId} → ${publicUrl}`);
  }

  console.log('\n✅  Logo migration complete');
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Passdropit migration starting...');
  console.log(`    Supabase: ${SUPABASE_URL}\n`);

  try {
    // await migrateUsers();
    // await migrateLinks();
    // ip_tracker already complete — comment back in if re-running from scratch
    // await migrateIpTracker();
    // await migrateDailyDownloads();
    await migrateLogos();

    console.log('\n🎉  Migration complete!');
    console.log('\n⚠️  Run these in the Supabase SQL Editor to fix auto-increment sequences:');
    console.log("    SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
    console.log("    SELECT setval('file_list_user_id_seq', (SELECT MAX(id) FROM file_list_user));");
    console.log("    SELECT setval('ip_tracker_id_seq', (SELECT MAX(id) FROM ip_tracker));");
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  }
}

main();
