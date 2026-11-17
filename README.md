# Buildabond storefront

Thai storefront for Buildabond dog fitness equipment: shop, product pages, custom-size calculator, B2B page, cart, checkout with bank transfer / PromptPay, order tracking and an admin order queue.

Built with Next.js 15 (App Router), React 19 and TypeScript. Deploys to Vercel with no extra config.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Product pages are prerendered at build time with their own title, description and Open Graph image. `sitemap.xml` and `robots.txt` are generated. Set `NEXT_PUBLIC_SITE_URL` in Vercel once a custom domain is attached so link previews and the sitemap use it.

## Setup on Vercel

| What | How | Without it |
| --- | --- | --- |
| Database | Vercel → Storage → **Neon** → connect to this project (sets `DATABASE_URL`) | Falls back to an in-memory database: the site works, but admin edits and orders are lost on restart |
| Image uploads | Vercel → Storage → **Blob** → connect (sets `BLOB_READ_WRITE_TOKEN`) | Uploaded slips and product photos are stored inside the database |
| Admin password | Environment variable `ADMIN_PASSWORD` | `/admin` can't be opened |
| Site URL | `NEXT_PUBLIC_SITE_URL`, once a custom domain is attached | Link previews and the sitemap use the `.vercel.app` domain |

Server functions run in Singapore (`sin1`, set in `vercel.json`). Create the Neon database in Singapore too (AWS ap-southeast-1) so queries stay in the same region.

Redeploy after adding variables. Tables are created and filled with the demo content automatically the first time the site talks to an empty database.

## Languages

The storefront is in English and Thai; the admin is Thai only.

- First visit: Thailand (Vercel's `x-vercel-ip-country` header) gets Thai, everyone else English. The choice is kept in the `lang` cookie, and the TH / EN button in the header switches it.
- URLs stay the same (`/shop`). Middleware (`src/middleware.ts`) serves them from the prebuilt `/en/...` or `/th/...` page, which are also real URLs for search engines (with hreflang links and a bilingual sitemap).
- UI text lives in `src/i18n/th.ts` and `src/i18n/en.ts`; TypeScript makes sure both have the same keys.
- Product copy: Thai in the main fields, English in the product's English section in the admin (empty English fields fall back to Thai).

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/shop?cat=sb\|ip\|tug` | All products, filterable |
| `/products/:slug` | Product page |
| `/custom` | Made-to-measure price calculator and quote request |
| `/business` | Wholesale / dropship and lead form |
| `/cart` | Full cart (the header bag icon opens the cart drawer) |
| `/checkout` → `/order-placed?id=…&k=…` | Checkout, then payment page with PromptPay QR and slip upload |
| `/track` | Order status lookup (order number + phone) |
| `/admin` | Admin: orders, products, requests, shop settings (password protected) |

## Structure

- `src/app/` – routes, layout (fonts via `next/font`), metadata, sitemap, robots
- `src/views/` – page bodies; `src/views/admin/` for the admin
- `src/server/` – database (`db.ts`), queries per table, server actions, uploads
- `src/lib/` – shared logic: types, pricing, shipping tiers, PromptPay payload, admin auth
- `src/data/seed.ts` – demo catalogue, orders and requests loaded into an empty database
- `src/styles/global.css` – design tokens and shared classes

Prices are always recomputed on the server when an order is placed, so the cart can't change what a customer pays.

## Still to confirm

Real product weights (used for shipping), the recommended magnet count, Place Board's weight, real customer photos, and the TH/EN language toggle (not built yet).
