'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { parseCart, type CartItem } from '../lib/cartItem';
import { shippingFee, shippingTier } from '../lib/shipping';
import { useShopSettings } from './SettingsContext';

export type { CartItem };

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  kg: number;
  tier: number;
  shipping: number;
  total: number;
  add: (item: Omit<CartItem, 'id' | 'qty'>, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const MAX_QTY = 9;
const STORAGE_KEY = 'bb-cart-v2';

/** Demo contents shown until the visitor changes the cart. Prices match the seed catalogue. */
const lineId = (i: Omit<CartItem, 'id' | 'qty'>) =>
  [i.slug, i.color ?? 0, i.magnets ?? 0, i.custom ? `${i.custom.w}x${i.custom.l}x${i.custom.h}` : ''].join('|');

const DEMO_CART: CartItem[] = ([
  { slug: 'place-board', color: 0, magnets: 4, colorTh: 'ฟ้า', name: 'Place Board', kind: 'readyFinish', unitPrice: 2590, kg: 3.5, img: '/images/place-board.jpg', qty: 1 },
  { slug: 'target-box', color: 1, colorTh: 'ส้ม', name: 'Target Box', kind: 'readyFinish', unitPrice: 1590, kg: 2.6, img: '/images/target-box.jpg', qty: 1 },
  { slug: 'flirt-pole', color: 2, colorTh: 'ชมพู', name: 'Flirt Pole', kind: 'ready', unitPrice: 790, kg: 0.6, img: '/images/flirt-pole.jpg', qty: 1 },
] as Omit<CartItem, 'id'>[]).map((i) => ({ ...i, id: lineId(i) }));

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const settings = useShopSettings();
  const [items, setItems] = useState<CartItem[]>(DEMO_CART);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The cart lives in the browser so it survives reloads and language switches.
  useEffect(() => {
    try {
      const saved = parseCart(localStorage.getItem(STORAGE_KEY));
      if (saved) setItems(saved);
    } catch {
      /* storage blocked: keep the in-memory cart */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const add = useCallback<CartState['add']>((item, qty = 1) => {
    const id = lineId(item);
    setItems((prev) => {
      const hit = prev.find((i) => i.id === id);
      if (hit) return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
      return [...prev, { ...item, id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i)));
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(() => {
    let subtotal = 0;
    let kg = 0;
    let count = 0;
    for (const i of items) {
      subtotal += i.unitPrice * i.qty;
      kg += i.kg * i.qty;
      count += i.qty;
    }
    kg = Math.round(kg * 10) / 10;
    const shipping = shippingFee(kg, settings.shipping);
    return {
      items, count, subtotal, kg, tier: shippingTier(kg, settings.shipping), shipping, total: subtotal + shipping,
      add, setQty, remove, clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [items, drawerOpen, settings.shipping, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
