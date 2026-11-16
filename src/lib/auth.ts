/**
 * Single-password admin login.
 * The session cookie is "<expiry>.<HMAC(expiry)>" signed with ADMIN_PASSWORD (plus AUTH_SECRET if set),
 * so changing the password logs everyone out. Uses Web Crypto so it also runs in middleware.
 */
export const SESSION_COOKIE = 'bb_admin';
export const SESSION_DAYS = 30;

const secret = () => {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  return pw ? `${pw}:${process.env.AUTH_SECRET ?? 'buildabond'}` : '';
};

export const adminConfigured = () => secret() !== '';

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(exp));
}

export async function checkPassword(input: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  // Compare HMACs so the comparison time doesn't depend on the password.
  return safeEqual(await hmac(`pw:${input}`), await hmac(`pw:${process.env.ADMIN_PASSWORD}`));
}
