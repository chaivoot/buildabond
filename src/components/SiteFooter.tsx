import { Link } from 'react-router-dom';
import { css } from '../data/style';

export function SiteFooter() {
  return (
    <footer className="on-dark">
      <div className="container" style={{ paddingTop: 72, paddingBottom: 40, paddingInline: 20 }}>
        <p className="display" style={{ fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: 1.1, letterSpacing: 0 }}>
          Build a Bond.
          <br />
          Move, Play &amp; Grow Together.
        </p>
        <div className="auto-grid footer-cols" style={css({ '--min': '150px', '--gap': '28px', marginTop: 48, fontSize: 15 })}>
          <div className="footer-col">
            <p>สินค้า</p>
            <Link to="/shop?cat=sb">Strength &amp; Balance</Link>
            <Link to="/shop?cat=ip">Interactive Play</Link>
            <Link to="/shop?cat=tug">Tug Toys</Link>
            <Link to="/custom">สั่งทำขนาดพิเศษ</Link>
          </div>
          <div className="footer-col">
            <p>ช่วยเหลือ</p>
            <Link to="/track">ติดตามออร์เดอร์</Link>
            <Link to="/products/place-board#faq">การจัดส่ง</Link>
            <Link to="/business">สำหรับธุรกิจ</Link>
          </div>
          <div className="footer-col">
            <p>ติดต่อเรา</p>
            {/* TODO: replace with the shop's real social URLs */}
            <a href="https://line.me/">LINE</a>
            <a href="https://www.facebook.com/">Facebook</a>
            <a href="https://www.instagram.com/">Instagram</a>
          </div>
        </div>
        <p style={{ marginTop: 48, fontSize: 13, color: 'var(--on-dark-3)' }}>© 2026 Buildabond Active Play &amp; Fitness</p>
      </div>
    </footer>
  );
}
