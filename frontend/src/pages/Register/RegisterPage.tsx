import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import SignUp from '../../components/auth/SignUp/SignUp';
import { authService } from '../../services/api/authService';
import { getDashboardPathByUserInfo } from '../../utils/routeHelpers';
import registrationPageImage from '../../assets/Registration_Page_Img.png';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    const userInfo = authService.getUserInfo();
    const dashboardPath = getDashboardPathByUserInfo(userInfo);
    navigate(dashboardPath);
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.registerPageContainer}>
      <Navbar />
      <div className={styles.registerPageContent}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img 
              src={registrationPageImage} 
              alt="Join E-Commerce" 
              className={styles.registerImage}
            />
            <div className={styles.imageOverlay}>
              <h2 className={styles.overlayTitle}>Join Us Today!</h2>
              <p className={styles.overlayText}>
                Create your account and start shopping from thousands of amazing products.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.registerSection}>
          <div className={styles.registerFormWrapper}>
            <SignUp 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
