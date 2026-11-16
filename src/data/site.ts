export const SITE = {
  name: 'Buildabond',
  tagline: 'Active Play & Fitness',
  description: 'อุปกรณ์ฟิตเนสและของเล่นฝึกสุนัขจากไทย ชวนคนกับหมาออกมาขยับ เรียนรู้ และเล่นด้วยกันมากขึ้น',
  /** Set NEXT_PUBLIC_SITE_URL in Vercel once a custom domain is attached. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
};
