import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { categoryService } from '../../../services/api/categoryService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/category.types';
import styles from './Categories.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  imageUrl: '',
  isActive: true,
};

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAdminRole(userInfo?.role)) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const fetchCategories = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const result = await categoryService.getPaged({
        page: pageNum,
        pageSize,
        search: searchQuery.trim() || undefined,
        isActive,
      });
      setCategories(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchCategories(1);
  }, [searchQuery, statusFilter, pageSize]);

  const handleLogout = () => {
    authService.logout();
    toastService.success('Logged out successfully');
    navigate('/');
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setFormError(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive,
    });
    setFormError(null);
    // Set image preview if category has an image
    setImagePreview(category.imageUrl || null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
    setFormError(null);
    setImagePreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Convert file to Base64 string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Handle image file selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFormError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFormError('File size too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    try {
      setImageUploading(true);
      setFormError(null);

      // Convert image to Base64
      const base64String = await convertFileToBase64(file);

      // Update form data with Base64 string
      setFormData(prev => ({
        ...prev,
        imageUrl: base64String,
      }));

      // Set preview
      setImagePreview(base64String);

    } catch (err) {
      setFormError('Failed to process image. Please try again.');
      console.error('Image conversion error:', err);
    } finally {
      setImageUploading(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
        };
        await categoryService.update(editingCategory.id, updateData);
        toastService.success('Category updated successfully!');
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
        };
        await categoryService.create(createData);
        toastService.success('Category created successfully!');
      }

      closeModal();
      fetchCategories(page);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setFormLoading(true);
    try {
      await categoryService.delete(deletingCategory.id);
      toastService.success('Category deleted successfully!');
      closeDeleteModal();
      fetchCategories(page);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMsg);
      toastService.error(errorMsg);
      closeDeleteModal();
    } finally {
      setFormLoading(false);
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
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>👥</span>
            Users
          </NavLink>
          <NavLink to="/admin/products" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📦</span>
            Products
          </NavLink>
          <NavLink to="/admin/orders" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🛒</span>
            Orders
          </NavLink>
          <NavLink to="/admin/categories" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📁</span>
            Categories
          </NavLink>
          <NavLink to="/admin/sellers" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🏪</span>
            Sellers
          </NavLink>
          <NavLink to="/admin/coupons" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>🎫</span>
            Coupons
          </NavLink>
          <NavLink to="/admin/reports" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>📈</span>
            Reports
          </NavLink>
          <NavLink to="/admin/account" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`.trim()}>
            <span className={styles.navIcon}>👤</span>
            Account
          </NavLink>
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
          <h1 className={styles.pageTitle}>Category Management</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userInfo.firstName} {userInfo.lastName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {/* Error Message */}
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.alertIcon}>⚠</span>
              {error}
              <button onClick={() => setError(null)} className={styles.alertClose}>×</button>
            </div>
          )}

          {/* Header Section */}
          <div className={styles.pageHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Categories</h2>
              <p className={styles.sectionDescription}>Manage product categories for your store</p>
            </div>
            <button onClick={openCreateModal} className={styles.addButton}>
              <span>+</span> Add Category
            </button>
          </div>

          {/* Search & Filter */}
          <div className={styles.searchFilterBar}>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={styles.filterSelect}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Categories Table */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  {searchQuery || statusFilter !== 'all' ? '🔍' : '📁'}
                </span>
                <h3>
                  {searchQuery || statusFilter !== 'all' ? 'No matching categories' : 'No Categories Found'}
                </h3>
                <p>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first category'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button onClick={openCreateModal} className={styles.addButton}>
                    <span>+</span> Add Category
                  </button>
                )}
              </div>
            ) : (
              <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id}>
                      <td className={styles.idCell}>{(page - 1) * pageSize + index + 1}</td>
                      <td className={styles.imageCell}>
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className={styles.categoryImage}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>📁</div>
                        )}
                      </td>
                      <td className={styles.nameCell}>{category.name}</td>
                      <td className={styles.descriptionCell}>
                        {category.description || <span className={styles.noData}>No description</span>}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${category.isActive ? styles.active : styles.inactive}`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          onClick={() => openEditModal(category)}
                          className={styles.editButton}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className={styles.deleteButton}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(totalRecords > 0) && (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRecords)} of {totalRecords}
                  </span>
                  <label className={styles.pageSizeLabel}>
                    Per page:
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className={styles.pageSizeSelect}
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  {totalPages > 1 && (
                    <div className={styles.paginationButtons}>
                      <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={page <= 1}
                        onClick={() => fetchCategories(page - 1)}
                      >
                        Previous
                      </button>
                      <span className={styles.pageNumbers}>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={page >= totalPages}
                        onClick={() => fetchCategories(page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
              <button onClick={closeModal} className={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {formError && (
                <div className={styles.formError}>
                  <span className={styles.alertIcon}>⚠</span>
                  {formError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Image Upload Section */}
              <div className={styles.formGroup}>
                <label>Category Image</label>
                <div className={styles.imageUploadContainer}>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className={styles.hiddenFileInput}
                  />

                  {/* Image Preview or Upload Button */}
                  {imagePreview ? (
                    <div className={styles.imagePreviewContainer}>
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className={styles.imagePreview}
                      />
                      <div className={styles.imagePreviewActions}>
                        <button
                          type="button"
                          onClick={handleSelectImageClick}
                          className={styles.changeImageButton}
                          disabled={imageUploading}
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className={styles.removeImageButton}
                          disabled={imageUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.imageUploadArea}
                      onClick={handleSelectImageClick}
                    >
                      {imageUploading ? (
                        <div className={styles.uploadingState}>
                          <div className={styles.smallSpinner}></div>
                          <span>Processing image...</span>
                        </div>
                      ) : (
                        <>
                          <span className={styles.uploadIcon}>📷</span>
                          <span className={styles.uploadText}>Click to upload image</span>
                          <span className={styles.uploadHint}>JPEG, PNG, GIF, WebP (Max 5MB)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroupCheckbox}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                  />
                  <span className={styles.checkmark}></span>
                  Active
                </label>
                <p className={styles.checkboxHelp}>Active categories are visible to customers</p>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={formLoading || imageUploading}>
                  {formLoading ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCategory && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Category</h2>
              <button onClick={closeDeleteModal} className={styles.modalClose}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <span className={styles.deleteIcon}>⚠️</span>
                <p>Are you sure you want to delete the category <strong>"{deletingCategory.name}"</strong>?</p>
                <p className={styles.deleteWarning}>This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={closeDeleteModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleDelete} className={styles.deleteConfirmButton} disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
