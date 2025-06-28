import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import WhatsAppButton from "./components/layout/WhatsAppButton";

import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Wishlist from "./pages/Wishlist";
import CustomerService from "./pages/CustomerService";
import ContactUs from "./pages/ContactUs";
import ShippingInfo from "./pages/ShippingInfo";
import ReturnsExchanges from "./pages/ReturnsExchanges";
import SizeGuide from "./pages/SizeGuide";
import FAQ from "./pages/FAQ";
import CareInstructions from "./pages/CareInstructions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";
import OrderManagement from "./pages/admin/OrderManagement";
import ShippingManagement from "./pages/admin/ShippingManagement";
import ManualShipping from "./pages/admin/ManualShipping";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WhatsAppButton />
          <ScrollToTop />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:category" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/shipping-info" element={<ShippingInfo />} />
            <Route path="/returns-exchanges" element={<ReturnsExchanges />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/care-instructions" element={<CareInstructions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/products" element={
              <AdminRoute>
                <ProductManagement />
              </AdminRoute>
            } />
            <Route path="/admin/products/new" element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            } />
            <Route path="/admin/products/:id/edit" element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <OrderManagement />
              </AdminRoute>
            } />
            <Route path="/admin/shipping" element={
              <AdminRoute>
                <ShippingManagement />
              </AdminRoute>
            } />
            <Route path="/admin/manual-shipping" element={
              <AdminRoute>
                <ManualShipping />
              </AdminRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;