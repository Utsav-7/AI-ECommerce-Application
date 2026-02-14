import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { cartService } from '../../../services/api/cartService';
import { toastService } from '../../../services/toast/toastService';
import { getDashboardPathByUserInfo, getAccountPathByUserInfo, getOrdersPathByUserInfo } from '../../../utils/routeHelpers';
import { UserRoleValues } from '../../../types/auth.types';
import styles from './Navbar.module.css';

const CART_UPDATED_EVENT = 'cartUpdated';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const userInfo = isAuthenticated ? authService.getUserInfo() : null;
  const isCustomer = isAuthenticated && userInfo?.role === UserRoleValues.User;
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadCartCount = async () => {
    const count = await cartService.getCartCount();
    setCartCount(count);
  };

  useEffect(() => {
    loadCartCount();
  }, []);

  useEffect(() => {
    const handler = () => loadCartCount();
    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const getUserInitial = () => {
    if (userInfo?.firstName) return userInfo.firstName.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserName = () => {
    if (userInfo) return `${userInfo.firstName} ${userInfo.lastName}`;
    return 'User';
  };

  const navLinks = isCustomer
    ? [
        { to: '/products', label: 'Products' },
        { to: '/cart', label: 'Cart', badge: cartCount },
        { to: getOrdersPathByUserInfo(userInfo), label: 'Orders' },
        { to: getAccountPathByUserInfo(userInfo), label: 'Account' },
        { to: '/contact', label: 'Contact' },
        { to: '/about', label: 'About' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
        { to: '/cart', label: 'Cart', badge: cartCount },
      ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenus}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M16 8L20 14H12L16 8Z" fill="white" opacity="0.9"/>
              <path d="M10 16L14 22H6L10 16Z" fill="white" opacity="0.9"/>
              <path d="M22 16L26 22H18L22 16Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className={styles.logoText}>E-Commerce</span>
        </Link>

        <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
          {navLinks.map(({ to, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={styles.menuItem}
              onClick={closeMenus}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <span className={styles.cartBadge} aria-label={`${badge} items in cart`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}

          {isAuthenticated && userInfo && (
            <>
              {!isCustomer && (
                <>
                  <Link
                    to={getDashboardPathByUserInfo(userInfo)}
                    className={styles.menuItem}
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={getAccountPathByUserInfo(userInfo)}
                    className={styles.menuItem}
                    onClick={closeMenus}
                  >
                    Account
                  </Link>
                  <Link
                    to={getOrdersPathByUserInfo(userInfo)}
                    className={styles.menuItem}
                    onClick={closeMenus}
                  >
                    Orders
                  </Link>
                </>
              )}

              <div className={styles.userMenuContainer} ref={userMenuRef}>
                <button
                  className={styles.userAvatarBtn}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className={styles.userAvatar}>{getUserInitial()}</div>
                </button>
                {isUserMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <div className={styles.userDropdownAvatar}>{getUserInitial()}</div>
                      <div className={styles.userDropdownInfo}>
                        <div className={styles.userDropdownName}>{getUserName()}</div>
                        <div className={styles.userDropdownEmail}>{userInfo?.email}</div>
                      </div>
                    </div>
                    <div className={styles.userDropdownDivider} />
                    <button className={styles.userDropdownItem} onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className={styles.loginBtn} onClick={closeMenus}>
                Login
              </Link>
              <Link to="/register" className={styles.registerBtn} onClick={closeMenus}>
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className={`${styles.menuToggle} ${isMenuOpen ? styles.menuToggleOpen : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
