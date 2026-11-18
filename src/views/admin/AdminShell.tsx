'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { img } from '../../data/images';
import { logout } from '../../server/actions/admin';
import './admin.css';

const NAV = [
  { href: '/admin', label: 'ออร์เดอร์', match: (p: string) => p === '/admin' },
  { href: '/admin/products', label: 'สินค้า', match: (p: string) => p.startsWith('/admin/products') },
  { href: '/admin/customers', label: 'ลูกค้า', match: (p: string) => p.startsWith('/admin/customers') },
  { href: '/admin/requests', label: 'คำขอสั่งทำ / ธุรกิจ', match: (p: string) => p.startsWith('/admin/requests') },
  { href: '/admin/settings', label: 'ตั้งค่าร้าน', match: (p: string) => p.startsWith('/admin/settings') },
];

export function AdminShell({ warnings, children }: { warnings: string[]; children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="admin">
      <header className="on-dark">
        <div className="admin__bar">
          <Image src={img.logo} alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
          <span className="num-display" style={{ fontWeight: 500, fontSize: 18 }}>Buildabond</span>
          <span className="admin__bar-label">หลังบ้าน</span>
          <nav aria-label="เมนูหลังบ้าน" className="admin__nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={n.match(path) ? 'page' : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div className="admin__bar-end">
            <Link href="/" target="_blank" className="admin__bar-link">ดูหน้าร้าน ↗</Link>
            <form action={logout}>
              <button type="submit" className="admin__bar-link">ออกจากระบบ</button>
            </form>
          </div>
        </div>
      </header>
      {warnings.length > 0 && (
        <div className="admin__warnings">
          {warnings.map((w) => <p key={w} className="admin-note admin-note--warn">{w}</p>)}
        </div>
      )}
      <main className="admin__main">{children}</main>
    </div>
  );
}
