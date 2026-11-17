/** Checkout details the customer chose to remember. Stored only in their own browser. */
export interface SavedCustomer {
  name: string;
  phone: string;
  email: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
}

const KEY = 'bb-customer-v1';
export const CUSTOMER_FIELDS: (keyof SavedCustomer)[] = ['name', 'phone', 'email', 'street', 'subdistrict', 'district', 'province', 'postcode'];

export function loadCustomer(): SavedCustomer | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return v && typeof v === 'object' && typeof v.email === 'string' ? (v as SavedCustomer) : null;
  } catch {
    return null;
  }
}

export function saveCustomer(c: SavedCustomer | null) {
  try {
    if (c) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: nothing to remember */
  }
}
