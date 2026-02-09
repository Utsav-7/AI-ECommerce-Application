import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { orderService } from '../../../services/api/orderService';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import { downloadOrderBillPdf } from '../../../utils/orderBillPdf';
import type { OrderResponse, OrderStatus } from '../../../types/order.types';
import styles from './OrderTracking.module.css';

const STATUS_STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
const CANCELLED: OrderStatus = 'Cancelled';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStepIndex(status: OrderStatus): number {
  if (status === CANCELLED) return -1;
  const idx = STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function isStepCompleted(currentStep: number, index: number): boolean {
  return currentStep >= index;
}

function isStepCurrent(currentStep: number, index: number): boolean {
  return currentStep === index;
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/account/orders');
      return;
    }
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      navigate('/account/orders');
      return;
    }
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    orderService
      .getOrderById(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (!cancelled) {
          toastService.error(e instanceof Error ? e.message : 'Order not found');
          navigate('/account/orders');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className={styles.trackingPage}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading order...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === CANCELLED;

  return (
    <div className={styles.trackingPage}>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <Link to="/account/orders" className={styles.backLink}>← Back to Orders</Link>
            <button
              type="button"
              className={styles.downloadBillBtn}
              onClick={() => downloadOrderBillPdf(order)}
              aria-label="Download bill as PDF"
            >
              Download Bill (PDF)
            </button>
          </div>
          <h1>Order {order.orderNumber}</h1>
          <p>Placed on {formatDate(order.createdAt)}</p>
        </header>

        {!isCancelled && (
          <section className={styles.timelineSection}>
            <h2>Order Status</h2>
            <div className={styles.timeline}>
              <div className={styles.timelineIconsRow}>
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = isStepCompleted(currentStep, index);
                  const isCurrent = isStepCurrent(currentStep, index);
                  return (
                    <div key={step} className={styles.timelineStepWrapper}>
                      <div
                        className={`${styles.stepIcon} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                      >
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`${styles.stepConnector} ${isCompleted ? styles.connectorCompleted : ''}`}
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={styles.timelineLabelsRow}>
                {STATUS_STEPS.map((step) => (
                  <div key={step} className={styles.stepLabel}>
                    <strong>{step}</strong>
                    {step === 'Shipped' && order.shippedDate && (
                      <span className={styles.stepDate}>{formatDate(order.shippedDate)}</span>
                    )}
                    {step === 'Delivered' && order.deliveredDate && (
                      <span className={styles.stepDate}>{formatDate(order.deliveredDate)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {order.trackingNumber && (
              <div className={styles.trackingInfo}>
                <span>Tracking #:</span>
                <strong>{order.trackingNumber}</strong>
              </div>
            )}
          </section>
        )}

        {isCancelled && (
          <section className={styles.cancelledBanner}>
            <span>This order has been cancelled.</span>
          </section>
        )}

        <section className={styles.detailsSection}>
          <h2>Delivery Address</h2>
          <p className={styles.address}>{order.shippingAddress}</p>
        </section>

        <section className={styles.itemsSection}>
          <h2>Order Items</h2>
          <ul className={styles.itemList}>
            {order.items.map((item) => (
              <li key={item.id} className={styles.itemRow}>
                <img
                  src={item.imageUrl || '/src/assets/Products/product1.jpg'}
                  alt={item.productName}
                  className={styles.itemImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/Products/product1.jpg';
                  }}
                />
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemQty}>Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemTotal}>₹{item.totalAmount.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{order.subTotal.toLocaleString('en-IN')}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className={`${styles.summaryRow} ${styles.discount}`}>
              <span>Discount</span>
              <span>−₹{order.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
