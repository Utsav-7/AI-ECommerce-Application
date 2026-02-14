import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { orderService } from '../../../services/api/orderService';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { OrderResponse, OrderStatus } from '../../../types/order.types';
import styles from './OrderHistory.module.css';

const STATUS_FILTERS: { value: 'All' | OrderStatus; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Shipped: '#8b5cf6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

const STATUS_ICONS: Record<string, string> = {
  Pending: '⏳',
  Confirmed: '✓',
  Shipped: '📦',
  Delivered: '✅',
  Cancelled: '✕',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function OrderCardSkeleton() {
  return (
    <div className={styles.orderCardSkeleton}>
      <div className={styles.skeletonRow}>
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonText} style={{ width: '30%' }} />
      </div>
      <div className={styles.skeletonRow}>
        <div className={styles.skeletonThumbs} />
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonText} style={{ width: '60%' }} />
          <div className={styles.skeletonText} style={{ width: '40%' }} />
        </div>
      </div>
      <div className={styles.skeletonRow}>
        <div className={styles.skeletonBtn} />
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const user = authService.getUserInfo();
    if (user?.role !== 'User') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [navigate, loadOrders]);

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className={styles.orderHistoryPage}>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <nav className={styles.breadcrumb}>
            <Link to="/account" className={styles.breadcrumbLink}>
              Account
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Orders</span>
          </nav>
          <h1 className={styles.pageTitle}>Your Orders</h1>
          <p className={styles.pageSubtitle}>
            Track, view details, and manage your order history
          </p>
        </header>

        {loading ? (
          <div className={styles.ordersList}>
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>When you place orders, they will appear here.</p>
            <Link to="/products" className={styles.shopLink}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <div className={styles.tabs}>
                {STATUS_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.tab} ${statusFilter === value ? styles.tabActive : ''}`}
                    onClick={() => setStatusFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className={styles.resultCount}>
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredOrders.length === 0 ? (
              <div className={styles.emptyFilterState}>
                <p>No orders with status &quot;{statusFilter}&quot;.</p>
                <button
                  type="button"
                  className={styles.clearFilterBtn}
                  onClick={() => setStatusFilter('All')}
                >
                  Show all orders
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {filteredOrders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div
                      className={styles.orderCardAccent}
                      style={{
                        backgroundColor: STATUS_COLORS[order.status] ?? '#6b7280',
                      }}
                    />
                    <div className={styles.orderCardBody}>
                      <div className={styles.orderCardTop}>
                        <div className={styles.orderIdBlock}>
                          <span className={styles.orderLabel}>Order</span>
                          <span className={styles.orderNumber}>
                            #{order.orderNumber}
                          </span>
                        </div>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: `${STATUS_COLORS[order.status] ?? '#6b7280'}18`,
                            color: STATUS_COLORS[order.status] ?? '#6b7280',
                          }}
                        >
                          <span className={styles.statusIcon}>
                            {STATUS_ICONS[order.status] ?? '•'}
                          </span>
                          {order.statusDisplay}
                        </span>
                      </div>
                      <div className={styles.orderCardMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Placed</span>
                          <span className={styles.metaValue}>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Items</span>
                          <span className={styles.metaValue}>
                            {order.items.length} item
                            {order.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Total</span>
                          <span className={styles.orderTotal}>
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className={styles.orderCardItems}>
                        {order.items.slice(0, 4).map((item) => (
                          <img
                            key={item.id}
                            src={item.imageUrl || '/src/assets/Products/product1.jpg'}
                            alt={item.productName}
                            className={styles.itemThumb}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/src/assets/Products/product1.jpg';
                            }}
                          />
                        ))}
                        {order.items.length > 4 && (
                          <span className={styles.moreItems}>
                            +{order.items.length - 4}
                          </span>
                        )}
                      </div>
                      <div className={styles.orderCardFooter}>
                        <Link
                          to={`/orders/${order.id}`}
                          className={styles.viewOrderBtn}
                        >
                          View order
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
