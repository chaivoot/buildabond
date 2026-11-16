import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, sw: number): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});

export const BagIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const MenuIcon = ({ size = 22, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = ({ size = 22, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const CheckIcon = ({ size = 20, strokeWidth = 2, ...p }: P) => (
  <svg {...base(size, Number(strokeWidth))} {...p}><path d="M5 12l5 5L20 7" /></svg>
);
export const ClockIcon = ({ size = 14, ...p }: P) => (
  <svg {...base(size, 2)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const TruckIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></svg>
);
export const SearchIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>
);
export const QrIcon = ({ size = 56, ...p }: P) => (
  <svg {...base(size, 1.4)} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v7h-4M14 18v3" /></svg>
);
export const DownloadIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const UploadIcon = ({ size = 36, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><path d="M12 16V5M7 10l5-5 5 5" /><path d="M5 19h14" /></svg>
);
export const DocIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, 1.6)} {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>
);

/* Larger 40px illustrations used on the home page */
const big = (): SVGProps<SVGSVGElement> => ({
  width: 40, height: 40, viewBox: '0 0 40 40', fill: 'none', stroke: 'var(--link)',
  strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});
export const StrengthIcon = () => (
  <svg {...big()}><path d="M6 30h28" /><path d="M11 30v-8h18v8" /><path d="M20 22V9" /><path d="M15 14l5-5 5 5" /></svg>
);
export const BrainIcon = () => (
  <svg {...big()}><circle cx="20" cy="20" r="13" /><path d="M14 22c2 3 10 3 12 0" /><path d="M15 15h.01M25 15h.01" /></svg>
);
export const HeartIcon = () => (
  <svg {...big()}><path d="M20 32s-11-6.5-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 31 18c0 7.5-11 14-11 14z" /></svg>
);

/* 30px audience icons on the business page */
const aud = (): SVGProps<SVGSVGElement> => ({ ...base(30, 1.5), stroke: 'var(--ink)' });
export const ShopIcon = () => (<svg {...aud()}><path d="M4 10h16l-1-5H5z" /><path d="M5 10v9h14v-9" /><path d="M10 19v-5h4v5" /></svg>);
export const TrainerIcon = () => (<svg {...aud()}><circle cx="9" cy="6" r="2.5" /><path d="M5 20v-6l4-4 3 3h5" /><path d="M17 9v8" /></svg>);
export const VetIcon = () => (<svg {...aud()}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></svg>);
export const GymIcon = () => (<svg {...aud()}><path d="M3 12h3M18 12h3M6 8v8M18 8v8M9 10v4M15 10v4M9 12h6" /></svg>);
