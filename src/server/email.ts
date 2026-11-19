/**
 * Sends email through Resend (https://resend.com). Needs RESEND_API_KEY; without it every send is skipped,
 * so checkout and the admin keep working before email is set up. Sending never throws: a failed email must
 * not fail an order. Optional RESEND_FROM overrides the sender (RESEND_API_URL is for local testing).
 */
const FROM = () => process.env.RESEND_FROM || 'Buildabond <orders@build-a-bond.com>';

export const emailEnabled = () => !!process.env.RESEND_API_KEY;

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export interface EmailLogRow { at: string; to: string; subject: string; status: 'sent' | 'failed' | 'skipped'; detail: string }

/** Every attempt is recorded so the admin can see what happened (Settings → อีเมล). Logging never throws. */
export async function logEmail(to: string, subject: string, status: EmailLogRow['status'], detail = ''): Promise<void> {
  try {
    const { sql } = await import('./db');
    await sql(`INSERT INTO email_log (to_addr, subject, status, detail) VALUES ($1, $2, $3, $4)`, [to.slice(0, 200), subject.slice(0, 300), status, detail.slice(0, 1000)]);
    if (Math.random() < 0.05) await sql(`DELETE FROM email_log WHERE at < now() - interval '90 days'`);
  } catch (e) {
    console.error('[email] log failed', e);
  }
}

export async function recentEmails(limit = 30): Promise<EmailLogRow[]> {
  const { sql } = await import('./db');
  const rows = await sql<{ at: string | Date; to_addr: string; subject: string; status: EmailLogRow['status']; detail: string }>(
    `SELECT at, to_addr, subject, status, detail FROM email_log ORDER BY id DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ at: new Date(r.at).toISOString(), to: r.to_addr, subject: r.subject, status: r.status, detail: r.detail }));
}

export async function sendEmail(m: Mail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!m.to) {
    await logEmail('', m.subject, 'skipped', 'ไม่มีอีเมลผู้รับ');
    return { ok: false, error: 'no recipient' };
  }
  if (!key) {
    await logEmail(m.to, m.subject, 'skipped', 'ยังไม่ได้ตั้ง RESEND_API_KEY ใน Vercel (หรือยังไม่ได้ Redeploy)');
    return { ok: false, error: 'RESEND_API_KEY is not set' };
  }
  try {
    const res = await fetch(process.env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM(), to: [m.to], subject: m.subject, html: m.html, text: m.text, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error('[email] Resend refused', res.status, body.slice(0, 300));
      await logEmail(m.to, m.subject, 'failed', `Resend ${res.status}: ${body}`);
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    let id = '';
    try { id = JSON.parse(body).id ?? ''; } catch { /* ignore */ }
    await logEmail(m.to, m.subject, 'sent', id);
    return { ok: true, id };
  } catch (e) {
    console.error('[email] send failed', e);
    const error = e instanceof Error ? e.message : String(e);
    await logEmail(m.to, m.subject, 'failed', error);
    return { ok: false, error };
  }
}
