import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { isPersistent } from '../../../server/db';
import { AdminShell } from '../../../views/admin/AdminShell';

export const metadata: Metadata = { title: 'หลังบ้าน', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AdminShell
      warnings={[
        !isPersistent() && 'ยังไม่ได้เชื่อมฐานข้อมูล: การแก้ไขจะหายเมื่อเซิร์ฟเวอร์รีสตาร์ต ไปที่ Vercel → Storage → เพิ่ม Neon แล้วเชื่อมกับโปรเจกต์นี้',
        !process.env.BLOB_READ_WRITE_TOKEN && 'ยังไม่ได้เชื่อม Vercel Blob: รูปที่อัปโหลดจะถูกเก็บในฐานข้อมูลแทน (ใช้ได้ แต่ช้ากว่า) ไปที่ Vercel → Storage → เพิ่ม Blob',
      ].filter((w): w is string => !!w)}
    >
      {children}
    </AdminShell>
  );
}
