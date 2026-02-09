import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import axios from 'axios';
import { productService } from '../../../services/api/productService';
import { categoryService } from '../../../services/api/categoryService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { ProductListItem, CreateProductRequest, UpdateProductRequest } from '../../../types/product.types';
import type { Category } from '../../../types/category.types';
import styles from './Products.module.css';

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Seller;
  if (typeof role === 'number') return role === 2;
  return false;
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  categoryId: string;
  isActive: boolean;
  isVisible: boolean;
  imageUrl: string;
  additionalImages: string[];
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stockQuantity: '0',
  categoryId: '',
  isActive: true,
  isVisible: true,
  imageUrl: '',
  additionalImages: [],
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesInputRef = useRef<HTMLInputElement>(null);

  // State
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = isAdminRole(userInfo?.role);
  const isSeller = isSellerRole(userInfo?.role);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated() || (!isAdmin && !isSeller)) {
      navigate('/');
    }
  }, [navigate, isAdmin, isSeller]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const categoryId = categoryFilter ? parseInt(categoryFilter, 10) : undefined;
      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const isVisible = visibilityFilter === 'all' ? undefined : visibilityFilter === 'visible';
      const signal = controller.signal;

      if (isAdmin) {
        const result = await productService.getPaged({
          page: pageNum,
          pageSize,
          search: searchQuery.trim() || undefined,
          categoryId,
          isActive,
          isVisible,
          signal,
        });
        if (controller.signal.aborted) return;
        setProducts(result.data);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } else {
        const result = await productService.getMyProductsPaged({
          page: pageNum,
          pageSize,
          search: searchQuery.trim() || undefined,
          categoryId,
          isActive,
          signal,
        });
        if (controller.signal.aborted) return;
        setProducts(result.data);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      }
      setPage(pageNum);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }, [isAdmin, searchQuery, categoryFilter, statusFilter, visibilityFilter, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchProducts(1);
  }, [searchQuery, categoryFilter, statusFilter, visibilityFilter, pageSize]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.filter(c => c.isActive));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Image handling
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastService.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastService.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(files.length, 5 - additionalPreviews.length); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push(base64);
      newPreviews.push(base64);
    }

    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...newImages]
    }));
    setAdditionalPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.length < 2 || formData.name.length > 200) {
      errors.name = 'Product name must be between 2 and 200 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = 'Valid price is required';
    }

    if (formData.discountPrice) {
      const discountPrice = parseFloat(formData.discountPrice);
      if (isNaN(discountPrice) || discountPrice < 0) {
        errors.discountPrice = 'Invalid discount price';
      } else if (discountPrice >= price) {
        errors.discountPrice = 'Discount price must be less than original price';
      }
    }

    const stock = parseInt(formData.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      errors.stockQuantity = 'Valid stock quantity is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create modal handlers
  const openCreateModal = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setImagePreview(null);
    setAdditionalPreviews([]);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setImagePreview(null);
    setAdditionalPreviews([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const createData: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        isVisible: formData.isVisible,
        imageUrl: formData.imageUrl || undefined,
        additionalImages: formData.additionalImages.length > 0 ? formData.additionalImages : undefined,
      };
      await productService.create(createData);
      toastService.success('Product created successfully');
      closeCreateModal();
      fetchProducts(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit modal handlers
  const openEditModal = async (product: ProductListItem) => {
    setSelectedProduct(product);
    setFormErrors({});
    
    try {
      const fullProduct = await productService.getById(product.id);
      setFormData({
        name: fullProduct.name,
        description: fullProduct.description,
        price: fullProduct.price.toString(),
        discountPrice: fullProduct.discountPrice?.toString() || '',
        stockQuantity: fullProduct.stockQuantity.toString(),
        categoryId: fullProduct.categoryId.toString(),
        isActive: fullProduct.isActive,
        isVisible: fullProduct.isVisible,
        imageUrl: fullProduct.imageUrl || '',
        additionalImages: fullProduct.additionalImages || [],
      });
      setImagePreview(fullProduct.imageUrl || null);
      setAdditionalPreviews(fullProduct.additionalImages || []);
      setIsEditModalOpen(true);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to load product');
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setFormData(initialFormData);
    setFormErrors({});
    setImagePreview(null);
    setAdditionalPreviews([]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !validateForm()) return;

    setFormLoading(true);
    try {
      const updateData: UpdateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        isVisible: formData.isVisible,
        imageUrl: formData.imageUrl || undefined,
        additionalImages: formData.additionalImages.length > 0 ? formData.additionalImages : undefined,
      };
      await productService.update(selectedProduct.id, updateData);
      toastService.success('Product updated successfully');
      closeEditModal();
      fetchProducts(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete modal handlers
  const openDeleteModal = (product: ProductListItem) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      await productService.delete(selectedProduct.id);
      toastService.success('Product deleted successfully');
      closeDeleteModal();
      fetchProducts(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle handlers
  const handleToggleStatus = async (product: ProductListItem) => {
    try {
      await productService.toggleStatus(product.id);
      toastService.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchProducts(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  const handleToggleVisibility = async (product: ProductListItem) => {
    try {
      await productService.toggleVisibility(product.id);
      toastService.success(`Product ${product.isVisible ? 'hidden' : 'visible'} successfully`);
      fetchProducts(page);
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  if (!userInfo) return null;

  return (
    <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{isAdmin ? 'Product Management' : 'My Products'}</h1>
          <div className={styles.headerActions}>
            <button onClick={openCreateModal} className={styles.addButton}>
              + Add Product
            </button>
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

          {/* Search & Filter */}
          <div className={styles.searchFilterBar}>
            <input
              type="text"
              placeholder="Search by product name, category, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
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
            {isAdmin && (
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'visible' | 'hidden')}
                className={styles.filterSelect}
              >
                <option value="all">All visibility</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            )}
          </div>

          {/* Products Table */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  {searchQuery || categoryFilter || statusFilter !== 'all' || visibilityFilter !== 'all' ? '🔍' : '📦'}
                </span>
                <h3>
                  {searchQuery || categoryFilter || statusFilter !== 'all' || visibilityFilter !== 'all'
                    ? 'No matching products'
                    : 'No Products Found'}
                </h3>
                <p>
                  {searchQuery || categoryFilter || statusFilter !== 'all' || visibilityFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first product'}
                </p>
                {!searchQuery && !categoryFilter && statusFilter === 'all' && visibilityFilter === 'all' && (
                  <button onClick={openCreateModal} className={styles.addButton}>
                    + Add Product
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
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td className={styles.idCell}>{(page - 1) * pageSize + index + 1}</td>
                      <td className={styles.imageCell}>
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.noImage}>📷</div>
                        )}
                      </td>
                      <td>
                        <div className={styles.productInfo}>
                          <span className={styles.productName}>{product.name}</span>
                          <span className={styles.productId}>ID: {product.id}</span>
                        </div>
                      </td>
                      <td>{product.categoryName}</td>
                      <td className={styles.priceCell}>
                        {product.discountPrice ? (
                          <>
                            <span className={styles.discountPrice}>₹{product.discountPrice.toFixed(2)}</span>
                            <span className={styles.originalPrice}>₹{product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>₹{product.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.stockBadge} ${product.stockQuantity > 0 ? styles.inStock : styles.outOfStock}`}>
                          {product.stockQuantity > 0 ? product.stockQuantity : 'Out of Stock'}
                        </span>
                      </td>
                      <td className={styles.sellerCell}>{product.sellerName}</td>
                      <td>
                        <div className={styles.statusBadges}>
                          <span className={`${styles.statusBadge} ${product.isActive ? styles.active : styles.inactive}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`${styles.visibilityBadge} ${product.isVisible ? styles.visible : styles.hidden}`}>
                            {product.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={styles.iconButton}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(product)}
                          className={styles.iconButton}
                          title={product.isVisible ? 'Hide' : 'Show'}
                        >
                          {product.isVisible ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className={styles.iconButton}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className={styles.iconButton}
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
                        onClick={() => fetchProducts(page - 1)}
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
                        onClick={() => fetchProducts(page + 1)}
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

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className={styles.modalOverlay} onClick={isCreateModalOpen ? closeCreateModal : closeEditModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{isCreateModalOpen ? 'Add New Product' : 'Edit Product'}</h2>
              <button 
                onClick={isCreateModalOpen ? closeCreateModal : closeEditModal} 
                className={styles.modalClose}
              >×</button>
            </div>
            <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={formErrors.name ? styles.inputError : ''}
                  />
                  {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="categoryId">Category *</label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={formErrors.categoryId ? styles.inputError : ''}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.categoryId && <span className={styles.errorText}>{formErrors.categoryId}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={formErrors.price ? styles.inputError : ''}
                  />
                  {formErrors.price && <span className={styles.errorText}>{formErrors.price}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="discountPrice">Discount Price (₹)</label>
                  <input
                    type="number"
                    id="discountPrice"
                    step="0.01"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: e.target.value }))}
                    className={formErrors.discountPrice ? styles.inputError : ''}
                  />
                  {formErrors.discountPrice && <span className={styles.errorText}>{formErrors.discountPrice}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stockQuantity">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stockQuantity"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className={formErrors.stockQuantity ? styles.inputError : ''}
                  />
                  {formErrors.stockQuantity && <span className={styles.errorText}>{formErrors.stockQuantity}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={formErrors.description ? styles.inputError : ''}
                />
                {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
              </div>

              {/* Main Image Upload */}
              <div className={styles.formGroup}>
                <label>Main Product Image</label>
                <div className={styles.imageUploadArea}>
                  {imagePreview ? (
                    <div className={styles.imagePreviewContainer}>
                      <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                      <button type="button" onClick={removeMainImage} className={styles.removeImageBtn}>×</button>
                    </div>
                  ) : (
                    <div 
                      className={styles.uploadPlaceholder}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className={styles.uploadIcon}>📷</span>
                      <span>Click to upload main image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Additional Images Upload */}
              <div className={styles.formGroup}>
                <label>Additional Images (max 5)</label>
                <div className={styles.additionalImagesGrid}>
                  {additionalPreviews.map((preview, index) => (
                    <div key={index} className={styles.additionalImageItem}>
                      <img src={preview} alt={`Additional ${index + 1}`} />
                      <button type="button" onClick={() => removeAdditionalImage(index)} className={styles.removeImageBtn}>×</button>
                    </div>
                  ))}
                  {additionalPreviews.length < 5 && (
                    <div 
                      className={styles.addMoreImages}
                      onClick={() => additionalFilesInputRef.current?.click()}
                    >
                      <span>+</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={additionalFilesInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Status Toggles */}
              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className={styles.toggleText}>Active</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  />
                  <span className={styles.toggleText}>Visible to customers</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={isCreateModalOpen ? closeCreateModal : closeEditModal} 
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={formLoading}>
                  {formLoading ? 'Saving...' : (isCreateModalOpen ? 'Create Product' : 'Update Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Product</h2>
              <button onClick={closeDeleteModal} className={styles.modalClose}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteConfirmation}>
                <span className={styles.deleteIcon}>⚠️</span>
                <p>Are you sure you want to delete <strong>"{selectedProduct.name}"</strong>?</p>
                <p className={styles.deleteWarning}>This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={closeDeleteModal} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleDelete} className={styles.deleteConfirmButton} disabled={formLoading}>
                  {formLoading ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
