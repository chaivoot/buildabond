import type { Metadata } from 'next';
import { adminConfigured } from '../../../lib/auth';
import { LoginView } from '../../../views/admin/LoginView';

export const metadata: Metadata = { title: 'เข้าสู่ระบบหลังบ้าน', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  return <LoginView configured={adminConfigured()} />;
}
