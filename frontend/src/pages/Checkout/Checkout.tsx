import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import { cartService } from '../../services/api/cartService';
import { addressService } from '../../services/api/addressService';
import { orderService } from '../../services/api/orderService';
import { authService } from '../../services/api/authService';
import { toastService } from '../../services/toast/toastService';
import type { CartResponse, CartItemResponse } from '../../types/cart.types';
import type { Address } from '../../types/address.types';
import styles from './Checkout.module.css';

const CART_UPDATED_EVENT = 'cartUpdated';

function triggerCartUpdated(): void {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

interface CheckoutLocationState {
  couponCode?: string;
  discountAmount?: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutLocationState | undefined;
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const isCustomer = cartService.isCustomer();
  const isLoggedIn = authService.isAuthenticated();
  const couponFromCart = state?.couponCode ? { code: state.couponCode, discountAmount: state.discountAmount ?? 0 } : null;

  const loadData = useCallback(async () => {
    if (!isCustomer) return;
    try {
      setLoading(true);
      const [cartData, addrList] = await Promise.all([
        cartService.getCart(),
        addressService.getMyAddresses(),
      ]);
      setCart(cartData);
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.isDefault) ?? addrList[0];
      setSelectedAddressId(defaultAddr?.id ?? null);
    } catch {
      setCart({ cartId: 0, items: [], totalItems: 0, subtotal: 0 });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (!isLoggedIn || !isCustomer) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    loadData();
  }, [isLoggedIn, isCustomer, navigate, loadData]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !cart?.items.length || placing) return;
    setPlacing(true);
    try {
      const order = await orderService.placeOrder({
        addressId: selectedAddressId,
        couponCode: couponFromCart?.code,
      });
      triggerCartUpdated();
      toastService.success(`Order placed successfully! Order #${order.orderNumber}`);
      navigate(`/orders/${order.id}`, { state: { order } });
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.checkoutPage}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Loading checkout...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;
  const subtotal = cart?.subtotal ?? 0;
  const discount = couponFromCart?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  if (isEmpty) {
    return (
      <div className={styles.checkoutPage}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checkout.</p>
            <Link to="/products" className={styles.shopLink}>Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <Navbar />
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Checkout</h1>
        <p className={styles.pageSubtitle}>Review your order and place it</p>
      </header>

      <div className={styles.container}>
        <div className={styles.checkoutContent}>
          <div className={styles.mainSection}>
            <section className={styles.addressSection}>
              <h2>Delivery Address</h2>
              {addresses.length === 0 ? (
                <div className={styles.noAddress}>
                  <p>No saved addresses. Please add one in your account.</p>
                  <Link to="/account">Manage Addresses</Link>
                </div>
              ) : (
                <ul className={styles.addressList}>
                  {addresses.map((addr) => (
                    <li key={addr.id} className={styles.addressItem}>
                      <label className={styles.addressLabel}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <span className={styles.addressText}>
                          {[addr.street, addr.city, addr.state, addr.country, addr.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                          {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.itemsSection}>
              <h2>Order Items</h2>
              <ul className={styles.itemList}>
                {items.map((item: CartItemResponse) => (
                  <li key={`${item.id}-${item.productId}`} className={styles.checkoutItem}>
                    <img
                      src={item.imageUrl || '/src/assets/Products/product1.jpg'}
                      alt={item.productName}
                      className={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/Products/product1.jpg';
                      }}
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.productName}</span>
                      <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemSubtotal}>
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={styles.summaryCard}>
            <h2>Order Summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Discount</span>
                <span>−₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              className={styles.placeOrderBtn}
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || placing}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
