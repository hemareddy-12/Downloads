import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WatermarkBackground } from './components/common/WatermarkBackground';
import { CartDrawer } from './components/cart/CartDrawer';
import { ScrollToTop } from './components/common/ScrollToTop';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomStitchingPage } from './pages/CustomStitchingPage';
import { CreationsPage } from './pages/CreationsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCreations } from './pages/admin/AdminCreations';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminBrandSettings } from './pages/admin/AdminBrandSettings';
import { AdminWebsiteSettings } from './pages/admin/AdminWebsiteSettings';
import { AdminStitching } from './pages/admin/AdminStitching';
import { AdminAbout } from './pages/admin/AdminAbout';
import { AdminContact } from './pages/admin/AdminContact';
import { AdminDesignerProfile } from './pages/admin/AdminDesignerProfile';

// App Content Wrapper to conditionally render customer vs admin headers
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Watermark (Operates in root behind content with pointer-events-none) */}
      <WatermarkBackground />

      {/* Customer Header & Cart Drawer */}
      {!isAdminRoute && (
        <>
          <Navbar />
          <CartDrawer />
        </>
      )}

      {/* Main Routed View */}
      <div className="flex-1 relative z-10">
        <Routes>
          {/* Customer Facing Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/creations" element={<CreationsPage />} />
          <Route path="/my-creations" element={<CreationsPage />} />
          <Route path="/stitching" element={<CustomStitchingPage />} />
          <Route path="/custom-stitching" element={<CustomStitchingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="creations" element={<AdminCreations />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="stitching" element={<AdminStitching />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="brand-settings" element={<AdminBrandSettings />} />
            <Route path="website-settings" element={<AdminWebsiteSettings />} />
            <Route path="designer-profile" element={<AdminAbout />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* Customer Footer */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <BrandProvider>
          <ProductProvider>
            <CartProvider>
              <ScrollToTop />
              <AppContent />
            </CartProvider>
          </ProductProvider>
        </BrandProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
