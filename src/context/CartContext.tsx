import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { img } from '../data/images';
import { shippingFee, shippingTier } from '../data/shipping';

export interface CartItem {
  id: string;
  name: string;
  /** Selected options, e.g. "ฟ้า · แม่เหล็ก 4 ชิ้น" */
  opt: string;
  status: string;
  unitPrice: number;
  kg: number;
  img: string;
  qty: number;
}

export interface PlacedOrder {
  id: string;
  total: number;
  phone: string;
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
  lastOrder: PlacedOrder | null;
  placeOrder: (phone: string) => PlacedOrder;
}

const MAX_QTY = 9;

/** Demo contents so the cart, checkout and order pages have something to show. */
const DEMO_CART: CartItem[] = [
  { id: 'place-board|ฟ้า · แม่เหล็ก 4 ชิ้น', name: 'Place Board', opt: 'ฟ้า · แม่เหล็ก 4 ชิ้น', status: 'พร้อมส่ง · ทำผิวยาง 3-5 วัน', unitPrice: 2590, kg: 3.5, img: img.placeBoard, qty: 1 },
  { id: 'target-box-10|ส้ม', name: 'Target Box 10 cm', opt: 'ส้ม', status: 'พร้อมส่ง · ทำผิวยาง 3-5 วัน', unitPrice: 1690, kg: 2.6, img: img.targetBox, qty: 1 },
  { id: 'flirt-pole-m|เหยื่อชมพู', name: 'Flirt Pole M', opt: 'เหยื่อชมพู', status: 'พร้อมส่ง', unitPrice: 890, kg: 0.6, img: img.flirtPole, qty: 1 },
];

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(DEMO_CART);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);

  const add = useCallback<CartState['add']>((item, qty = 1) => {
    const id = `${item.name}|${item.opt}`;
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
    const shipping = shippingFee(kg);
    const total = subtotal + shipping;
    return {
      items, count, subtotal, kg, tier: shippingTier(kg), shipping, total,
      add, setQty, remove, clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      lastOrder,
      placeOrder: (phone: string) => {
        // TODO: replace with the real order API; the id format follows BB-YYMMDD-NNNN.
        const d = new Date();
        const ymd = [d.getFullYear() % 100, d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('');
        const order = { id: `BB-${ymd}-0042`, total, phone };
        setLastOrder(order);
        return order;
      },
    };
  }, [items, drawerOpen, lastOrder, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
