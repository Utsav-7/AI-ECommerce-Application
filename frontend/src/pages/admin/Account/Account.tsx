import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { UserInfo } from '../../../types/auth.types';
import AccountContent from '../../../components/account/AccountContent/AccountContent';
import styles from '../Dashboard/Dashboard.module.css';

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

const AdminAccount: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
      return;
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount; userInfo causes re-run loop
  }, [navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getMe();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account');
      toastService.error(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
  };

  if (!userInfo) return null;

  return (
    <div className={styles.dashboardContainer}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>👥</span>
            Users
          </NavLink>
          <NavLink to="/admin/products" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📦</span>
            Products
          </NavLink>
          <NavLink to="/admin/orders" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🛒</span>
            Orders
          </NavLink>
          <NavLink to="/admin/categories" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📁</span>
            Categories
          </NavLink>
          <NavLink to="/admin/sellers" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🏪</span>
            Sellers
          </NavLink>
          <NavLink to="/admin/coupons" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🎫</span>
            Coupons
          </NavLink>
          <NavLink to="/admin/reports" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📈</span>
            Reports
          </NavLink>
          <NavLink to="/admin/account" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>👤</span>
            Account
          </NavLink>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.navIcon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>My Account</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading your account...</p>
            </div>
          ) : error && !user ? (
            <div className={styles.errorState}>
              <span className={styles.alertIcon}>⚠</span>
              <p>{error}</p>
              <button onClick={fetchUser} className={styles.retryButton}>Try Again</button>
            </div>
          ) : user ? (
            <AccountContent user={user} />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminAccount;
