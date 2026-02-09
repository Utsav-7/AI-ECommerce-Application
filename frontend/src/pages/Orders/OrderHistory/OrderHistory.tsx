import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { orderService } from '../../../services/api/orderService';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { OrderResponse } from '../../../types/order.types';
import styles from './OrderHistory.module.css';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Shipped: '#8b5cf6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className={styles.orderHistoryPage}>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1>Your Orders</h1>
          <p>Track and manage your order history</p>
          <Link to="/account" className={styles.backLink}>← Back to Account</Link>
        </header>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>When you place orders, they will appear here.</p>
            <Link to="/products" className={styles.shopLink}>Start Shopping</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className={styles.orderCard}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderLabel}>Order Placed</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderLabel}>Total</span>
                    <span className={styles.orderTotal}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderLabel}>Order #{order.orderNumber}</span>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: `${STATUS_COLORS[order.status] ?? '#6b7280'}20`, color: STATUS_COLORS[order.status] ?? '#6b7280' }}
                    >
                      {order.statusDisplay}
                    </span>
                  </div>
                </div>
                <div className={styles.orderItems}>
                  {order.items.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.imageUrl || '/src/assets/Products/product1.jpg'}
                      alt={item.productName}
                      className={styles.itemThumb}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/Products/product1.jpg';
                      }}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <span className={styles.moreItems}>+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.trackLink}>Track order →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
