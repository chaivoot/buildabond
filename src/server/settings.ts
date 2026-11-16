import { SEED_SETTINGS } from '../data/seed';
import type { ShopSettings } from '../lib/types';
import { sql, toJson } from './db';

export async function getSettings(): Promise<ShopSettings> {
  const rows = await sql<{ value: Partial<ShopSettings> }>(`SELECT value FROM settings WHERE key = 'shop'`);
  return { ...SEED_SETTINGS, ...(rows[0]?.value ?? {}) };
}

export async function saveSettings(s: ShopSettings): Promise<void> {
  await sql(`INSERT INTO settings (key, value) VALUES ('shop', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [toJson(s)]);
}
