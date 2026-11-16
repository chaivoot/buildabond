# Buildabond storefront

Thai storefront for Buildabond dog fitness equipment: shop, product pages, custom-size calculator, B2B page, cart, checkout with bank transfer / PromptPay, order tracking and an admin order queue.

Built with Vite, React 18, TypeScript and React Router.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/shop?cat=sb\|ip\|tug` | All products, filterable |
| `/products/:slug` | Product page (Place Board has the full template) |
| `/custom` | Made-to-measure price calculator |
| `/business` | Wholesale / dropship |
| `/cart` | Full cart (the header bag icon opens the cart drawer) |
| `/checkout` → `/order-placed` | Checkout and payment instructions |
| `/track` | Order status lookup |
| `/admin` | Admin order queue |

## Structure

- `src/styles/global.css` – design tokens and shared classes (buttons, fields, chips, tags, panels)
- `src/components/` – header, footer, cart drawer, product tile, color picker, qty stepper, status pill
- `src/context/CartContext.tsx` – cart state, weight-based shipping, placed order
- `src/data/` – catalog, shipping tiers, custom-size pricing, demo orders

## Still to confirm / wire up

Search for `TODO` in the source. Main items: real product weights (used for shipping), recommended magnet count, Place Board weight, real customer photos, PromptPay QR generation, and a backend for orders, slips and tracking (everything currently runs on demo data in memory).
