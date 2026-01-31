import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductQuickViewModal from '../../components/product/ProductQuickViewModal/ProductQuickViewModal';
import { productService } from '../../services/api/productService';
import { categoryService } from '../../services/api/categoryService';
import type { ProductPublic } from '../../types/product.types';
import type { Category } from '../../types/category.types';
import styles from './Products.module.css';

const Products: React.FC = () => {
  const navigate = useNavigate();

  // State for products and categories
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedProduct, setSelectedProduct] = useState<ProductPublic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');
  const [showFilters, setShowFilters] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getPublicProducts();
      setProducts(data);
      
      // Set max price from products
      if (data.length > 0) {
        const maxPrice = Math.max(...data.map(p => p.price));
        setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.filter((c) => c.isActive));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => {
      const price = p.discountPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-desc':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'newest':
        default:
          return 0; // Assuming products are already sorted by newest
      }
    });

    return filtered;
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, page, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, priceRange, sortBy, pageSize]);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.price));
      setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
    } else {
      setPriceRange([0, 100000]);
    }
    setSortBy('newest');
  };

  return (
    <div className={styles.productsPageContainer}>
      <Navbar />
      
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>All Products</h1>
          <p className={styles.pageSubtitle}>Discover our complete collection of quality products</p>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <div className={styles.productsHeader}>
            <h2 className={styles.sectionTitle}>Browse Products</h2>
            <button 
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className={styles.filtersContainer}>
              <div className={styles.filterRow}>
                {/* Search Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Search</label>
                  <input
                    type="text"
                    className={styles.filterInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Category</label>
                  <select
                    className={styles.filterSelect}
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Sort By</label>
                  <select
                    className={styles.filterSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className={styles.filterGroup}>
                  <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>
                    Price Range: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </label>
                  <div className={styles.priceRangeContainer}>
                    <input
                      type="range"
                      min="0"
                      max={products.length > 0 ? Math.max(...products.map(p => p.price)) : 100000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className={styles.priceRangeInput}
                    />
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className={styles.resultsCount}>
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}>Loading products...</div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryButton} onClick={fetchProducts}>
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyMessage}>No products found matching your filters.</p>
              <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={styles.productsGrid}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}
                  </span>
                  <label className={styles.pageSizeLabel}>
                    Per page:
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className={styles.pageSizeSelect}
                    >
                      {[8, 12, 24, 48].map((n) => (
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
                        onClick={() => setPage((p) => p - 1)}
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
                        onClick={() => setPage((p) => p + 1)}
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
      </section>

      <ProductQuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <Footer />
    </div>
  );
};

export default Products;

