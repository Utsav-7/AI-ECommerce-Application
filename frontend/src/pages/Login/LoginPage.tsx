import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import Login from '../../components/auth/Login/Login';
import { authService } from '../../services/api/authService';
import { getDashboardPathByUserInfo } from '../../utils/routeHelpers';
import loginPageImage from '../../assets/Login_Page_Img.png';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = (userInfo?: any) => {
    // Use provided userInfo or get from localStorage
    const finalUserInfo = userInfo || authService.getUserInfo();
    if (finalUserInfo) {
      const dashboardPath = getDashboardPathByUserInfo(finalUserInfo);
      navigate(dashboardPath);
    } else {
      // Fallback to home if userInfo is not available
      navigate('/');
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div className={styles.loginPageContainer}>
      <Navbar />
      <div className={styles.loginPageContent}>
        <div className={styles.loginSection}>
          <div className={styles.loginFormWrapper}>
            <Login 
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </div>
        </div>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img 
              src={loginPageImage} 
              alt="Welcome to E-Commerce" 
              className={styles.loginImage}
            />
            <div className={styles.imageOverlay}>
              <h2 className={styles.overlayTitle}>Welcome Back!</h2>
              <p className={styles.overlayText}>
                Sign in to continue your shopping experience and discover amazing products.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
