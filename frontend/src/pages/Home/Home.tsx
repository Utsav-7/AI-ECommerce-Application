import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { authService } from '../../services/api/authService';
import { productService } from '../../services/api/productService';
import { getDashboardPathByUserInfo } from '../../utils/routeHelpers';
import type { ProductPublic } from '../../types/product.types';
import styles from './Home.module.css';

// Import images
import landingPageImage from '../../assets/Landing_Page_Image.png';
import babyCategory from '../../assets/Categories/Baby & Pregency.png';
import beveragesCategory from '../../assets/Categories/Beverages.png';
import biscuitsCategory from '../../assets/Categories/Biscuits & Snacks.png';
import breadCategory from '../../assets/Categories/Bread & Bakery.png';
import breakfastCategory from '../../assets/Categories/Breakfast & Dairy.png';
import frozenCategory from '../../assets/Categories/Frozen Foods.png';
import fruitsCategory from '../../assets/Categories/Fruits & Vegetables.png';
import groceryCategory from '../../assets/Categories/Grocery & Staples.png';
import meatCategory from '../../assets/Categories/Meat & Seafoods.png';
import healthcareCategory from '../../assets/Categories/Healthcare.png';
import householdCategory from '../../assets/Categories/Household needs.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userInfo = authService.getUserInfo();
      const dashboardPath = getDashboardPathByUserInfo(userInfo);
      navigate(dashboardPath);
    }
  }, [navigate]);

  // Intersection Observer for category animations
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'Fruits & Vegetables', image: fruitsCategory },
    { name: 'Beverages', image: beveragesCategory },
    { name: 'Biscuits & Snacks', image: biscuitsCategory },
    { name: 'Bread & Bakery', image: breadCategory },
    { name: 'Breakfast & Dairy', image: breakfastCategory },
    { name: 'Frozen Foods', image: frozenCategory },
    { name: 'Grocery & Staples', image: groceryCategory },
    { name: 'Baby & Pregnancy', image: babyCategory },
    { name: 'Healthcare', image: healthcareCategory },
    { name: 'Household Needs', image: householdCategory },
  ];

  // State for limited products
  const [featuredProducts, setFeaturedProducts] = useState<ProductPublic[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch limited products (8 products)
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await productService.getPublicProducts();
      // Get first 8 products (or less if available)
      setFeaturedProducts(data.slice(0, 8));
    } catch (err) {
      console.error('Failed to fetch featured products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      text: "Amazing shopping experience! Fast delivery and great quality products.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Premium Member",
      text: "Best e-commerce platform I've used. Highly recommend to everyone!",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Verified Buyer",
      text: "Customer service is outstanding and products exceed expectations.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Loyal Customer",
      text: "Great prices and excellent customer support. Will shop again!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Premium Member",
      text: "Love the variety of products and fast shipping. Highly satisfied!",
      rating: 5
    },
    {
      name: "David Wilson",
      role: "Regular Customer",
      text: "Quality products at affordable prices. Best online shopping experience!",
      rating: 5
    }
  ];

  const brands = [
    { 
      name: 'Amazon', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 30C20 23.373 25.373 18 32 18C38.627 18 44 23.373 44 30C44 36.627 38.627 42 32 42C25.373 42 20 36.627 20 30Z" fill="#FF9900"/>
          <path d="M60 15L70 25L60 35" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="80" y="35" fill="#FF9900" fontSize="20" fontWeight="bold">amazon</text>
        </svg>
      )
    },
    { 
      name: 'Flipkart', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="40" height="40" rx="4" fill="#2874F0"/>
          <text x="60" y="38" fill="#2874F0" fontSize="18" fontWeight="bold">Flipkart</text>
        </svg>
      )
    },
    { 
      name: 'Nike', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 45Q30 20 50 30T90 25T130 20T170 15" stroke="#000" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <text x="10" y="55" fill="#000" fontSize="16" fontWeight="bold">NIKE</text>
        </svg>
      )
    },
    { 
      name: 'Apple', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 20C20 15 22 12 26 10C24 8 21 7 18 7C14 7 11 9 9 12C7 10 4 9 1 9V11C4 11 6 13 7 16C5 17 4 19 4 22C4 26 7 29 11 29H13C12 31 12 33 12 35C12 40 16 43 20 43C23 43 25 41 27 39C29 41 31 43 34 43C38 43 42 40 42 35C42 33 42 31 41 29H43C47 29 50 26 50 22C50 19 49 17 47 16C48 13 50 11 53 11V9C50 9 47 10 45 12C43 9 40 7 36 7C33 7 30 8 28 10C26 9 24 10 22 12C24 14 25 17 25 20H20Z" fill="#000"/>
        </svg>
      )
    },
    { 
      name: 'Samsung', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="30" rx="25" ry="20" fill="#1428A0"/>
          <text x="65" y="38" fill="#1428A0" fontSize="16" fontWeight="bold">SAMSUNG</text>
        </svg>
      )
    },
    { 
      name: 'Adidas', 
      logo: (
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 50L30 10L50 50" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M40 50L60 10L80 50" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <text x="90" y="38" fill="#000" fontSize="14" fontWeight="bold">adidas</text>
        </svg>
      )
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Shop Smart, <span className={styles.highlight}>Live Better</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/products" className={styles.primaryButton}>
                Shop Now
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                Login
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src={landingPageImage} 
              alt="E-commerce shopping experience" 
              className={styles.heroImageImg}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className={styles.categoriesSection} ref={categoriesRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={`${styles.categoriesGrid} ${isCategoriesVisible ? styles.categoriesVisible : ''}`}>
            {categories.map((category, index) => (
              <div 
                key={category.name} 
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
                    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className={styles.categoryLink}>
                      Shop Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#667eea" opacity="0.1"/>
                  <path d="M32 16L40 28H24L32 16Z" fill="#667eea"/>
                  <path d="M20 40L28 52H12L20 40Z" fill="#667eea"/>
                  <path d="M44 40L52 52H36L44 40Z" fill="#667eea"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Fast Delivery</h3>
              <p className={styles.featureDescription}>
                Get your orders delivered quickly with our express shipping options.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#667eea" opacity="0.1"/>
                  <path d="M32 20C25.373 20 20 25.373 20 32C20 38.627 25.373 44 32 44C38.627 44 44 38.627 44 32C44 25.373 38.627 20 32 20Z" fill="#667eea"/>
                  <path d="M28 32L30 34L36 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Quality Guaranteed</h3>
              <p className={styles.featureDescription}>
                All products are carefully selected and quality-checked before shipping.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#667eea" opacity="0.1"/>
                  <rect x="20" y="24" width="24" height="20" rx="2" fill="#667eea"/>
                  <path d="M20 30H44" stroke="white" strokeWidth="2"/>
                  <path d="M20 36H44" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Secure Payment</h3>
              <p className={styles.featureDescription}>
                Your transactions are safe and secure with our encrypted payment system.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#667eea" opacity="0.1"/>
                  <path d="M32 18L38 28H26L32 18Z" fill="#667eea"/>
                  <path d="M24 32L30 42H18L24 32Z" fill="#667eea"/>
                  <path d="M40 32L46 42H34L40 32Z" fill="#667eea"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>24/7 Support</h3>
              <p className={styles.featureDescription}>
                Our customer service team is always ready to help you with any questions.
              </p>
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
              <div className={styles.offerBadge}>50% OFF</div>
              <h3 className={styles.offerTitle}>Flash Sale</h3>
              <p className={styles.offerDescription}>Get up to 50% off on selected items. Limited time only!</p>
              <Link to="/products" className={styles.offerButton}>Shop Now</Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerBadge}>FREE SHIPPING</div>
              <h3 className={styles.offerTitle}>Free Delivery</h3>
              <p className={styles.offerDescription}>Free shipping on orders above ₹500. Shop now and save!</p>
              <Link to="/products" className={styles.offerButton}>Shop Now</Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerBadge}>NEW ARRIVALS</div>
              <h3 className={styles.offerTitle}>Latest Products</h3>
              <p className={styles.offerDescription}>Check out our newest additions. Fresh products every week!</p>
              <Link to="/products" className={styles.offerButton}>Shop Now</Link>
            </div>
            <div className={styles.offerCard}>
              <div className={styles.offerBadge}>BUY 2 GET 1</div>
              <h3 className={styles.offerTitle}>Buy More, Save More</h3>
              <p className={styles.offerDescription}>Buy 2 items and get 1 free on selected categories!</p>
              <Link to="/products" className={styles.offerButton}>Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          {productsLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}>Loading products...</div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyMessage}>No products available at the moment.</p>
            </div>
          ) : (
            <>
              <div className={styles.productsGrid}>
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className={styles.viewAllContainer}>
                <Link to="/products" className={styles.viewAllButton}>
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Brand Collaboration Section */}
      <section className={styles.brandsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Trusted Partners</h2>
          <p className={styles.brandsSubtitle}>We collaborate with leading brands to bring you the best products</p>
          <div className={styles.brandsGrid}>
            {brands.map((brand, index) => (
              <div key={index} className={styles.brandCard}>
                <div className={styles.brandLogo}>
                  {brand.logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className={styles.star}>★</span>
                  ))}
                </div>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="30" fill="#667eea" opacity="0.2"/>
                      <circle cx="32" cy="24" r="10" fill="#667eea"/>
                      <path d="M16 48C16 40 24 36 32 36C40 36 48 40 48 48" fill="#667eea"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.authorName}>{testimonial.name}</div>
                    <div className={styles.authorRole}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Start Shopping?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of satisfied customers and discover amazing products today!
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/products" className={styles.ctaPrimaryButton}>
                Browse Products
              </Link>
              <Link to="/register" className={styles.ctaSecondaryButton}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
