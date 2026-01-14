import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../../components/auth/ForgotPassword/ForgotPassword';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (email: string) => {
    // Navigate to reset password page with email in query params
    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <ForgotPassword
          onSuccess={handleSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

