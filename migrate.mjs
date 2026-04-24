/**
 * Passdropit — CSV → Supabase migration script
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... node migrate.mjs
 *
 * CSV files expected in the same directory as this script:
 *   users.csv, file_list_user.csv, daily_downloads.csv,
 *   ip_tracker.csv, paid_links.csv, paid_membership.csv
 *
 * Run steps one by one — comment out completed steps.
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── HELPERS ───────────────────────────────────────────────────────────────

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

    const rl = createInterface({
      input: createReadStream(filepath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!headers) {
        delimiter = line.includes(';') ? ';' : ',';
      }
      const cols = parseCsvLine(line, delimiter);
      if (!headers) {
        headers = cols.map((h) => h.trim());
      } else {
        const row = {};
        headers.forEach((h, i) => { row[h] = cols[i] ?? ''; });
        rows.push(row);
      }
    });

    rl.on('close', () => resolve(rows));
    rl.on('error', reject);
  });
}

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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function toNull(val) {
  if (val === '' || val === 'NULL' || val === 'null' || val === undefined) return null;
  return val;
}

function toInt(val) {
  const v = toNull(val);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function toFloat(val) {
  const v = toNull(val);
  if (v === null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function toBool(val) {
  const v = toNull(val);
  if (v === null) return false;
  return v === '1' || v === 'true' || v === 'TRUE';
}

function toDate(val) {
  const v = toNull(val);
  if (!v || v === '0000-00-00') return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const parts = v.split(/[-\/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function toTimestamp(val) {
  const v = toNull(val);
  if (!v) return null;
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch { return null; }
}

async function batchInsert(table, rows, batchSize = 100) {
  if (rows.length === 0) {
    console.log(`   ℹ️  No rows to insert into ${table}.`);
    return;
  }
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      console.error(`❌  Error inserting into ${table} (batch ${i}–${i + batch.length}):`, error.message);
      console.error('    First row of failed batch:', JSON.stringify(batch[0]));
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`   ${inserted}/${rows.length} rows into ${table}...\r`);
  }
  console.log(`\n✅  ${rows.length} rows upserted into ${table}`);
}

async function resetSequence(table) {
  const { error } = await supabase.rpc('reset_sequence', { tbl: table });
  if (error) {
    console.log(`   ⚠️  Run in Supabase SQL Editor to reset ${table} sequence:`);
    console.log(`      SELECT setval('${table}_id_seq', (SELECT MAX(id) FROM ${table}));\n`);
  }
}

// ─── MIGRATION STEPS ───────────────────────────────────────────────────────

async function migrateUsers() {
  console.log('\n📥  Migrating users...');
  const rows = await readCsv('users.csv');
  if (!rows.length) return;

  const mapped = rows.map((r) => ({
    id:              toInt(r.id ?? r.user_id),
    user_name:       toNull(r.user_name),
    user_email:      toNull(r.user_email),
    // The Laravel backend used user_password_hash; fall back to password_hash
    password_hash:   toNull(r.password_hash ?? r.user_password_hash ?? r.user_password),
    is_pro:          toInt(r.is_pro) ?? 0,
    stripe_id:       toNull(r.stripe_id),
    subscription_id: toNull(r.subscription_id),
    logo:            toNull(r.logo),
    balance:         toFloat(r.balance) ?? 0,
    paypal_id:       toNull(r.paypal_id),
  })).filter((r) => r.id && r.user_email && r.password_hash);

  await batchInsert('users', mapped);
  await resetSequence('users');
}

async function migrateLinks() {
  console.log('\n📥  Migrating file_list_user...');
  const rows = await readCsv('file_list_user.csv');
  if (!rows.length) return;

  const serviceMap = { notion: 3, google_drive: 2, gdrive: 2, dropbox: 1 };
  const linkTypeMap = { link: 4, folder: 3, multiple: 2, single: 1 };

  const mapped = rows.map((r) => {
    const userId = toInt(r.user_id);
    const serviceRaw = toNull(r.service);
    const linkTypeRaw = toNull(r.link_type);

    return {
      id:                 toInt(r.id),
      user_id:            userId === 0 ? null : userId,
      dropbox_url:        toNull(r.dropbox_url),
      filename:           toNull(r.filename),
      passdrop_url:       toNull(r.passdrop_url),
      passdrop_pwd:       toNull(r.passdrop_pwd),
      service:            serviceMap[serviceRaw] ?? toInt(serviceRaw) ?? 3,
      link_type:          linkTypeMap[linkTypeRaw] ?? toInt(linkTypeRaw) ?? 4,
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

  await batchInsert('file_list_user', mapped);
  await resetSequence('file_list_user');
}

async function migrateDailyDownloads() {
  console.log('\n📥  Migrating daily_downloads...');
  const rows = await readCsv('daily_downloads.csv');
  if (!rows.length) return;

  const { data: links } = await supabase.from('file_list_user').select('id');
  const validLinkIds = new Set((links ?? []).map((l) => l.id));
  const { data: users } = await supabase.from('users').select('id');
  const validUserIds = new Set((users ?? []).map((u) => u.id));

  const mapped = rows.map((r) => ({
    user_id:       toInt(r.user_id),
    link_id:       toInt(r.link_id),
    passdrop_url:  toNull(r.passdrop_url),
    downloads:     toInt(r.downloads) ?? 0,
    download_date: toDate(r.download_date),
  })).filter((r) =>
    r.link_id && validLinkIds.has(r.link_id) &&
    r.user_id && validUserIds.has(r.user_id)
  );

  console.log(`   (${rows.length - mapped.length} rows skipped — orphaned FK)`);

  if (mapped.length === 0) { console.log('   ℹ️  No rows to insert into daily_downloads.'); return; }

  let inserted = 0;
  for (let i = 0; i < mapped.length; i += 100) {
    const batch = mapped.slice(i, i + 100);
    const { error } = await supabase.from('daily_downloads').insert(batch);
    if (error) {
      console.error(`❌  Error inserting into daily_downloads:`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`   ${inserted}/${mapped.length} rows into daily_downloads...\r`);
  }
  console.log(`\n✅  ${inserted} rows inserted into daily_downloads`);
}

async function migrateIpTracker() {
  console.log('\n📥  Migrating ip_tracker...');
  const rows = await readCsv('ip_tracker.csv');
  if (!rows.length) return;

  const { data: links } = await supabase.from('file_list_user').select('id');
  const validLinkIds = new Set((links ?? []).map((l) => l.id));

  const mapped = rows.map((r) => ({
    id:       toInt(r.id),
    link_id:  toInt(r.link_id),
    ip:       toNull(r.ip),
    city:     toNull(r.city),
    country:  toNull(r.country),
    reserved: toNull(r.reserved),
    latlong:  toNull(r.latlong),
  })).filter((r) => r.id && r.link_id && validLinkIds.has(r.link_id));

  console.log(`   (${rows.length - mapped.length} rows skipped — orphaned FK)`);
  await batchInsert('ip_tracker', mapped);
  await resetSequence('ip_tracker');
}

async function migratePaidLinks() {
  console.log('\n📥  Migrating paid_links...');
  const rows = await readCsv('paid_links.csv');
  if (!rows.length) return;

  const mapped = rows.map((r) => ({
    id:         toInt(r.id),
    user_id:    toInt(r.user_id),
    link_id:    toInt(r.link_id),
    type:       toInt(r.type) ?? 1,
    amount:     toFloat(r.amount),
    status:     toInt(r.status) ?? 0,
    created_at: toTimestamp(r.created_at),
    updated_at: toTimestamp(r.updated_at),
  })).filter((r) => r.id);

  await batchInsert('paid_links', mapped);
  await resetSequence('paid_links');
}

async function migratePaidMembership() {
  console.log('\n📥  Migrating paid_membership...');
  const rows = await readCsv('paid_membership.csv');
  if (!rows.length) return;

  const mapped = rows.map((r) => ({
    id:         toInt(r.id),
    user_id:    toInt(r.user_id),
    type:       toInt(r.type),
    amount:     toFloat(r.amount),
    status:     toInt(r.status) ?? 0,
    created_at: toTimestamp(r.created_at),
    updated_at: toTimestamp(r.updated_at),
  })).filter((r) => r.id);

  await batchInsert('paid_membership', mapped);
  await resetSequence('paid_membership');
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Passdropit migration starting...');
  console.log(`    Supabase URL: ${SUPABASE_URL}\n`);

  try {
    // Run steps in order. Comment out completed steps on re-runs.
    await migrateUsers();
    await migrateLinks();
    await migrateIpTracker();
    await migratePaidLinks();
    await migratePaidMembership();
    await migrateDailyDownloads();

    console.log('\n🎉  Migration complete!');
    console.log('\n⚠️  Run these in the Supabase SQL Editor to fix auto-increment sequences:');
    console.log("    SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
    console.log("    SELECT setval('file_list_user_id_seq', (SELECT MAX(id) FROM file_list_user));");
    console.log("    SELECT setval('daily_downloads_id_seq', (SELECT MAX(id) FROM daily_downloads));");
    console.log("    SELECT setval('ip_tracker_id_seq', (SELECT MAX(id) FROM ip_tracker));");
    console.log("    SELECT setval('paid_links_id_seq', (SELECT MAX(id) FROM paid_links));");
    console.log("    SELECT setval('paid_membership_id_seq', (SELECT MAX(id) FROM paid_membership));");
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  }
}

main();
