import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import { authService } from '../../services/api/authService';
import { addressService } from '../../services/api/addressService';
import { toastService } from '../../services/toast/toastService';
import { getDashboardPathByUserInfo } from '../../utils/routeHelpers';
import type { UserInfo } from '../../types/auth.types';
import type { ChangePasswordRequest } from '../../types/auth.types';
import type { Address, CreateAddressRequest } from '../../types/address.types';
import styles from './Account.module.css';

const emptyAddressForm: CreateAddressRequest = {
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  isDefault: false,
};

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'addresses' | 'orders'>('profile');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<CreateAddressRequest>(emptyAddressForm);
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUser();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getMe();
      setUser(data);
      setPasswordForm((prev) => ({ ...prev, email: data.email }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account');
      toastService.error(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  };

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

  const isCustomerUser = user?.role === 'User';

  const loadAddresses = useCallback(async () => {
    if (!isCustomerUser) return;
    try {
      setAddressLoading(true);
      const list = await addressService.getMyAddresses();
      setAddresses(list);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  }, [isCustomerUser]);

  useEffect(() => {
    if (activeTab === 'addresses' && isCustomerUser) loadAddresses();
  }, [activeTab, isCustomerUser, loadAddresses]);

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};
    const street = addressForm.street.trim();
    const city = addressForm.city.trim();
    const state = addressForm.state.trim();
    const country = addressForm.country.trim();
    const zipCode = addressForm.zipCode.trim();

    if (!street) errors.street = 'Street / address line is required';
    else if (street.length < 2) errors.street = 'Street must be at least 2 characters';
    else if (street.length > 500) errors.street = 'Street cannot exceed 500 characters';

    if (!city) errors.city = 'City is required';
    else if (city.length < 2) errors.city = 'City must be at least 2 characters';
    else if (city.length > 100) errors.city = 'City cannot exceed 100 characters';

    if (!state) errors.state = 'State is required';
    else if (state.length < 2) errors.state = 'State must be at least 2 characters';
    else if (state.length > 100) errors.state = 'State cannot exceed 100 characters';

    if (!country) errors.country = 'Country is required';
    else if (country.length < 2) errors.country = 'Country must be at least 2 characters';
    else if (country.length > 100) errors.country = 'Country cannot exceed 100 characters';

    if (!zipCode) errors.zipCode = 'Zip / postal code is required';
    else if (zipCode.length < 3) errors.zipCode = 'Zip code must be at least 3 characters';
    else if (zipCode.length > 20) errors.zipCode = 'Zip code cannot exceed 20 characters';
    else if (!/^[a-zA-Z0-9\s\-]+$/.test(zipCode)) errors.zipCode = 'Zip code can only contain letters, numbers, spaces and hyphens';

    setAddressFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      zipCode: addr.zipCode,
      isDefault: addr.isDefault,
    });
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
    setAddressFormErrors({});
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, addressForm);
        toastService.success('Address updated');
      } else {
        await addressService.create(addressForm);
        toastService.success('Address added');
      }
      closeAddressForm();
      loadAddresses();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      toastService.success('Default address updated');
      loadAddresses();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressService.delete(id);
      toastService.success('Address removed');
      setDeleteConfirmId(null);
      loadAddresses();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const formatAddressLine = (a: Address) =>
    [a.street, a.city, a.state, a.country, a.zipCode].filter(Boolean).join(', ');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validatePasswordForm()) return;

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

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading your account...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>Unable to load account</h2>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchUser}>
            Try Again
          </button>
          <Link to="/" className={styles.backLink}>Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <div className={styles.accountContainer}>
        <div className={styles.accountHeader}>
          <Link to={getDashboardPathByUserInfo(user)} className={styles.backToDashboard}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSubtitle}>Manage your profile and security settings</p>
        </div>

        <div className={styles.accountContent}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {initials}
              </div>
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
              {isCustomerUser && (
                <>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Orders
                  </button>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'addresses' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    Addresses
                  </button>
                </>
              )}
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

            {activeTab === 'orders' && isCustomerUser && (
              <div className={styles.tabContent}>
                <div className={styles.infoCard}>
                  <h3>Order History</h3>
                  <p>View and track your orders.</p>
                  <Link to="/account/orders" className={styles.ordersLink}>
                    View All Orders →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && isCustomerUser && (
              <div className={styles.tabContent}>
                <div className={styles.addressesCard}>
                  <div className={styles.addressesHeader}>
                    <h3>Saved Addresses</h3>
                    <p>Manage your delivery addresses. You can add multiple addresses and set one as default.</p>
                    <button type="button" className={styles.addAddressBtn} onClick={openAddAddress}>
                      + Add Address
                    </button>
                  </div>
                  {addressLoading ? (
                    <div className={styles.addressLoading}>Loading addresses...</div>
                  ) : showAddressForm ? (
                    <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
                      <h4>{editingAddress ? 'Edit Address' : 'New Address'}</h4>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-street">Street / Address line *</label>
                        <input
                          id="addr-street"
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => {
                            setAddressForm((f) => ({ ...f, street: e.target.value }));
                            if (addressFormErrors.street) setAddressFormErrors((prev) => ({ ...prev, street: '' }));
                          }}
                          placeholder="Street, building, floor"
                          maxLength={500}
                          className={addressFormErrors.street ? styles.inputError : ''}
                          aria-invalid={!!addressFormErrors.street}
                          aria-describedby={addressFormErrors.street ? 'addr-street-error' : undefined}
                        />
                        {addressFormErrors.street && <span id="addr-street-error" className={styles.fieldError} role="alert">{addressFormErrors.street}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="addr-city">City *</label>
                          <input
                            id="addr-city"
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => {
                              setAddressForm((f) => ({ ...f, city: e.target.value }));
                              if (addressFormErrors.city) setAddressFormErrors((prev) => ({ ...prev, city: '' }));
                            }}
                            placeholder="City"
                            maxLength={100}
                            className={addressFormErrors.city ? styles.inputError : ''}
                            aria-invalid={!!addressFormErrors.city}
                          />
                          {addressFormErrors.city && <span className={styles.fieldError} role="alert">{addressFormErrors.city}</span>}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="addr-state">State *</label>
                          <input
                            id="addr-state"
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => {
                              setAddressForm((f) => ({ ...f, state: e.target.value }));
                              if (addressFormErrors.state) setAddressFormErrors((prev) => ({ ...prev, state: '' }));
                            }}
                            placeholder="State / Province"
                            maxLength={100}
                            className={addressFormErrors.state ? styles.inputError : ''}
                            aria-invalid={!!addressFormErrors.state}
                          />
                          {addressFormErrors.state && <span className={styles.fieldError} role="alert">{addressFormErrors.state}</span>}
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="addr-country">Country *</label>
                          <input
                            id="addr-country"
                            type="text"
                            value={addressForm.country}
                            onChange={(e) => {
                              setAddressForm((f) => ({ ...f, country: e.target.value }));
                              if (addressFormErrors.country) setAddressFormErrors((prev) => ({ ...prev, country: '' }));
                            }}
                            placeholder="Country"
                            maxLength={100}
                            className={addressFormErrors.country ? styles.inputError : ''}
                            aria-invalid={!!addressFormErrors.country}
                          />
                          {addressFormErrors.country && <span className={styles.fieldError} role="alert">{addressFormErrors.country}</span>}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="addr-zip">Zip / Postal code *</label>
                          <input
                            id="addr-zip"
                            type="text"
                            value={addressForm.zipCode}
                            onChange={(e) => {
                              setAddressForm((f) => ({ ...f, zipCode: e.target.value }));
                              if (addressFormErrors.zipCode) setAddressFormErrors((prev) => ({ ...prev, zipCode: '' }));
                            }}
                            placeholder="e.g. 400001 or 110001"
                            maxLength={20}
                            className={addressFormErrors.zipCode ? styles.inputError : ''}
                            aria-invalid={!!addressFormErrors.zipCode}
                          />
                          {addressFormErrors.zipCode && <span className={styles.fieldError} role="alert">{addressFormErrors.zipCode}</span>}
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                          />
                          Set as default address
                        </label>
                      </div>
                      <div className={styles.addressFormActions}>
                        <button type="button" className={styles.cancelBtn} onClick={closeAddressForm}>
                          Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className={styles.noAddresses}>
                      <p>No saved addresses. Add one for faster checkout.</p>
                      <button type="button" className={styles.addAddressBtn} onClick={openAddAddress}>
                        + Add Address
                      </button>
                    </div>
                  ) : (
                    <ul className={styles.addressList}>
                      {addresses.map((addr) => (
                        <li key={addr.id} className={styles.addressCard}>
                          <div className={styles.addressCardContent}>
                            {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                            <p className={styles.addressLine}>{formatAddressLine(addr)}</p>
                          </div>
                          <div className={styles.addressCardActions}>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                className={styles.addressActionBtn}
                                onClick={() => handleSetDefault(addr.id)}
                              >
                                Set as default
                              </button>
                            )}
                            <button type="button" className={styles.addressActionBtn} onClick={() => openEditAddress(addr)}>
                              Edit
                            </button>
                            {deleteConfirmId === addr.id ? (
                              <>
                                <span className={styles.confirmText}>Delete?</span>
                                <button
                                  type="button"
                                  className={styles.addressActionBtnDanger}
                                  onClick={() => handleDeleteAddress(addr.id)}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  className={styles.addressActionBtn}
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className={styles.addressActionBtnDanger}
                                onClick={() => setDeleteConfirmId(addr.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
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
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
