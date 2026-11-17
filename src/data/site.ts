/** The live domain. Production uses it for canonical links, link previews and the sitemap. */
const PRODUCTION_URL = 'https://www.build-a-bond.com';

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production') return PRODUCTION_URL;
  // Preview deployments point at themselves so their links work; local dev uses localhost.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const SITE = {
  name: 'Buildabond',
  tagline: 'Active Play & Fitness',
  description: 'อุปกรณ์ฟิตเนสและของเล่นฝึกสุนัขจากไทย ชวนคนกับหมาออกมาขยับ เรียนรู้ และเล่นด้วยกันมากขึ้น',
  url: siteUrl(),
};
