import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import { cartService } from '../../services/api/cartService';
import { addressService } from '../../services/api/addressService';
import { authService } from '../../services/api/authService';
import { couponService } from '../../services/api/couponService';
import { toastService } from '../../services/toast/toastService';
import type { CartResponse, CartItemResponse } from '../../types/cart.types';
import type { ValidateCouponResponse } from '../../types/coupon.types';
import type { Address } from '../../types/address.types';
import styles from './Cart.module.css';

const CART_UPDATED_EVENT = 'cartUpdated';

function triggerCartUpdated(): void {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const navigate = useNavigate();
  const isCustomer = cartService.isCustomer();
  const isLoggedIn = authService.isAuthenticated();
  const userInfo = isLoggedIn ? authService.getUserInfo() : null;

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      setCart({ cartId: 0, items: [], totalItems: 0, subtotal: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!isCustomer || !cart?.items.length) {
      setDefaultAddress(null);
      return;
    }
    let cancelled = false;
    addressService
      .getMyAddresses()
      .then((list) => {
        if (!cancelled) {
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0] ?? null;
          setDefaultAddress(defaultAddr);
        }
      })
      .catch(() => {
        if (!cancelled) setDefaultAddress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isCustomer, cart?.items.length]);

  const handleUpdateQuantity = async (item: CartItemResponse, newQuantity: number) => {
    if (newQuantity < 1) return;
    const maxQty = isCustomer ? item.availableStock : 999;
    if (newQuantity > maxQty) {
      toastService.error(`Maximum available: ${maxQty}`);
      return;
    }
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    try {
      const isGuest = !isCustomer;
      const updated = await cartService.updateQuantity(item.id, newQuantity, isGuest);
      setCart(updated);
      triggerCartUpdated();
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to update quantity');
    }
  };

  const handleQuantityBlur = (item: CartItemResponse) => {
    const raw = qtyInputs[item.id];
    if (raw === undefined) return;
    const parsed = parseInt(raw, 10);
    const maxQty = isCustomer ? item.availableStock : 999;
    const validQty = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, maxQty);
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    if (validQty !== item.quantity) {
      handleUpdateQuantity(item, validQty);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent, item: CartItemResponse) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleRemove = async (item: CartItemResponse) => {
    try {
      const isGuest = !isCustomer;
      const updated = await cartService.removeItem(item.id, isGuest);
      setCart(updated);
      triggerCartUpdated();
      toastService.success('Item removed from cart');
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toastService.error('Enter a coupon code');
      return;
    }
    const subtotal = cart?.subtotal ?? 0;
    if (subtotal <= 0) {
      toastService.error('Add items to cart before applying a coupon');
      return;
    }
    setCouponError(null);
    setCouponLoading(true);
    try {
      const result: ValidateCouponResponse = await couponService.validateCoupon(code, subtotal);
      if (result.valid) {
        setAppliedCoupon({ code: result.code ?? code, discountAmount: result.discountAmount });
        toastService.success(result.message);
      } else {
        setCouponError(result.message);
        setAppliedCoupon(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to validate coupon';
      setCouponError(msg);
      setAppliedCoupon(null);
      toastService.error(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    toastService.success('Coupon removed');
  };

  const handleCheckout = () => {
    if (!cart?.items.length) return;
    if (!isLoggedIn) {
      toastService.info('Please login to proceed to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!isCustomer) {
      toastService.info('Only customers can checkout. Please login with a customer account.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout', {
      state: appliedCoupon ? { couponCode: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount } : undefined,
    });
  };

  if (loading) {
    return (
      <div className={styles.cartPage}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Loading cart...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <div className={styles.cartPage}>
      <Navbar />
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your Cart</h1>
        <p className={styles.pageSubtitle}>
          {isEmpty ? 'Your cart is empty' : `${cart?.totalItems ?? 0} item(s)`}
        </p>
      </header>

      <div className={styles.container}>
        {isEmpty ? (
          <div className={styles.itemsSection}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>Your cart is empty</h2>
              <p className={styles.emptySubtitle}>Add items from the shop to get started.</p>
              <Link to="/products" className={styles.shopLink}>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.itemsSection}>
              <ul className={styles.itemList}>
                {items.map((item) => (
                  <li key={`${item.id}-${item.productId}`} className={styles.cartItem}>
                    <img
                      src={item.imageUrl || '/src/assets/Products/product1.jpg'}
                      alt={item.productName}
                      className={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/Products/product1.jpg';
                      }}
                    />
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.productName}</h3>
                      <div className={styles.itemPrice}>
                        ₹{item.unitPrice.toLocaleString('en-IN')} each
                      </div>
                      {isCustomer && item.quantity > item.availableStock && (
                        <div className={styles.stockWarning}>
                          Only {item.availableStock} available
                        </div>
                      )}
                    </div>
                    <div className={styles.quantityWrap}>
                      <button
                        type="button"
                        className={styles.quantityBtn}
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.quantityInput}
                        value={qtyInputs[item.id] ?? String(item.quantity)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          setQtyInputs((prev) => ({ ...prev, [item.id]: v }));
                        }}
                        onBlur={() => handleQuantityBlur(item)}
                        onKeyDown={(e) => handleQuantityKeyDown(e, item)}
                        onFocus={(e) => {
                          if (qtyInputs[item.id] === undefined) {
                            setQtyInputs((prev) => ({ ...prev, [item.id]: String(item.quantity) }));
                          }
                          e.target.select();
                        }}
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className={styles.quantityBtn}
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={isCustomer && item.quantity >= item.availableStock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.itemSubtotal}>
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemove(item)}
                      aria-label="Remove item"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              {isCustomer && userInfo && (
                <div className={styles.deliverySection}>
                  <div className={styles.deliveryLabel}>Deliver to</div>
                  <div className={styles.deliveryName}>
                    {userInfo.firstName} {userInfo.lastName}
                  </div>
                  {defaultAddress ? (
                    <div className={styles.deliveryAddress}>
                      {[defaultAddress.street, defaultAddress.city, defaultAddress.state, defaultAddress.country, defaultAddress.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  ) : (
                    <div className={styles.deliveryNoAddress}>
                      <Link to="/account">Add a default address</Link> in Account for faster checkout.
                    </div>
                  )}
                </div>
              )}

              <div className={styles.couponSection}>
                <label htmlFor="coupon-input" className={styles.couponLabel}>
                  Have a coupon?
                </label>
                {!appliedCoupon ? (
                  <div className={styles.couponInputRow}>
                    <input
                      id="coupon-input"
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      className={styles.couponInput}
                      disabled={couponLoading}
                      aria-label="Coupon code"
                    />
                    <button
                      type="button"
                      className={styles.couponApplyBtn}
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.couponApplied}>
                    <span className={styles.couponAppliedCode}>{appliedCoupon.code}</span>
                    <span className={styles.couponAppliedSave}>
                      −₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      className={styles.couponRemoveBtn}
                      onClick={handleRemoveCoupon}
                      aria-label="Remove coupon"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && !appliedCoupon && (
                  <p className={styles.couponError} role="alert">
                    {couponError}
                  </p>
                )}
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Items</span>
                <span className={styles.summaryRowValue}>{cart?.totalItems ?? 0}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Subtotal</span>
                <span className={styles.summaryRowValue}>
                  ₹{(cart?.subtotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              {appliedCoupon && (
                <div className={`${styles.summaryRow} ${styles.summaryRowDiscount}`}>
                  <span className={styles.summaryRowLabel}>Discount</span>
                  <span className={styles.summaryRowValue}>
                    −₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>
                  ₹{((cart?.subtotal ?? 0) - (appliedCoupon?.discountAmount ?? 0)).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              {!isLoggedIn && (
                <div className={styles.loginPrompt}>
                  <Link to="/login" state={{ from: '/cart' }}>
                    Login
                  </Link>
                  {' '}to checkout and save your cart.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
