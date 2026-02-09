import { useEffect } from 'react';
import type { OrderResponse } from '../../../types/order.types';
import { API_BASE_URL } from '../../../utils/constants';
import styles from './OrderDetailModal.module.css';

function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://'))
    return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface OrderDetailModalProps {
  order: OrderResponse | null;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (order) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [order]);

  if (!order) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Order {order.orderNumber}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          {/* Order Details */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Order Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Customer</span>
                <span className={styles.detailValue}>{order.customerName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{order.customerEmail}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formatDate(order.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status</span>
                <span className={styles.statusBadge} data-status={order.status}>
                  {order.statusDisplay}
                </span>
              </div>
              {order.shippingAddress && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Shipping</span>
                  <span className={styles.detailValue}>{order.shippingAddress}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tracking #</span>
                  <span className={styles.detailValue}>{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </section>

          {/* Product Images */}
          {order.items?.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Products</h3>
              <div className={styles.itemsGrid}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemImageWrap}>
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.productName}
                          className={styles.itemImage}
                        />
                      ) : (
                        <svg className={styles.itemImagePlaceholder} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.productName}</p>
                      <p className={styles.itemMeta}>Qty: {item.quantity} · ₹{item.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bill */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Bill Summary</h3>
            <table className={styles.billTable}>
              <tbody>
                <tr>
                  <td className={styles.billLabel}>Subtotal</td>
                  <td className={styles.billValue}>₹{order.subTotal.toLocaleString('en-IN')}</td>
                </tr>
                {order.discountAmount != null && order.discountAmount > 0 && (
                  <tr>
                    <td className={styles.billLabel}>Discount</td>
                    <td className={styles.billValue}>- ₹{order.discountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {order.couponCode && (
                  <tr>
                    <td className={styles.billLabel}>Coupon</td>
                    <td className={styles.billValue}>{order.couponCode}</td>
                  </tr>
                )}
                {order.taxAmount != null && order.taxAmount > 0 && (
                  <tr>
                    <td className={styles.billLabel}>Tax</td>
                    <td className={styles.billValue}>₹{order.taxAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td className={styles.billLabel}>Total</td>
                  <td className={styles.billValue}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
