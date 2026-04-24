import crypto from 'crypto';

const ALGO   = 'aes-256-gcm';
const PREFIX = 'enc:';

function getKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET must be set to encrypt link passwords');
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptLinkPassword(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key      = getKey();
  const iv       = crypto.randomBytes(12);
  const cipher   = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag  = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptLinkPassword(stored: string | null): string {
  if (!stored) return '';
  if (!stored.startsWith(PREFIX)) return stored;
  try {
    const key      = getKey();
    const buf      = Buffer.from(stored.slice(PREFIX.length), 'base64');
    const iv       = buf.subarray(0, 12);
    const authTag  = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
  } catch {
    return '';
  }
}

export function verifyLinkPassword(stored: string | null, supplied: string): boolean {
  const plaintext = decryptLinkPassword(stored);
  return plaintext === supplied;
}
