'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';
import type { ShopSettings } from '../lib/types';
import { CartDrawer } from './CartDrawer';

export function Providers({ settings, children }: { settings: ShopSettings; children: ReactNode }) {
  return (
    <SettingsProvider value={settings}>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </SettingsProvider>
  );
}
