import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductPublic } from '../../../types/product.types';
import { toastService } from '../../../services/toast/toastService';
import { cartService } from '../../../services/api/cartService';
import styles from './ProductQuickViewModal.module.css';

const CART_UPDATED_EVENT = 'cartUpdated';

interface ProductQuickViewModalProps {
  product: ProductPublic | null;
  isOpen: boolean;
  onClose: () => void;
}

const getImageUrl = (url: string | undefined, productName: string): string => {
  if (!url) {
    const fileName = productName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_') + '.jpg';
    return `/src/assets/products/${fileName}`;
  }
  if (url.startsWith('data:image') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
};

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [qtyInput, setQtyInput] = useState('1');

  const allImages: string[] = product
    ? [
        ...(product.imageUrl ? [product.imageUrl] : []),
        ...(product.additionalImages || []),
      ].filter(Boolean)
    : [];

  const displayImages = allImages.length > 0
    ? allImages
    : product
      ? [getImageUrl(undefined, product.name)]
      : [];

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setQtyInput('1');
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.inStock) return;
    const displayPrice = product.discountPrice ?? product.price;
    try {
      await cartService.addItem(product.id, quantity, {
        productName: product.name,
        imageUrl: product.imageUrl,
        unitPrice: displayPrice,
      });
      toastService.success(`${product.name} x${quantity} added to cart`);
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
    } catch (err) {
      toastService.error(err instanceof Error ? err.message : 'Failed to add to cart');
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.inStock) return;
    toastService.success(`${product.name} x${quantity} added to cart`);
    onClose();
    navigate(`/product/${product.id}`);
    // Navigate to product detail/checkout when implemented
  };

  const minQty = 1;
  const maxQty = 99;

  const applyQuantityFromInput = () => {
    const parsed = parseInt(qtyInput.replace(/\D/g, ''), 10);
    const valid = isNaN(parsed) || parsed < minQty ? minQty : Math.min(parsed, maxQty);
    setQuantity(valid);
    setQtyInput(String(valid));
  };

  if (!isOpen || !product) return null;

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const discountPercentage = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className={styles.content}>
          {/* Image Section - Wide angle with thumbnails */}
          <div className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
              <img
                src={getImageUrl(displayImages[selectedImageIndex], product.name)}
                alt={product.name}
                className={styles.mainImage}
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
                <div className={styles.outOfStockOverlay}>Out of Stock</div>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    type="button"
                  >
                    <img
                      src={getImageUrl(img, product.name)}
                      alt={`${product.name} view ${index + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('product1.jpg')) {
                          target.src = '/src/assets/Products/product1.jpg';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className={styles.infoSection}>
            <h2 id="product-modal-title" className={styles.productName}>
              {product.name}
            </h2>
            <p className={styles.productCategory}>{product.categoryName}</p>
            <p className={styles.productDescription}>{product.description}</p>
            <p className={styles.seller}>Sold by: {product.sellerName}</p>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <span className={styles.originalPrice}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className={styles.quantitySection}>
              <span className={styles.quantityLabel}>Quantity</span>
              <div className={styles.quantitySelector}>
                <button
                  type="button"
                  className={styles.quantityBtn}
                  onClick={() => {
                    const q = Math.max(minQty, quantity - 1);
                    setQuantity(q);
                    setQtyInput(String(q));
                  }}
                  disabled={quantity <= minQty || !product.inStock}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.quantityInput}
                  value={qtyInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    setQtyInput(v || '');
                  }}
                  onBlur={applyQuantityFromInput}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  onFocus={(e) => e.target.select()}
                  disabled={!product.inStock}
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  className={styles.quantityBtn}
                  onClick={() => {
                    const q = Math.min(maxQty, quantity + 1);
                    setQuantity(q);
                    setQtyInput(String(q));
                  }}
                  disabled={quantity >= maxQty || !product.inStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </button>
              <button
                className={`${styles.buyBtn} ${!product.inStock ? styles.disabled : ''}`}
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
