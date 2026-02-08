import { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { authService } from '../../../services/api/authService';
import { userService } from '../../../services/api/userService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { DashboardStats } from '../../../types/user.types';
import styles from './Dashboard.module.css';

const POLL_INTERVAL_MS = 30000;

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

const CHART_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await userService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(fetchStats, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (!userInfo) {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
  };

  const barChartData = stats
    ? [
        { name: 'Users', value: stats.totalUsers, fill: CHART_COLORS[0] },
        { name: 'Sellers', value: stats.totalSellers, fill: CHART_COLORS[1] },
        { name: 'Products', value: stats.totalProducts, fill: CHART_COLORS[2] },
        { name: 'Categories', value: stats.totalCategories, fill: CHART_COLORS[3] },
        { name: 'Coupons', value: stats.totalCoupons, fill: CHART_COLORS[4] },
      ]
    : [];

  const pieChartData = stats
    ? [
        { name: 'Users', value: stats.totalUsers },
        { name: 'Sellers', value: stats.totalSellers },
        { name: 'Products', value: stats.totalProducts },
        { name: 'Categories', value: stats.totalCategories },
        { name: 'Coupons', value: stats.totalCoupons },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className={styles.dashboardContainer}>
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
          <NavLink to="/admin/categories" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📁</span>
            Categories
          </NavLink>
          <NavLink to="/admin/sellers" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🏪</span>
            Sellers
          </NavLink>
          <NavLink to="/admin/coupons" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🎫</span>
            Coupons
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

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <span className={styles.liveBadge}>● Live</span>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeSection}>
            <h2>Welcome, Administrator!</h2>
            <p className={styles.subtitle}>Manage your e-commerce platform · Data refreshes every 30s</p>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <span className={styles.alertIcon}>⚠️</span>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchStats}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {stats && stats.pendingSellers > 0 && (
                <div className={styles.alertBanner}>
                  <span>⚠️ {stats.pendingSellers} seller(s) awaiting approval</span>
                  <Link to="/admin/users?tab=pending" className={styles.alertLink}>
                    Review now →
                  </Link>
                </div>
              )}

              <div className={styles.statsGrid}>
                <Link to="/admin/users" className={styles.statCardLink}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statContent}>
                      <h3>Users</h3>
                      <p className={styles.statNumber}>{stats?.totalUsers ?? 0}</p>
                      <span className={styles.statLink}>Manage Users →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/admin/products" className={styles.statCardLink}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statContent}>
                      <h3>Products</h3>
                      <p className={styles.statNumber}>{stats?.totalProducts ?? 0}</p>
                      <span className={styles.statLink}>Manage Products →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/admin/categories" className={styles.statCardLink}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>📁</div>
                    <div className={styles.statContent}>
                      <h3>Categories</h3>
                      <p className={styles.statNumber}>{stats?.totalCategories ?? 0}</p>
                      <span className={styles.statLink}>Manage Categories →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/admin/sellers" className={styles.statCardLink}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏪</div>
                    <div className={styles.statContent}>
                      <h3>Sellers</h3>
                      <p className={styles.statNumber}>{stats?.totalSellers ?? 0}</p>
                      <span className={styles.statLink}>Manage Sellers →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/admin/coupons" className={styles.statCardLink}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎫</div>
                    <div className={styles.statContent}>
                      <h3>Coupons</h3>
                      <p className={styles.statNumber}>{stats?.totalCoupons ?? 0}</p>
                      <span className={styles.statLink}>Manage Coupons →</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Overview Statistics</h3>
                  <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#4a5568', fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                          formatter={(value: number | undefined) => [value ?? 0, 'Count']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {pieChartData.length > 0 && (
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribution</h3>
                    <div className={styles.chartWrapper}>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieChartData.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number | undefined) => [value ?? 0, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.managementGrid}>
                <Link to="/admin/users" className={styles.managementCardLink}>
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
                      <li>Approve seller applications</li>
                    </ul>
                    <span className={styles.primaryButton}>Go to User Management →</span>
                  </div>
                </Link>

                <Link to="/admin/products" className={styles.managementCardLink}>
                  <div className={styles.managementCard}>
                    <div className={styles.cardHeader}>
                      <h3>Product Management</h3>
                      <span className={styles.badge}>Admin Only</span>
                    </div>
                    <p>Manage all products across the platform</p>
                    <ul className={styles.featureList}>
                      <li>View all products</li>
                      <li>Toggle product status</li>
                      <li>Edit product details</li>
                      <li>Manage visibility</li>
                    </ul>
                    <span className={styles.primaryButton}>Go to Product Management →</span>
                  </div>
                </Link>

                <Link to="/admin/categories" className={styles.managementCardLink}>
                  <div className={styles.managementCard}>
                    <div className={styles.cardHeader}>
                      <h3>Category Management</h3>
                      <span className={styles.badge}>Admin Only</span>
                    </div>
                    <p>Organize products with categories</p>
                    <ul className={styles.featureList}>
                      <li>View all categories</li>
                      <li>Create new categories</li>
                      <li>Edit category details</li>
                      <li>Upload category images</li>
                    </ul>
                    <span className={styles.primaryButton}>Go to Categories →</span>
                  </div>
                </Link>

                <Link to="/admin/coupons" className={styles.managementCardLink}>
                  <div className={styles.managementCard}>
                    <div className={styles.cardHeader}>
                      <h3>Coupon Management</h3>
                      <span className={styles.badge}>Admin Only</span>
                    </div>
                    <p>Create and manage discount coupons</p>
                    <ul className={styles.featureList}>
                      <li>View all coupons</li>
                      <li>Create new coupons</li>
                      <li>Set discount types</li>
                      <li>Manage validity periods</li>
                    </ul>
                    <span className={styles.primaryButton}>Go to Coupons →</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
