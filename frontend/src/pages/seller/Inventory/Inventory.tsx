import { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { inventoryService } from '../../../services/api/inventoryService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { InventoryItem, SellerInventoryStats } from '../../../types/inventory.types';
import styles from '../Dashboard/Dashboard.module.css';
import inventoryStyles from './Inventory.module.css';

const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Seller;
  if (typeof role === 'number') return role === 2;
  return false;
};

const SellerInventory: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<SellerInventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, statsData] = await Promise.all([
        inventoryService.getSellerInventory(),
        inventoryService.getSellerStats(),
      ]);
      setInventory(invData);
      setStats(statsData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(msg);
      toastService.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isSellerRole(userInfo?.role)) {
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount after auth check
  }, []);

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
  };

  if (!userInfo) return null;

  return (
    <div className={styles.dashboardContainer}>
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

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Inventory Management</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={inventoryStyles.pageHeader}>
            <div>
              <h2>Your Inventory</h2>
              <p className={styles.subtitle}>Stock levels for your products</p>
            </div>
            <Link to="/seller/products" className={inventoryStyles.addButton}>
              Manage Products
            </Link>
          </div>

          {stats && (
            <div className={inventoryStyles.statsRow}>
              <div className={inventoryStyles.statBox}>
                <span className={inventoryStyles.statValue}>{stats.totalProducts}</span>
                <span className={inventoryStyles.statLabel}>Products</span>
              </div>
              <div className={inventoryStyles.statBox}>
                <span className={inventoryStyles.statValue}>{stats.totalItems}</span>
                <span className={inventoryStyles.statLabel}>Total Units</span>
              </div>
              <div className={`${inventoryStyles.statBox} ${stats.lowStockCount > 0 ? inventoryStyles.lowStock : ''}`}>
                <span className={inventoryStyles.statValue}>{stats.lowStockCount}</span>
                <span className={inventoryStyles.statLabel}>Low Stock</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading inventory...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <span className={styles.alertIcon}>⚠️</span>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchData}>
                Retry
              </button>
            </div>
          ) : inventory.length === 0 ? (
            <div className={inventoryStyles.emptyState}>
              <p>No inventory records found.</p>
              <p>Add products to start tracking inventory.</p>
              <Link to="/seller/products" className={inventoryStyles.addButton}>
                Go to Products
              </Link>
            </div>
          ) : (
            <div className={inventoryStyles.tableWrapper}>
              <table className={inventoryStyles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th>Low Stock Alert</th>
                    <th>Last Restocked</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className={item.isLowStock ? inventoryStyles.lowStockRow : ''}>
                      <td>
                        <Link to={`/products`} className={inventoryStyles.productLink}>
                          {item.productName}
                        </Link>
                      </td>
                      <td>{item.stockQuantity}</td>
                      <td>{item.reservedQuantity}</td>
                      <td>{item.availableQuantity}</td>
                      <td>
                        <span className={item.isLowStock ? inventoryStyles.alertBadge : inventoryStyles.okBadge}>
                          {item.isLowStock ? `≤ ${item.lowStockThreshold}` : 'OK'}
                        </span>
                      </td>
                      <td>
                        {item.lastRestockedDate
                          ? new Date(item.lastRestockedDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerInventory;
