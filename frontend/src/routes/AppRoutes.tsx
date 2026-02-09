import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import SellerDashboard from '../pages/seller/Dashboard/Dashboard';
import SellerAccount from '../pages/seller/Account/Account';
import SellerInventory from '../pages/seller/Inventory/Inventory';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage';
import Account from '../pages/Account/Account';
import AboutUs from '../pages/AboutUs/AboutUs';
import ContactUs from '../pages/ContactUs/ContactUs';
import Cart from '../pages/Cart/Cart';
import GuestRoute from './GuestRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import CustomerRoute from './CustomerRoute';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
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

        {/* Admin-only routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/account"
          element={
            <AdminRoute>
              <AdminAccount />
            </AdminRoute>
          }
        />

        {/* Seller-only routes */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <SellerRoute>
              <AdminProducts />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <SellerRoute>
              <SellerInventory />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/account"
          element={
            <SellerRoute>
              <SellerAccount />
            </SellerRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

