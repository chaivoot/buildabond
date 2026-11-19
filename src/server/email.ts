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

export async function sendEmail(m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !m.to) return false;
  try {
    const res = await fetch(process.env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM(), to: [m.to], subject: m.subject, html: m.html, text: m.text, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('[email] Resend refused', res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (e) {
    console.error('[email] send failed', e);
    return false;
  }
}
