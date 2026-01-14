import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { authService } from '../../../services/api/authService';
import styles from './Dashboard.module.css';

// Import category images
import fruitsCategory from '../../../assets/Categories/Fruits & Vegetables.png';
import beveragesCategory from '../../../assets/Categories/Beverages.png';
import biscuitsCategory from '../../../assets/Categories/Biscuits & Snacks.png';
import breadCategory from '../../../assets/Categories/Bread & Bakery.png';
import breakfastCategory from '../../../assets/Categories/Breakfast & Dairy.png';
import frozenCategory from '../../../assets/Categories/Frozen Foods.png';
import groceryCategory from '../../../assets/Categories/Grocery & Staples.png';
import meatCategory from '../../../assets/Categories/Meat & Seafoods.png';
import babyCategory from '../../../assets/Categories/Baby & Pregency.png';
import healthcareCategory from '../../../assets/Categories/Healthcare.png';
import householdCategory from '../../../assets/Categories/Household needs.png';

// Import product images
import product1 from '../../../assets/Products/product1.jpg';
import product2 from '../../../assets/Products/product2.jpg';
import product3 from '../../../assets/Products/product3.jpg';
import product4 from '../../../assets/Products/product4.jpg';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsCategoriesVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (categoriesRef.current) {
      observer.observe(categoriesRef.current);
    }

    return () => {
      if (categoriesRef.current) {
        observer.unobserve(categoriesRef.current);
      }
    };
  }, []);

  if (!userInfo) {
    return null;
  }

  const categories = [
    { name: 'Fruits & Vegetables', image: fruitsCategory },
    { name: 'Beverages', image: beveragesCategory },
    { name: 'Biscuits & Snacks', image: biscuitsCategory },
    { name: 'Bread & Bakery', image: breadCategory },
    { name: 'Breakfast & Dairy', image: breakfastCategory },
    { name: 'Frozen Foods', image: frozenCategory },
    { name: 'Grocery & Staples', image: groceryCategory },
    { name: 'Meat & Seafoods', image: meatCategory },
    { name: 'Baby & Pregnancy', image: babyCategory },
    { name: 'Healthcare', image: healthcareCategory },
    { name: 'Household Needs', image: householdCategory },
  ];

  const products = [
    { id: 1, name: 'Premium Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 14999, image: product1, rating: 4.5, reviews: 234 },
    { id: 2, name: 'Smart Watch', description: 'Feature-rich smartwatch with health tracking', price: 18999, image: product2, rating: 4.8, reviews: 456 },
    { id: 3, name: 'Running Shoes', description: 'Comfortable athletic shoes for daily runs', price: 9999, image: product3, rating: 4.3, reviews: 189 },
    { id: 4, name: 'Sunglasses', description: 'Stylish UV protection sunglasses', price: 2999, image: product4, rating: 4.6, reviews: 312 },
    { id: 5, name: 'Wireless Earbuds', description: 'True wireless earbuds with long battery life', price: 4999, image: product1, rating: 4.4, reviews: 567 },
    { id: 6, name: 'Fitness Tracker', description: 'Advanced fitness tracking with heart rate monitor', price: 7999, image: product2, rating: 4.7, reviews: 423 },
    { id: 7, name: 'Backpack', description: 'Durable travel backpack with laptop compartment', price: 3499, image: product3, rating: 4.2, reviews: 278 },
    { id: 8, name: 'Water Bottle', description: 'Insulated stainless steel water bottle', price: 1999, image: product4, rating: 4.5, reviews: 145 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      
      {/* Hero Section with Greeting */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {getGreeting()}, <span className={styles.highlight}>{userInfo.firstName}!</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome back to your shopping dashboard. Discover amazing products and great deals.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection} ref={categoriesRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={`${styles.categoriesGrid} ${isCategoriesVisible ? styles.categoriesVisible : ''}`}>
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className={styles.categoryCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.categoryImageWrapper}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className={styles.categoryImage}
                  />
                  <div className={styles.categoryOverlay}>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={styles.productImageImg}
                  />
                  <div className={styles.productBadge}>New</div>
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  <div className={styles.productRating}>
                    <span className={styles.stars}>
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span className={styles.ratingText}>({product.reviews})</span>
                  </div>
                  <div className={styles.productPriceRow}>
                    <div className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</div>
                    <div className={styles.productOriginalPrice}>₹{(product.price * 1.2).toLocaleString('en-IN')}</div>
                    <div className={styles.productDiscount}>20% off</div>
                  </div>
                  <button className={styles.addToCartBtn}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.viewAllContainer}>
            <Link to="/products" className={styles.viewAllButton}>
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserDashboard;
