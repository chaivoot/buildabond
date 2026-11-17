'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';
import type { Locale } from '../i18n/config';
import { LocaleProvider } from '../i18n/LocaleProvider';
import type { ShopSettings } from '../lib/types';
import { CartDrawer } from './CartDrawer';

export function Providers({ lang, settings, children }: { lang: Locale; settings: ShopSettings; children: ReactNode }) {
  return (
    <LocaleProvider lang={lang}>
      <SettingsProvider value={settings}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </SettingsProvider>
    </LocaleProvider>
  );
}
