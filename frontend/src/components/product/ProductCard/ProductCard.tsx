import { Link } from 'react-router-dom';
import type { ProductPublic } from '../../../types/product.types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductPublic;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

  return (
    <Link to={`/product/${product.id}`} className={styles.productCard}>
      <div className={styles.productImageWrapper}>
        <img 
          src={getImageUrl()} 
          alt={product.name}
          className={styles.productImage}
          onError={(e) => {
            // Fallback to default image on error
            e.currentTarget.src = '/src/assets/Products/product1.jpg';
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
        <button 
          className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            // Add to cart functionality will be handled here
          }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

