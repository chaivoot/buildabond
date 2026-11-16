import Image from 'next/image';
import Link from 'next/link';
import { img } from '../data/images';

export function Logo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <Link href="/" aria-label="Buildabond หน้าแรก" className={`logo${dark ? ' logo--dark' : ''}`}>
      <Image src={img.logo} alt="" width={size} height={size} priority />
      <span>Buildabond</span>
    </Link>
  );
}
