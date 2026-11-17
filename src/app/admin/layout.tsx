import type { ReactNode } from 'react';
import { fontVariables } from '../fonts';
import '../../styles/global.css';

/** The admin is its own root layout (Thai only, no storefront providers). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
