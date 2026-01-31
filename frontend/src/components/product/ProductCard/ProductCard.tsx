import { Link } from 'react-router-dom';
import { toastService } from '../../../services/toast/toastService';
import type { ProductPublic } from '../../../types/product.types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductPublic;
  onProductClick?: (product: ProductPublic) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const getImageUrl = () => {
    if (product.imageUrl) {
      // If imageUrl is a base64 string, use it directly
      if (product.imageUrl.startsWith('data:image')) {
        return product.imageUrl;
      }
      // If it's a full URL, use it directly
      if (product.imageUrl.startsWith('http://') || product.imageUrl.startsWith('https://')) {
        return product.imageUrl;
      }
      // Try to load from assets folder - construct filename from product name
      const fileName = product.name
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_') + '.jpg';
      
      try {
        // Try dynamic import for the image
        return `/src/assets/products/${fileName}`;
      } catch {
        return product.imageUrl;
      }
    }
    // Fallback: try to construct filename from product name
    const fileName = product.name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_') + '.jpg';
    return `/src/assets/products/${fileName}`;
  };

  const calculateDiscount = () => {
    if (product.discountPrice && product.price) {
      const discount = ((product.price - product.discountPrice) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discountPercentage = calculateDiscount();
  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    toastService.success(`${product.name} added to cart`);
    // Cart integration can be added here
  };

  const cardContent = (
    <>
      <div className={styles.productImageWrapper}>
        <img 
          src={getImageUrl()} 
          alt={product.name}
          className={styles.productImage}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('product1.jpg')) {
              target.src = '/src/assets/Products/product1.jpg';
            }
          }}
        />
        {discountPercentage > 0 && (
          <div className={styles.discountBadge}>{discountPercentage}% OFF</div>
        )}
        {!product.inStock && (
          <div className={styles.outOfStockBadge}>Out of Stock</div>
        )}
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription} title={product.description}>
          {product.description.length > 60 
            ? `${product.description.substring(0, 60)}...` 
            : product.description}
        </p>
        <div className={styles.productCategory}>{product.categoryName}</div>
        <div className={styles.productPriceRow}>
          <span className={styles.productPrice}>₹{displayPrice.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className={styles.productOriginalPrice}>
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className={styles.productSeller}>Sold by: {product.sellerName}</div>
        <div className={styles.actionButtons}>
          {onProductClick ? (
            <button
              type="button"
              className={styles.viewBtn}
              onClick={handleViewClick}
            >
              View
            </button>
          ) : (
            <Link to={`/product/${product.id}`} className={styles.viewBtn}>
              View
            </Link>
          )}
          <button
            type="button"
            className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
            onClick={handleAddToCartClick}
            disabled={!product.inStock}
            aria-label="Add to cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.productCard}>
      {cardContent}
    </div>
  );
};

export default ProductCard;

