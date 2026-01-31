import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import styles from './AboutUs.module.css';

const AboutUs: React.FC = () => {
  return (
    <div className={styles.aboutContainer}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>About Us</h1>
            <p className={styles.heroSubtitle}>
              Your trusted partner in online shopping, delivering quality products and exceptional service since day one.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionContent}>
              <h2 className={styles.sectionTitle}>Our Mission</h2>
              <p className={styles.missionText}>
                We're on a mission to revolutionize online shopping by providing a seamless, 
                reliable, and enjoyable experience for every customer. Our platform connects 
                buyers with quality products from trusted sellers, ensuring satisfaction at 
                every step of the journey.
              </p>
              <p className={styles.missionText}>
                We believe in transparency, quality, and customer-first service. Whether you're 
                shopping for daily essentials or special items, we're here to make your 
                experience effortless and delightful.
              </p>
            </div>
            <div className={styles.missionImage}>
              <div className={styles.missionImagePlaceholder}>
                <span className={styles.missionIcon}>🎯</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>🌟</div>
              <h3 className={styles.valueTitle}>Quality First</h3>
              <p className={styles.valueDescription}>
                We partner with verified sellers to ensure every product meets our high standards.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>💎</div>
              <h3 className={styles.valueTitle}>Customer Trust</h3>
              <p className={styles.valueDescription}>
                Building lasting relationships through transparency and reliable service.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>🚀</div>
              <h3 className={styles.valueTitle}>Innovation</h3>
              <p className={styles.valueDescription}>
                Continuously improving our platform to deliver the best shopping experience.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>🤝</div>
              <h3 className={styles.valueTitle}>Community</h3>
              <p className={styles.valueDescription}>
                Supporting local sellers and fostering a thriving marketplace ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Happy Customers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Trusted Sellers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>Products Available</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>99%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🛡️</div>
              <h3 className={styles.whyTitle}>Secure Shopping</h3>
              <p className={styles.whyDescription}>
                Your data and transactions are protected with industry-leading security measures.
              </p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🚚</div>
              <h3 className={styles.whyTitle}>Fast Delivery</h3>
              <p className={styles.whyDescription}>
                Quick and reliable shipping to get your orders to you on time, every time.
              </p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>💳</div>
              <h3 className={styles.whyTitle}>Easy Payments</h3>
              <p className={styles.whyDescription}>
                Multiple payment options for your convenience and peace of mind.
              </p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>📞</div>
              <h3 className={styles.whyTitle}>24/7 Support</h3>
              <p className={styles.whyDescription}>
                Our dedicated support team is always here to help you with any questions.
              </p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>↩️</div>
              <h3 className={styles.whyTitle}>Easy Returns</h3>
              <p className={styles.whyDescription}>
                Hassle-free return policy to ensure your complete satisfaction.
              </p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>⭐</div>
              <h3 className={styles.whyTitle}>Quality Guarantee</h3>
              <p className={styles.whyDescription}>
                Every product is verified to meet our quality standards before shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Start Shopping?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of satisfied customers and discover amazing products today.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/products" className={styles.ctaPrimary}>
                Browse Products
              </Link>
              <Link to="/contact" className={styles.ctaSecondary}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
