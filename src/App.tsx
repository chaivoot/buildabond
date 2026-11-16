import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { AdminPage } from './pages/AdminPage';
import { BusinessPage } from './pages/BusinessPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomPage } from './pages/CustomPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderPlacedPage } from './pages/OrderPlacedPage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { TrackPage } from './pages/TrackPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/custom" element={<CustomPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-placed" element={<OrderPlacedPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CartDrawer />
    </>
  );
}
