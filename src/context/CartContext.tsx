'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartLineInput } from '../lib/pricing';
import { shippingFee, shippingTier } from '../lib/shipping';
import { useShopSettings } from './SettingsContext';

export interface CartItem extends CartLineInput {
  id: string;
  name: string;
  /** Selected options, e.g. "ฟ้า · แม่เหล็ก 4 ชิ้น" */
  opt: string;
  status: string;
  unitPrice: number;
  kg: number;
  img: string;
}

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

/** Demo contents so the cart and checkout have something to show. Prices match the seed catalogue. */
const DEMO_CART: CartItem[] = [
  { id: 'place-board|ฟ้า · แม่เหล็ก 4 ชิ้น', slug: 'place-board', color: 0, magnets: 4, name: 'Place Board', opt: 'ฟ้า · แม่เหล็ก 4 ชิ้น', status: 'พร้อมส่ง · ทำผิวยาง 3-5 วัน', unitPrice: 2590, kg: 3.5, img: '/images/place-board.jpg', qty: 1 },
  { id: 'target-box|ส้ม', slug: 'target-box', color: 1, name: 'Target Box', opt: 'ส้ม', status: 'พร้อมส่ง · ทำผิวยาง 3-5 วัน', unitPrice: 1590, kg: 2.6, img: '/images/target-box.jpg', qty: 1 },
  { id: 'flirt-pole|ชมพู', slug: 'flirt-pole', color: 2, name: 'Flirt Pole', opt: 'ชมพู', status: 'พร้อมส่ง', unitPrice: 790, kg: 0.6, img: '/images/flirt-pole.jpg', qty: 1 },
];

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const settings = useShopSettings();
  const [items, setItems] = useState<CartItem[]>(DEMO_CART);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const add = useCallback<CartState['add']>((item, qty = 1) => {
    const id = `${item.slug}|${item.opt}`;
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
