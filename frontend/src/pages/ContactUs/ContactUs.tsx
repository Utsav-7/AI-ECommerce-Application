import { useState, FormEvent } from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import { toastService } from '../../services/toast/toastService';
import styles from './ContactUs.module.css';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toastService.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toastService.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toastService.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroSubtitle}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* Contact Information */}
            <div className={styles.contactInfo}>
              <h2 className={styles.infoTitle}>Get in Touch</h2>
              <p className={styles.infoDescription}>
                We're here to help and answer any question you might have. We look forward to hearing from you!
              </p>

              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>📍</div>
                  <div className={styles.infoContent}>
                    <h3 className={styles.infoCardTitle}>Visit Us</h3>
                    <p className={styles.infoCardText}>
                      123 E-Commerce Street<br />
                      Business District<br />
                      City, State 12345
                    </p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>📧</div>
                  <div className={styles.infoContent}>
                    <h3 className={styles.infoCardTitle}>Email Us</h3>
                    <p className={styles.infoCardText}>
                      support@ecommerce.com<br />
                      sales@ecommerce.com
                    </p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>📞</div>
                  <div className={styles.infoContent}>
                    <h3 className={styles.infoCardTitle}>Call Us</h3>
                    <p className={styles.infoCardText}>
                      +1 (555) 123-4567<br />
                      Mon-Fri: 9AM - 6PM
                    </p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>💬</div>
                  <div className={styles.infoContent}>
                    <h3 className={styles.infoCardTitle}>Live Chat</h3>
                    <p className={styles.infoCardText}>
                      Available 24/7<br />
                      Instant support
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.socialSection}>
                <h3 className={styles.socialTitle}>Follow Us</h3>
                <div className={styles.socialLinks}>
                  <a href="#" className={styles.socialLink} aria-label="Facebook">
                    <span>📘</span>
                  </a>
                  <a href="#" className={styles.socialLink} aria-label="Twitter">
                    <span>🐦</span>
                  </a>
                  <a href="#" className={styles.socialLink} aria-label="Instagram">
                    <span>📷</span>
                  </a>
                  <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                    <span>💼</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.contactForm}>
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Send us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.formLabel}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.formLabel}>
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.formInput}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={styles.formTextarea}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>What are your business hours?</h3>
              <p className={styles.faqAnswer}>
                Our customer support team is available Monday through Friday, 9 AM to 6 PM EST. 
                Our online store is open 24/7 for your convenience.
              </p>
            </div>
            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>How long does shipping take?</h3>
              <p className={styles.faqAnswer}>
                Standard shipping typically takes 3-5 business days. Express shipping options 
                are available for faster delivery within 1-2 business days.
              </p>
            </div>
            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>What is your return policy?</h3>
              <p className={styles.faqAnswer}>
                We offer a 30-day return policy on most items. Products must be unused and in 
                original packaging. Contact us to initiate a return.
              </p>
            </div>
            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>Do you offer international shipping?</h3>
              <p className={styles.faqAnswer}>
                Yes, we ship to many countries worldwide. Shipping costs and delivery times 
                vary by location. Check at checkout for details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
