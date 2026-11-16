import { Link } from 'react-router-dom';
import { img } from '../data/images';

export function Logo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <Link to="/" aria-label="Buildabond หน้าแรก" className={`logo${dark ? ' logo--dark' : ''}`}>
      <img src={img.logo} alt="" width={size} height={size} />
      <span>Buildabond</span>
    </Link>
  );
}
