import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { UserRoleValues } from '../../../types/auth.types';
import styles from './Dashboard.module.css';

// Helper to check if role is Admin (handles both numeric and string)
const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') {
    return role === UserRoleValues.Admin;
  }
  if (typeof role === 'number') {
    return role === 1;
  }
  return false;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  if (!userInfo) {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/admin/dashboard" className={styles.navItem}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link to="/admin/users" className={styles.navItem}>
            <span className={styles.navIcon}>👥</span>
            Users
          </Link>
          <Link to="/admin/products" className={styles.navItem}>
            <span className={styles.navIcon}>📦</span>
            Products
          </Link>
          <Link to="/admin/orders" className={styles.navItem}>
            <span className={styles.navIcon}>🛒</span>
            Orders
          </Link>
          <Link to="/admin/categories" className={styles.navItem}>
            <span className={styles.navIcon}>📁</span>
            Categories
          </Link>
          <Link to="/admin/sellers" className={styles.navItem}>
            <span className={styles.navIcon}>🏪</span>
            Sellers
          </Link>
          <Link to="/admin/coupons" className={styles.navItem}>
            <span className={styles.navIcon}>🎫</span>
            Coupons
          </Link>
          <Link to="/admin/reports" className={styles.navItem}>
            <span className={styles.navIcon}>📈</span>
            Reports
          </Link>
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
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeSection}>
            <h2>Welcome, Administrator!</h2>
            <p className={styles.subtitle}>Manage your e-commerce platform</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3>Users</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>Manage Users</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statContent}>
                <h3>Products</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>Manage Products</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🛒</div>
              <div className={styles.statContent}>
                <h3>Orders</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>View Orders</button>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏪</div>
              <div className={styles.statContent}>
                <h3>Sellers</h3>
                <p className={styles.statNumber}>0</p>
                <button className={styles.statButton}>Manage Sellers</button>
              </div>
            </div>
          </div>

          <div className={styles.managementGrid}>
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3>User Management</h3>
                <span className={styles.badge}>Admin Only</span>
              </div>
              <p>View, edit, and manage all user accounts</p>
              <ul className={styles.featureList}>
                <li>View all users</li>
                <li>Activate/Deactivate accounts</li>
                <li>Change user roles</li>
                <li>View user activity</li>
              </ul>
              <button className={styles.primaryButton}>Go to User Management</button>
            </div>

            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3>Product Management</h3>
                <span className={styles.badge}>Admin Only</span>
              </div>
              <p>Manage all products across the platform</p>
              <ul className={styles.featureList}>
                <li>View all products</li>
                <li>Approve/Reject products</li>
                <li>Edit product details</li>
                <li>Manage categories</li>
              </ul>
              <button className={styles.primaryButton}>Go to Product Management</button>
            </div>

            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3>Order Management</h3>
                <span className={styles.badge}>Admin Only</span>
              </div>
              <p>Monitor and manage all orders</p>
              <ul className={styles.featureList}>
                <li>View all orders</li>
                <li>Update order status</li>
                <li>Process refunds</li>
                <li>Generate reports</li>
              </ul>
              <button className={styles.primaryButton}>Go to Order Management</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
