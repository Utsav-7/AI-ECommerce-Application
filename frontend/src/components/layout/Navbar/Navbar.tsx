import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { getDashboardPathByUserInfo } from '../../../utils/routeHelpers';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const userInfo = isAuthenticated ? authService.getUserInfo() : null;
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const getUserInitial = () => {
    if (userInfo?.firstName) {
      return userInfo.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (userInfo) {
      return `${userInfo.firstName} ${userInfo.lastName}`;
    }
    return 'User';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#667eea"/>
            <path d="M16 8L20 14H12L16 8Z" fill="white"/>
            <path d="M10 16L14 22H6L10 16Z" fill="white"/>
            <path d="M22 16L26 22H18L22 16Z" fill="white"/>
          </svg>
          <span>E-Commerce</span>
        </Link>

        <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <Link to="/" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
            Products
          </Link>
          <Link to="/about" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to={userInfo ? getDashboardPathByUserInfo(userInfo) : '/user/dashboard'} 
                className={styles.menuItem}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className={styles.userMenuContainer} ref={userMenuRef}>
                <button 
                  className={styles.userAvatarBtn}
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                >
                  <div className={styles.userAvatar}>
                    {getUserInitial()}
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <div className={styles.userDropdownAvatar}>
                        {getUserInitial()}
                      </div>
                      <div className={styles.userDropdownInfo}>
                        <div className={styles.userDropdownName}>{getUserName()}</div>
                        <div className={styles.userDropdownEmail}>{userInfo?.email}</div>
                      </div>
                    </div>
                    <div className={styles.userDropdownDivider}></div>
                    <Link 
                      to="/user/account" 
                      className={styles.userDropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>👤</span> Account
                    </Link>
                    <Link 
                      to="/user/orders" 
                      className={styles.userDropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>📦</span> Orders
                    </Link>
                    <Link 
                      to="/user/help" 
                      className={styles.userDropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>❓</span> Help & Support
                    </Link>
                    <div className={styles.userDropdownDivider}></div>
                    <button 
                      className={styles.userDropdownItem}
                      onClick={handleLogout}
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={styles.loginBtn}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={styles.registerBtn}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button 
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
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
