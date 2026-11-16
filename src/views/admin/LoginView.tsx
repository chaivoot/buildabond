'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { img } from '../../data/images';
import { login } from '../../server/actions/admin';
import './admin.css';

export function LoginView({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, { error: '' });
  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <Image src={img.logo} alt="" width={48} height={48} style={{ borderRadius: '50%' }} />
        <h1 className="num-display" style={{ marginTop: 14, fontWeight: 400, fontSize: 26 }}>Buildabond หลังบ้าน</h1>
        {configured ? (
          <form action={action} className="stack" style={{ marginTop: 20, gap: 14 }}>
            <label className="field">
              รหัสผ่าน
              <input className="input" name="password" type="password" autoComplete="current-password" required autoFocus />
            </label>
            {state.error && <p role="alert" className="small" style={{ color: '#8e1f0b' }}>{state.error}</p>}
            <button type="submit" className="btn btn--primary btn--square" disabled={pending}>{pending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
          </form>
        ) : (
          <div className="admin-note admin-note--warn" style={{ marginTop: 20 }}>
            ยังไม่ได้ตั้งรหัสผ่านหลังบ้าน ไปที่ Vercel → Project → Settings → Environment Variables แล้วเพิ่ม <code>ADMIN_PASSWORD</code> จากนั้น Redeploy
          </div>
        )}
      </div>
    </main>
  );
}
