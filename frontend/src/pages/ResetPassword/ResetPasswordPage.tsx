import ResetPassword from '../../components/auth/ResetPassword/ResetPassword';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <ResetPassword />
      </div>
    </div>
  );
};

export default ResetPasswordPage;

