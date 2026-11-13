import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'confere_session';
const SESSION_SECONDS = 8 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET deve ter ao menos 32 caracteres.');
  return value;
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function isValidSession(token?: string) {
  if (!token) return false;
  const [payload, supplied, extra] = token.split('.');
  if (!payload || !supplied || extra) return false;
  let expected: string;
  try { expected = signature(payload); } catch { return false; }
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function passwordMatches(candidate: string) {
  const configured = process.env.APP_ACCESS_PASSWORD;
  if (!configured) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sessionMaxAge = SESSION_SECONDS;
