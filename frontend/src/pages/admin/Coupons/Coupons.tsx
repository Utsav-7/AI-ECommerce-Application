import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { couponService } from '../../../services/api/couponService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { Coupon, CreateCouponRequest, UpdateCouponRequest } from '../../../types/coupon.types';
import { CouponTypeValues } from '../../../types/coupon.types';
import styles from './Coupons.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

const initialFormData: CreateCouponRequest = {
  code: '',
  description: '',
  type: 1,
  value: 0,
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  validFrom: new Date().toISOString().slice(0, 16),
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  usageLimit: 0,
  isActive: true,
};

const AdminCoupons: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CreateCouponRequest>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const fetchCoupons = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const type = typeFilter ? parseInt(typeFilter, 10) : undefined;
      const result = await couponService.getPaged({
        page: pageNum,
        pageSize,
        search: searchQuery.trim() || undefined,
        isActive,
        type,
      });
      setCoupons(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchCoupons(1);
  }, [searchQuery, statusFilter, typeFilter, pageSize]);

  useEffect(() => {
    if (page > 1) fetchCoupons(page);
  }, [page]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      ...initialFormData,
      validFrom: new Date().toISOString().slice(0, 16),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minPurchaseAmount: coupon.minPurchaseAmount ?? null,
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      validFrom: coupon.validFrom.slice(0, 16),
      validTo: coupon.validTo.slice(0, 16),
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (coupon: Coupon) => {
    setDeletingCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormError(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
      };
      if (editingCoupon) {
        await couponService.update(editingCoupon.id, payload);
        toastService.success('Coupon updated successfully');
      } else {
        await couponService.create(payload);
        toastService.success('Coupon created successfully');
      }
      closeModal();
      fetchCoupons(page);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    setFormLoading(true);
    try {
      await couponService.delete(deletingCoupon.id);
      toastService.success('Coupon deleted successfully');
      closeDeleteModal();
      fetchCoupons(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to delete coupon');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'short' });

  if (!userInfo) return null;

  return (
    <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Coupon Management</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userInfo.firstName} {userInfo.lastName}</span>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <input
              type="text"
              placeholder="Search by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All types</option>
              <option value="1">Percentage</option>
              <option value="2">Flat</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={styles.filterSelect}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button type="button" onClick={openCreateModal} className={styles.addButton}>
              + Add Coupon
            </button>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Loading coupons...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <span className={styles.alertIcon}>⚠️</span>
                <p>{error}</p>
                <button type="button" onClick={() => fetchCoupons(1)} className={styles.retryButton}>Retry</button>
              </div>
            ) : coupons.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎫</span>
                <h3>No coupons found</h3>
                <p>Add your first coupon or adjust filters.</p>
                <button type="button" onClick={openCreateModal} className={styles.addButton}>Add Coupon</button>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Valid From</th>
                      <th>Valid To</th>
                      <th>Usage</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, index) => (
                      <tr key={coupon.id}>
                        <td className={styles.idCell}>{(page - 1) * pageSize + index + 1}</td>
                        <td className={styles.codeCell}>{coupon.code}</td>
                        <td className={styles.descCell}>{coupon.description}</td>
                        <td>{coupon.typeName}</td>
                        <td>{coupon.type === CouponTypeValues.Percentage ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                        <td>{formatDate(coupon.validFrom)}</td>
                        <td>{formatDate(coupon.validTo)}</td>
                        <td>{coupon.usageLimit === 0 ? 'Unlimited' : `${coupon.usedCount}/${coupon.usageLimit}`}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${coupon.isActive ? styles.active : styles.inactive}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <button type="button" onClick={() => openEditModal(coupon)} className={styles.editButton} title="Edit">✏️</button>
                          <button type="button" onClick={() => openDeleteModal(coupon)} className={styles.deleteButton} title="Delete">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalRecords > 0 && (
                  <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>
                      Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRecords)} of {totalRecords}
                    </span>
                    <label className={styles.pageSizeLabel}>
                      Per page:
                      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={styles.pageSizeSelect}>
                        {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    {totalPages > 1 && (
                      <div className={styles.paginationButtons}>
                        <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                        <span className={styles.pageNumbers}>Page {page} of {totalPages}</span>
                        <button type="button" className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button type="button" onClick={closeModal} className={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {formError && <div className={styles.formError}>{formError}</div>}
              <div className={styles.formGroup}>
                <label>Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. SAVE20"
                  required
                  maxLength={100}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Coupon description"
                  required
                  maxLength={1000}
                  rows={2}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((f) => ({ ...f, type: Number(e.target.value) }))}
                    className={styles.formInput}
                  >
                    <option value={1}>Percentage</option>
                    <option value={2}>Flat Amount</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.value || ''}
                    onChange={(e) => setFormData((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Min Purchase (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minPurchaseAmount ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : null }))}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscountAmount ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null }))}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valid From *</label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData((f) => ({ ...f, validFrom: e.target.value }))}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Valid To *</label>
                  <input
                    type="datetime-local"
                    value={formData.validTo}
                    onChange={(e) => setFormData((f) => ({ ...f, validTo: e.target.value }))}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Usage Limit (0 = unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData((f) => ({ ...f, usageLimit: parseInt(e.target.value, 10) || 0 }))}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>Cancel</button>
                <button type="submit" disabled={formLoading} className={styles.submitButton}>
                  {formLoading ? 'Saving...' : (editingCoupon ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deletingCoupon && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Coupon</h2>
              <button type="button" onClick={closeDeleteModal} className={styles.modalClose}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete coupon <strong>{deletingCoupon.code}</strong>? This action cannot be undone.</p>
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeDeleteModal} className={styles.cancelButton}>Cancel</button>
                <button type="button" onClick={handleDelete} disabled={formLoading} className={styles.deleteConfirmButton}>
                  {formLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
