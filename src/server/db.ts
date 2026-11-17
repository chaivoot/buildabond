import { SEED_CUSTOMERS, SEED_EN, SEED_ORDERS, SEED_PRODUCTS, SEED_REQUESTS, SEED_SETTINGS } from '../data/seed';

/**
 * Tiny SQL layer.
 * - With DATABASE_URL (set by the Neon integration on Vercel) it talks to Neon Postgres.
 * - Without it, it falls back to an in-memory Postgres (PGlite) so local dev and builds
 *   work out of the box. That fallback is NOT persistent; the admin shows a warning.
 * Tables are created and seeded with demo content automatically on first use.
 */
interface Driver {
  query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;
  persistent: boolean;
}

const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const isPersistent = () => databaseUrl() !== '';

async function connect(): Promise<Driver> {
  const url = databaseUrl();
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    return {
      persistent: true,
      query: async <T,>(text: string, params: unknown[] = []) => (await sql.query(text, params)) as T[],
    };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const pg = new PGlite();
  return {
    persistent: false,
    query: async <T,>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows,
  };
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS products (
    slug text PRIMARY KEY,
    sort integer NOT NULL DEFAULT 0,
    cat text NOT NULL,
    name text NOT NULL,
    th text NOT NULL DEFAULT '',
    price_label text NOT NULL DEFAULT '',
    price integer NOT NULL DEFAULT 0,
    kg real NOT NULL DEFAULT 0,
    img text NOT NULL DEFAULT '',
    cover boolean NOT NULL DEFAULT false,
    badge text NOT NULL DEFAULT '',
    coming_soon boolean NOT NULL DEFAULT false,
    custom boolean NOT NULL DEFAULT false,
    colors jsonb NOT NULL DEFAULT '[]',
    colors_label text NOT NULL DEFAULT '',
    swatches_label text NOT NULL DEFAULT '',
    magnets boolean NOT NULL DEFAULT false,
    sku text NOT NULL DEFAULT '',
    stock text NOT NULL DEFAULT 'ready',
    visible boolean NOT NULL DEFAULT true,
    detail jsonb NOT NULL DEFAULT '{}',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY,
    access_key text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL DEFAULT '',
    note text NOT NULL DEFAULT '',
    items jsonb NOT NULL,
    subtotal integer NOT NULL,
    shipping integer NOT NULL,
    total integer NOT NULL,
    kg real NOT NULL,
    status text NOT NULL,
    slip_url text NOT NULL DEFAULT '',
    slip_at timestamptz,
    confirmed_at timestamptz,
    shipped_at timestamptz,
    carrier text NOT NULL DEFAULT '',
    tracking text NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS requests (
    id text PRIMARY KEY,
    kind text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'ใหม่',
    name text NOT NULL DEFAULT '',
    contact text NOT NULL DEFAULT '',
    data jsonb NOT NULL DEFAULT '{}'
  )`,
  `CREATE SEQUENCE IF NOT EXISTS order_seq START 43`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS en jsonb NOT NULL DEFAULT '{}'`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT ''`,
  `CREATE TABLE IF NOT EXISTS customers (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    phone text NOT NULL UNIQUE,
    name text NOT NULL DEFAULT '',
    street text NOT NULL DEFAULT '',
    subdistrict text NOT NULL DEFAULT '',
    district text NOT NULL DEFAULT '',
    province text NOT NULL DEFAULT '',
    postcode text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lookup_attempts (ip text NOT NULL, at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS lookup_attempts_ip_at ON lookup_attempts (ip, at)`,
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id text`,
  `CREATE INDEX IF NOT EXISTS orders_customer_id ON orders (customer_id)`,
  `CREATE TABLE IF NOT EXISTS customer_events (
    id text PRIMARY KEY,
    customer_id text NOT NULL,
    at timestamptz NOT NULL DEFAULT now(),
    kind text NOT NULL,
    old_value text NOT NULL DEFAULT '',
    new_value text NOT NULL DEFAULT '',
    order_id text
  )`,
  `CREATE INDEX IF NOT EXISTS customer_events_customer ON customer_events (customer_id, at)`,
];

const json = (v: unknown) => JSON.stringify(v);

/**
 * Copy fixes for databases seeded by an earlier version.
 * Each only applies while the text is still the old seed value, so admin edits are never overwritten.
 */
const CONTENT_FIXES: [slug: string, from: string, to: string][] = [
  ['target-box', 'กล่องยืน สูง 6 / 10 cm', 'สูง 6 / 10 cm'],
  ['slant-box', 'ฐานเอียง 15° / 20°', 'มุมเอียง 15° / 20°'],
];

/** Links unlinked orders to customers by email or phone, and gives each customer a "created" history entry. */
async function linkOrders(d: Driver) {
  await d.query(
    `UPDATE orders o SET customer_id = c.id FROM customers c
     WHERE o.customer_id IS NULL
       AND ((o.email <> '' AND lower(o.email) = c.email) OR regexp_replace(o.phone, '[^0-9]', '', 'g') = c.phone)`,
  );
  // A customer dates from their first order, even when the order is older than the customer record.
  await d.query(
    `UPDATE customers c SET created_at = o.first FROM (SELECT customer_id, min(created_at) AS first FROM orders GROUP BY customer_id) o
     WHERE o.customer_id = c.id AND o.first < c.created_at`,
  );
  await d.query(
    `INSERT INTO customer_events (id, customer_id, at, kind, new_value)
     SELECT 'created-' || c.id, c.id, c.created_at, 'created', c.name FROM customers c
     ON CONFLICT (id) DO UPDATE SET at = LEAST(customer_events.at, EXCLUDED.at)`,
  );
}

async function normalizeSavedPhones(d: Driver) {
  const { formatPhone, isThaiPhone, normalizePhone } = await import('../lib/phone');
  for (const o of await d.query<{ id: string; phone: string }>(`SELECT id, phone FROM orders`)) {
    const fixed = isThaiPhone(o.phone) ? formatPhone(o.phone) : o.phone;
    if (fixed !== o.phone) await d.query(`UPDATE orders SET phone = $2 WHERE id = $1`, [o.id, fixed]);
  }
  for (const c of await d.query<{ id: string; phone: string }>(`SELECT id, phone FROM customers`)) {
    const fixed = normalizePhone(c.phone);
    if (fixed !== c.phone) {
      // Skip if another customer already has this number (unique); the admin can merge by hand.
      await d.query(`UPDATE customers SET phone = $2 WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM customers WHERE phone = $2)`, [c.id, fixed]);
    }
  }
}

/** Runs `fn` once per database, the first time a server sees the marker missing. */
async function once(d: Driver, marker: string, fn: () => Promise<void>) {
  const claimed = await d.query(`INSERT INTO settings (key, value) VALUES ($1, 'true') ON CONFLICT (key) DO NOTHING RETURNING key`, [marker]);
  if (claimed.length) await fn();
}

async function migrate(d: Driver) {
  for (const stmt of SCHEMA) await d.query(stmt);
  await once(d, 'migration:names-1', async () => {
    for (const [slug, from, to] of CONTENT_FIXES) {
      await d.query(`UPDATE products SET th = $3 WHERE slug = $1 AND th = $2`, [slug, from, to]);
    }
  });
  // Demo customer so the email + phone address lookup can be tried right away.
  await once(d, 'migration:customers-1', async () => {
    for (const c of SEED_CUSTOMERS) {
      await d.query(
        `INSERT INTO customers (id, email, phone, name, street, subdistrict, district, province, postcode)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
        [c.id, c.email, c.phone, c.name, c.street, c.subdistrict, c.district, c.province, c.postcode],
      );
    }
  });
  // Link orders placed before customer history existed, by email or phone.
  await once(d, 'migration:customer-links-1', () => linkOrders(d));
  // Phone numbers saved before they were normalised (e.g. "+660818890911"): store them as 081-234-5678 / digits.
  await once(d, 'migration:phones-1', () => normalizeSavedPhones(d));
  // Target Box and Slant Box take magnets too (as an optional add-on, like Place Board).
  await once(d, 'migration:magnets-1', async () => {
    await d.query(`UPDATE products SET magnets = true WHERE slug IN ('target-box', 'slant-box')`);
  });
  // English copy for products seeded before the site was bilingual (only where none has been entered).
  await once(d, 'migration:en-1', async () => {
    for (const [slug, en] of Object.entries(SEED_EN)) {
      await d.query(`UPDATE products SET en = $2 WHERE slug = $1 AND en = '{}'::jsonb`, [slug, json(en)]);
    }
  });

  // Seed exactly once: whoever inserts the marker row does the seeding.
  const claimed = await d.query(`INSERT INTO settings (key, value) VALUES ('seeded', 'true') ON CONFLICT (key) DO NOTHING RETURNING key`);
  if (claimed.length === 0) return;
  // A fresh database gets the current seed, so the one-off content migrations don't apply.
  await d.query(`INSERT INTO settings (key, value) VALUES ('migration:names-1', 'true'), ('migration:en-1', 'true') ON CONFLICT (key) DO NOTHING`);

  await d.query(`INSERT INTO settings (key, value) VALUES ('shop', $1) ON CONFLICT (key) DO NOTHING`, [json(SEED_SETTINGS)]);
  for (const p of SEED_PRODUCTS) {
    await d.query(
      `INSERT INTO products (slug, sort, cat, name, th, price_label, price, kg, img, cover, badge, coming_soon, custom, colors,
        colors_label, swatches_label, magnets, sku, stock, visible, detail, en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.sort, p.cat, p.name, p.th, p.priceLabel, p.price, p.kg, p.img, p.cover, p.badge, p.comingSoon, p.custom, json(p.colors),
        p.colorsLabel, p.swatchesLabel, p.magnets, p.sku, p.stock, p.visible, json(p.detail), json(p.en)],
    );
  }
  for (const o of SEED_ORDERS) {
    await d.query(
      `INSERT INTO orders (id, access_key, created_at, name, phone, address, note, items, subtotal, shipping, total, kg, status,
        slip_url, slip_at, confirmed_at, shipped_at, carrier, tracking)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (id) DO NOTHING`,
      [o.id, 'demo', o.createdAt, o.name, o.phone, o.address, o.note, json(o.items), o.subtotal, o.shipping, o.total, o.kg, o.status,
        o.slipUrl, o.slipAt, o.confirmedAt, o.shippedAt, o.carrier, o.tracking],
    );
  }
  for (const r of SEED_REQUESTS) {
    await d.query(
      `INSERT INTO requests (id, kind, created_at, status, name, contact, data) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.kind, r.createdAt, r.status, r.name, r.contact, json(r.data)],
    );
  }
  await linkOrders(d);
}

// Kept on globalThis: Next.js may load this module more than once in a single server process
// (pages and server actions are bundled separately), and the in-memory fallback must be shared.
const g = globalThis as typeof globalThis & { __bbDb?: Promise<Driver> | null };

function driver(): Promise<Driver> {
  g.__bbDb ??= connect()
    .then(async (d) => {
      await migrate(d);
      return d;
    })
    .catch((err) => {
      g.__bbDb = null; // retry on the next request
      throw err;
    });
  return g.__bbDb;
}

/** Run a parameterised query and return the rows. */
export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await driver()).query<T>(text, params);
}

export { json as toJson };
