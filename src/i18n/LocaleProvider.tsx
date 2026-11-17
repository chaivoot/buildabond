'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from './config';
import { getDict, type Dict } from './index';

const LocaleContext = createContext<{ lang: Locale; t: Dict } | null>(null);

export function LocaleProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={{ lang, t: getDict(lang) }}>{children}</LocaleContext.Provider>;
}

/** Current language and its dictionary. */
export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useI18n must be used inside <LocaleProvider>');
  return ctx;
}
