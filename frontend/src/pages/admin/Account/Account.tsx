import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { UserInfo } from '../../../types/auth.types';
import AccountContent from '../../../components/account/AccountContent/AccountContent';
import styles from '../Dashboard/Dashboard.module.css';

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

const AdminAccount: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
      return;
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount; userInfo causes re-run loop
  }, [navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getMe();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account');
      toastService.error(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>My Account</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading your account...</p>
            </div>
          ) : error && !user ? (
            <div className={styles.errorState}>
              <span className={styles.alertIcon}>⚠</span>
              <p>{error}</p>
              <button onClick={fetchUser} className={styles.retryButton}>Try Again</button>
            </div>
          ) : user ? (
            <AccountContent user={user} />
          ) : null}
        </div>
    </div>
  );
};

export default AdminAccount;
