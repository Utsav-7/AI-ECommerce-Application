import { useState } from 'react';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { UserInfo, ChangePasswordRequest } from '../../../types/auth.types';
import styles from './AccountContent.module.css';

interface AccountContentProps {
  user: UserInfo;
}

const AccountContent: React.FC<AccountContentProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        ...passwordForm,
        email: user.email,
      });
      toastService.success('Password changed successfully');
      setPasswordForm({
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <div className={styles.accountContent}>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileMeta}>
            <div className={styles.nameStatusRow}>
              <h2 className={styles.userName}>
                {user.firstName} {user.lastName}
              </h2>
              <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.profileDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          {user.gstNumber && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>GST Number</span>
              <span className={styles.detailValue}>{user.gstNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsSection}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <div className={styles.infoCard}>
              <h3>Profile Information</h3>
              <p>Your profile is managed through your account. Contact support if you need to update your name or email.</p>
              <div className={styles.profileInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>First Name</span>
                  <span className={styles.infoValue}>{user.firstName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Last Name</span>
                  <span className={styles.infoValue}>{user.lastName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email Address</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className={styles.tabContent}>
            <div className={styles.securityCard}>
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure.</p>
              <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className={passwordErrors.currentPassword ? styles.inputError : ''}
                    autoComplete="current-password"
                  />
                  {passwordErrors.currentPassword && (
                    <span className={styles.fieldError}>{passwordErrors.currentPassword}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password *</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 6 characters"
                    className={passwordErrors.newPassword ? styles.inputError : ''}
                    autoComplete="new-password"
                  />
                  {passwordErrors.newPassword && (
                    <span className={styles.fieldError}>{passwordErrors.newPassword}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className={passwordErrors.confirmPassword ? styles.inputError : ''}
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && (
                    <span className={styles.fieldError}>{passwordErrors.confirmPassword}</span>
                  )}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountContent;
