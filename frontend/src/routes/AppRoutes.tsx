import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop/ScrollToTop';
import Home from '../pages/Home/Home';
import Products from '../pages/Products/Products';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import UserDashboard from '../pages/user/Dashboard/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard/Dashboard';
import AdminCoupons from '../pages/admin/Coupons/Coupons';
import AdminCategories from '../pages/admin/Categories/Categories';
import AdminUsers from '../pages/admin/Users/Users';
import AdminProducts from '../pages/admin/Products/Products';
import AdminAccount from '../pages/admin/Account/Account';
import AdminOrders from '../pages/admin/Orders/Orders';
import SellerDashboard from '../pages/seller/Dashboard/Dashboard';
import SellerAccount from '../pages/seller/Account/Account';
import SellerInventory from '../pages/seller/Inventory/Inventory';
import SellerOrders from '../pages/seller/Orders/Orders';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage';
import Account from '../pages/Account/Account';
import AboutUs from '../pages/AboutUs/AboutUs';
import ContactUs from '../pages/ContactUs/ContactUs';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import OrderHistory from '../pages/Orders/OrderHistory/OrderHistory';
import OrderTracking from '../pages/Orders/OrderTracking/OrderTracking';
import GuestRoute from './GuestRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import CustomerRoute from './CustomerRoute';
import AdminLayout from '../components/layout/AdminLayout/AdminLayout';
import SellerLayout from '../components/layout/SellerLayout/SellerLayout';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Guest-only: Home, Login, Register - redirect to dashboard if logged in */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Home />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />

        {/* Public Routes - no auth required */}
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <CustomerRoute>
              <Checkout />
            </CustomerRoute>
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Customer-only: /account, /user/dashboard */}
        <Route
          path="/account"
          element={
            <CustomerRoute>
              <Account />
            </CustomerRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <CustomerRoute>
              <UserDashboard />
            </CustomerRoute>
          }
        />
        <Route
          path="/account/orders"
          element={
            <CustomerRoute>
              <OrderHistory />
            </CustomerRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <CustomerRoute>
              <OrderTracking />
            </CustomerRoute>
          }
        />

        {/* Admin-only routes - shared layout with same sidebar */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="account" element={<AdminAccount />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Seller-only routes - shared layout with same sidebar */}
        <Route
          path="/seller"
          element={
            <SellerRoute>
              <SellerLayout />
            </SellerRoute>
          }
        >
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="account" element={<SellerAccount />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

