import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../../services/api/authService';
import { productService } from '../../../services/api/productService';
import { inventoryService } from '../../../services/api/inventoryService';
import { reportService } from '../../../services/api/reportService';
import { UserRoleValues } from '../../../types/auth.types';
import type { SellerInventoryStats } from '../../../types/inventory.types';
import { SellerReportSection } from '../../../components/common/ReportSection';
import styles from './Dashboard.module.css';

const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Seller;
  if (typeof role === 'number') return role === 2;
  return false;
};

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  const reportSectionRef = useRef<HTMLDivElement>(null);
  const [productCount, setProductCount] = useState(0);
  const [inventoryStats, setInventoryStats] = useState<SellerInventoryStats | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isSellerRole(userInfo?.role)) {
      navigate('/');
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const to = new Date();
        const from = new Date(to);
        from.setDate(from.getDate() - 90);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);

        const [productsResult, invStats, reportResult] = await Promise.all([
          productService.getMyProductsPaged({ page: 1, pageSize: 1, signal }),
          inventoryService.getSellerStats(signal),
          reportService.getSellerReport(from, to),
        ]);
        if (!cancelled) {
          setProductCount(productsResult.totalRecords);
          setInventoryStats(invStats);
          setTotalOrders(reportResult.totalOrders);
          setTotalRevenue(reportResult.totalRevenue);
        }
      } catch (err) {
        if (!axios.isCancel(err) && !cancelled) {
          setProductCount(0);
          setInventoryStats(null);
          setTotalOrders(0);
          setTotalRevenue(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount after auth check
  }, []);

  if (!userInfo) return null;

  return (
    <div className={styles.pageWrapper}>
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
            <Link to="/seller/products" className={styles.statCardLink}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statContent}>
                  <h3>Total Products</h3>
                  <p className={styles.statNumber}>{loading ? '...' : productCount}</p>
                  <span className={styles.statLink}>View Products →</span>
                </div>
              </div>
            </Link>

            <Link to="/seller/orders" className={styles.statCardLink}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🛒</div>
                <div className={styles.statContent}>
                  <h3>Total Orders</h3>
                  <p className={styles.statNumber}>{loading ? '...' : totalOrders}</p>
                  <span className={styles.statLink}>View Orders →</span>
                </div>
              </div>
            </Link>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>Total Revenue</h3>
                <p className={styles.statNumber}>
                  {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
                </p>
                <span className={styles.statLinkMuted}>Last 90 days</span>
              </div>
            </div>

            <Link to="/seller/inventory" className={styles.statCardLink}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📋</div>
                <div className={styles.statContent}>
                  <h3>Inventory</h3>
                  <p className={styles.statNumber}>
                    {loading ? '...' : inventoryStats ? `${inventoryStats.totalItems} Units` : '0'}
                  </p>
                  <span className={styles.statLink}>Manage Inventory →</span>
                </div>
              </div>
            </Link>
          </div>

          <div ref={reportSectionRef}>
            <SellerReportSection />
          </div>

          {inventoryStats && inventoryStats.lowStockCount > 0 && (
            <div className={styles.alertBanner}>
              <span>⚠️ {inventoryStats.lowStockCount} product(s) are low on stock</span>
              <Link to="/seller/inventory" className={styles.alertLink}>
                View inventory →
              </Link>
            </div>
          )}

          <div className={styles.actionsGrid}>
            <Link to="/seller/products" className={styles.actionCardLink}>
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
                <span className={styles.primaryButton}>Manage Products →</span>
              </div>
            </Link>

            <Link to="/seller/inventory" className={styles.actionCardLink}>
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
                <span className={styles.primaryButton}>Manage Inventory →</span>
              </div>
            </Link>

            <Link to="/seller/orders" className={styles.actionCardLink}>
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
                <span className={styles.primaryButton}>View Orders →</span>
              </div>
            </Link>

            <button
              type="button"
              className={styles.actionCardLink}
              onClick={() => reportSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className={styles.actionCard}>
                <div className={styles.cardHeader}>
                  <h3>Sales Reports</h3>
                  <span className={styles.badge}>Seller</span>
                </div>
                <p>Analyze your sales performance</p>
                <ul className={styles.featureList}>
                  <li>View sales statistics</li>
                  <li>Track revenue trends</li>
                  <li>Download reports (CSV)</li>
                  <li>Product performance</li>
                </ul>
                <span className={styles.primaryButton}>View Reports →</span>
              </div>
            </button>
          </div>
        </div>
    </div>
  );
};

export default SellerDashboard;
