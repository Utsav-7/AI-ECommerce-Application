import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import { authService } from '../../../services/api/authService';
import { categoryService } from '../../../services/api/categoryService';
import type { Category } from '../../../types/category.types';
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


const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);

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

    const currentRef = categoriesRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  if (!userInfo) {
    return null;
  }

  // Map categories with images (fallback to default if category image not found)
  const categoryImageMap: Record<string, string> = {
    'Fruits & Vegetables': fruitsCategory,
    'Drinks & Beverages': beveragesCategory,
    'Beverages': beveragesCategory,
    'Biscuits & Snacks': biscuitsCategory,
    'Bread & Bakery': breadCategory,
    'Breakfast & Dairy': breakfastCategory,
    'Frozen Foods': frozenCategory,
    'Grocery & Staples': groceryCategory,
    'Meat & Seafoods': meatCategory,
    'Baby & Pregnancy': babyCategory,
    'Baby & Pregency': babyCategory,
    'Healthcare': healthcareCategory,
    'Household Needs': householdCategory,
    'Household needs': householdCategory,
  };

  const getCategoryImage = (categoryName: string): string => {
    return categoryImageMap[categoryName] || fruitsCategory;
  };

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
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className={styles.categoryCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.categoryImageWrapper}>
                    <img 
                      src={getCategoryImage(category.name)} 
                      alt={category.name}
                      className={styles.categoryImage}
                    />
                    <div className={styles.categoryOverlay}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>Loading categories...</p>
            )}
          </div>
        </div>
      </section>

      {/* Sale Section */}
      <section className={styles.saleSection}>
        <div className={styles.container}>
          <div className={styles.saleBanner}>
            <div className={styles.saleContent}>
              <div className={styles.saleBadge}>MEGA SALE</div>
              <h2 className={styles.saleTitle}>Up to 70% OFF</h2>
              <p className={styles.saleDescription}>
                Don't miss out on our biggest sale of the year! Limited time only.
              </p>
              <Link to="/products" className={styles.saleButton}>
                Shop Now
              </Link>
            </div>
            <div className={styles.saleTimer}>
              <div className={styles.timerItem}>
                <div className={styles.timerValue}>23</div>
                <div className={styles.timerLabel}>Hours</div>
              </div>
              <div className={styles.timerSeparator}>:</div>
              <div className={styles.timerItem}>
                <div className={styles.timerValue}>59</div>
                <div className={styles.timerLabel}>Minutes</div>
              </div>
              <div className={styles.timerSeparator}>:</div>
              <div className={styles.timerItem}>
                <div className={styles.timerValue}>45</div>
                <div className={styles.timerLabel}>Seconds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className={styles.offersSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Special Offers</h2>
          <div className={styles.offersGrid}>
            <div className={styles.offerCard}>
              <div className={styles.offerIcon}>🎁</div>
              <div className={styles.offerBadge}>50% OFF</div>
              <h3 className={styles.offerTitle}>Flash Sale</h3>
              <p className={styles.offerDescription}>
                Get up to 50% off on selected items. Limited time only!
              </p>
              <Link to="/products" className={styles.offerButton}>
                Shop Now
              </Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerIcon}>🚚</div>
              <div className={styles.offerBadge}>FREE</div>
              <h3 className={styles.offerTitle}>Free Delivery</h3>
              <p className={styles.offerDescription}>
                Free shipping on orders above ₹500. Shop now and save!
              </p>
              <Link to="/products" className={styles.offerButton}>
                Shop Now
              </Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerIcon}>🆕</div>
              <div className={styles.offerBadge}>NEW</div>
              <h3 className={styles.offerTitle}>New Arrivals</h3>
              <p className={styles.offerDescription}>
                Check out our newest additions. Fresh products every week!
              </p>
              <Link to="/products" className={styles.offerButton}>
                Shop Now
              </Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerIcon}>💰</div>
              <div className={styles.offerBadge}>BUY 2 GET 1</div>
              <h3 className={styles.offerTitle}>Buy More, Save More</h3>
              <p className={styles.offerDescription}>
                Buy 2 items and get 1 free on selected categories!
              </p>
              <Link to="/products" className={styles.offerButton}>
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisement Section */}
      <section className={styles.advertisementSection}>
        <div className={styles.container}>
          <div className={styles.adBanner}>
            <div className={styles.adContent}>
              <h2 className={styles.adTitle}>Premium Membership</h2>
              <p className={styles.adDescription}>
                Join our premium membership and enjoy exclusive benefits, early access to sales, 
                and special discounts throughout the year.
              </p>
              <div className={styles.adFeatures}>
                <div className={styles.adFeature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Exclusive Discounts</span>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Free Shipping Always</span>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Early Access to Sales</span>
                </div>
                <div className={styles.adFeature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span>Priority Customer Support</span>
                </div>
              </div>
              <Link to="/register" className={styles.adButton}>
                Join Now
              </Link>
            </div>
            <div className={styles.adImage}>
              <div className={styles.adPlaceholder}>
                <span className={styles.adPlaceholderText}>Premium Membership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserDashboard;
