'use client';

import Image from 'next/image';
import Link from 'next/link';
import { img } from '../data/images';
import { useI18n } from '../i18n/LocaleProvider';

export function Logo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <Link href="/" aria-label={t.common.homeAria} className={`logo${dark ? ' logo--dark' : ''}`}>
      <Image src={img.logo} alt="" width={size} height={size} priority />
      <span>Buildabond</span>
    </Link>
  );
}
