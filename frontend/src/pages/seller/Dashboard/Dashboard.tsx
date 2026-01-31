import { useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import styles from './Dashboard.module.css';

// Helper to check if role is Seller (handles both numeric and string)
const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') {
    return role === UserRoleValues.Seller;
  }
  if (typeof role === 'number') {
    return role === 2;
  }
  return false;
};

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    if (!authService.isAuthenticated() || !isSellerRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  if (!userInfo) {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Seller Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <NavLink to="/seller/dashboard" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/seller/products" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📦</span>
            Products
          </NavLink>
          <NavLink to="/seller/inventory" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📋</span>
            Inventory
          </NavLink>
          <NavLink to="/seller/orders" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🛒</span>
            Orders
          </NavLink>
          <NavLink to="/seller/sales" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>💰</span>
            Sales
          </NavLink>
          <NavLink to="/seller/reports" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📈</span>
            Reports
          </NavLink>
          <NavLink to="/seller/settings" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>⚙️</span>
            Settings
          </NavLink>
          <NavLink to="/seller/account" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
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
          <h1 className={styles.pageTitle}>Seller Dashboard</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeSection}>
            <h2>Welcome, {userInfo.firstName}!</h2>
            <p className={styles.subtitle}>Manage your store and products</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statContent}>
                <h3>Total Products</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>View Products</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🛒</div>
              <div className={styles.statContent}>
                <h3>Total Orders</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>View Orders</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>Total Revenue</h3>
                <p className={styles.statNumber}>₹0</p>
                <button className={styles.statButton}>View Earnings</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3>Inventory</h3>
                <p className={styles.statNumber}>0 Items</p>
                <button className={styles.statButton}>Manage Inventory</button>
              </div>
            </div>
          </div>

          <div className={styles.actionsGrid}>
            <div className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <h3>Product Management</h3>
                <span className={styles.badge}>Seller</span>
              </div>
              <p>Manage your product catalog</p>
              <ul className={styles.featureList}>
                <li>Add new products</li>
                <li>Edit existing products</li>
                <li>Update product images</li>
                <li>Set pricing and discounts</li>
              </ul>
              <button className={styles.primaryButton}>Manage Products</button>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <h3>Inventory Management</h3>
                <span className={styles.badge}>Seller</span>
              </div>
              <p>Track and manage your inventory</p>
              <ul className={styles.featureList}>
                <li>View stock levels</li>
                <li>Update quantities</li>
                <li>Set low stock alerts</li>
                <li>Track inventory history</li>
              </ul>
              <button className={styles.primaryButton}>Manage Inventory</button>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <h3>Order Management</h3>
                <span className={styles.badge}>Seller</span>
              </div>
              <p>Process and track your orders</p>
              <ul className={styles.featureList}>
                <li>View pending orders</li>
                <li>Update order status</li>
                <li>Process shipments</li>
                <li>Handle returns</li>
              </ul>
              <button className={styles.primaryButton}>View Orders</button>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <h3>Sales Reports</h3>
                <span className={styles.badge}>Seller</span>
              </div>
              <p>Analyze your sales performance</p>
              <ul className={styles.featureList}>
                <li>View sales statistics</li>
                <li>Track revenue trends</li>
                <li>Export reports</li>
                <li>Product performance</li>
              </ul>
              <button className={styles.primaryButton}>View Reports</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
