import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { userService } from '../../../services/api/userService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { UserListItem, PendingSeller, UpdateUserRequest, DashboardStats } from '../../../types/user.types';
import styles from './Users.module.css';

// Helper to check if role is Admin
const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') {
    return role === UserRoleValues.Admin;
  }
  if (typeof role === 'number') {
    return role === 1;
  }
  return false;
};

type TabType = 'all' | 'users' | 'sellers' | 'pending';

interface EditFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [selectedPendingSeller, setSelectedPendingSeller] = useState<PendingSeller | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isActive: true,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'pending') {
        const data = await userService.getPendingSellers();
        setPendingSellers(data);
      } else if (activeTab === 'users') {
        const data = await userService.getByRole('User');
        setUsers(data);
      } else if (activeTab === 'sellers') {
        const data = await userService.getByRole('Seller');
        setUsers(data);
      } else {
        const data = await userService.getAll();
        setUsers(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Edit modal handlers
  const openEditModal = (user: UserListItem) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      isActive: true,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      const updateData: UpdateUserRequest = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phoneNumber: editFormData.phoneNumber || undefined,
        isActive: editFormData.isActive,
      };
      await userService.update(selectedUser.id, updateData);
      toastService.success('User updated successfully');
      closeEditModal();
      fetchData();
      fetchStats();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete modal handlers
  const openDeleteModal = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      await userService.delete(selectedUser.id);
      toastService.success('User deleted successfully');
      closeDeleteModal();
      fetchData();
      fetchStats();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  // Approve seller
  const handleApproveSeller = async (seller: PendingSeller) => {
    setFormLoading(true);
    try {
      await userService.approveSeller(seller.id);
      toastService.success(`Seller ${seller.firstName} ${seller.lastName} approved successfully!`);
      fetchData();
      fetchStats();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to approve seller');
    } finally {
      setFormLoading(false);
    }
  };

  // Reject modal handlers
  const openRejectModal = (seller: PendingSeller) => {
    setSelectedPendingSeller(seller);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedPendingSeller(null);
    setRejectReason('');
  };

  const handleRejectSeller = async () => {
    if (!selectedPendingSeller) return;

    setFormLoading(true);
    try {
      await userService.rejectSeller(selectedPendingSeller.id, rejectReason || undefined);
      toastService.success('Seller rejected successfully');
      closeRejectModal();
      fetchData();
      fetchStats();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to reject seller');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: UserListItem) => {
    try {
      await userService.updateStatus(user.id, !user.isActive);
      toastService.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchData();
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/admin/dashboard" className={styles.navItem}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link to="/admin/users" className={`${styles.navItem} ${styles.active}`}>
            <span className={styles.navIcon}>👥</span>
            Users
            {stats && stats.pendingSellers > 0 && (
              <span className={styles.badge}>{stats.pendingSellers}</span>
            )}
          </Link>
          <Link to="/admin/products" className={styles.navItem}>
            <span className={styles.navIcon}>📦</span>
            Products
          </Link>
          <Link to="/admin/orders" className={styles.navItem}>
            <span className={styles.navIcon}>🛒</span>
            Orders
          </Link>
          <Link to="/admin/categories" className={styles.navItem}>
            <span className={styles.navIcon}>📁</span>
            Categories
          </Link>
          <Link to="/admin/sellers" className={styles.navItem}>
            <span className={styles.navIcon}>🏪</span>
            Sellers
          </Link>
          <Link to="/admin/coupons" className={styles.navItem}>
            <span className={styles.navIcon}>🎫</span>
            Coupons
          </Link>
          <Link to="/admin/reports" className={styles.navItem}>
            <span className={styles.navIcon}>📈</span>
            Reports
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.navIcon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>User Management</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {/* Stats Cards */}
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👤</div>
                <div className={styles.statContent}>
                  <h3>Total Users</h3>
                  <p className={styles.statNumber}>{stats.totalUsers}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏪</div>
                <div className={styles.statContent}>
                  <h3>Total Sellers</h3>
                  <p className={styles.statNumber}>{stats.totalSellers}</p>
                </div>
              </div>
              <div className={`${styles.statCard} ${stats.pendingSellers > 0 ? styles.highlight : ''}`}>
                <div className={styles.statIcon}>⏳</div>
                <div className={styles.statContent}>
                  <h3>Pending Approvals</h3>
                  <p className={styles.statNumber}>{stats.pendingSellers}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Users
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Customers
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'sellers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('sellers')}
            >
              Sellers
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Sellers
              {stats && stats.pendingSellers > 0 && (
                <span className={styles.tabBadge}>{stats.pendingSellers}</span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.alertIcon}>⚠</span>
              {error}
              <button onClick={() => setError(null)} className={styles.alertClose}>×</button>
            </div>
          )}

          {/* Content */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
              </div>
            ) : activeTab === 'pending' ? (
              // Pending Sellers Table
              pendingSellers.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>✅</span>
                  <h3>No Pending Approvals</h3>
                  <p>All seller registrations have been processed</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>GST Number</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map((seller) => (
                      <tr key={seller.id}>
                        <td className={styles.idCell}>{seller.id}</td>
                        <td className={styles.nameCell}>
                          {seller.firstName} {seller.lastName}
                        </td>
                        <td>{seller.email}</td>
                        <td>{seller.phoneNumber || '-'}</td>
                        <td className={styles.gstCell}>{seller.gstNumber}</td>
                        <td className={styles.dateCell}>
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className={styles.actionsCell}>
                          <button
                            onClick={() => handleApproveSeller(seller)}
                            className={styles.approveButton}
                            disabled={formLoading}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => openRejectModal(seller)}
                            className={styles.rejectButton}
                            disabled={formLoading}
                            title="Reject"
                          >
                            ✗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              // Users Table
              users.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👥</span>
                  <h3>No Users Found</h3>
                  <p>No users match the current filter</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className={styles.idCell}>{user.id}</td>
                        <td className={styles.nameCell}>
                          {user.firstName} {user.lastName}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || '-'}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className={styles.actionsCell}>
                          {user.role !== 'Admin' && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={user.isActive ? styles.deactivateButton : styles.activateButton}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? '🔒' : '🔓'}
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className={styles.editButton}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className={styles.deleteButton}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                          {user.role === 'Admin' && (
                            <span className={styles.noActions}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit User</h2>
              <button onClick={closeEditModal} className={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              <div className={styles.formGroupCheckbox}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className={styles.checkmark}></span>
                  Active
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeEditModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete User</h2>
              <button onClick={closeDeleteModal} className={styles.modalClose}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <span className={styles.deleteIcon}>⚠️</span>
                <p>Are you sure you want to delete user <strong>"{selectedUser.firstName} {selectedUser.lastName}"</strong>?</p>
                <p className={styles.deleteWarning}>This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={closeDeleteModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleDelete} className={styles.deleteConfirmButton} disabled={formLoading}>
                  {formLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Seller Modal */}
      {isRejectModalOpen && selectedPendingSeller && (
        <div className={styles.modalOverlay} onClick={closeRejectModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reject Seller</h2>
              <button onClick={closeRejectModal} className={styles.modalClose}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.rejectInfo}>
                <p>Rejecting seller: <strong>{selectedPendingSeller.firstName} {selectedPendingSeller.lastName}</strong></p>
                <p className={styles.rejectNote}>An email will be sent to notify the seller about this decision.</p>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="rejectReason">Rejection Reason (Optional)</label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection (will be included in the email)"
                  rows={3}
                />
              </div>
              <div className={styles.modalFooter}>
                <button onClick={closeRejectModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleRejectSeller} className={styles.deleteConfirmButton} disabled={formLoading}>
                  {formLoading ? 'Rejecting...' : 'Reject Seller'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
