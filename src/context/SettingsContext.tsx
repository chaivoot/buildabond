'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ShopSettings } from '../lib/types';

const SettingsContext = createContext<ShopSettings | null>(null);

export function SettingsProvider({ value, children }: { value: ShopSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useShopSettings(): ShopSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useShopSettings must be used inside <SettingsProvider>');
  return ctx;
}
