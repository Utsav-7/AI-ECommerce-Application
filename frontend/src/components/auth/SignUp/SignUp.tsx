import { useState, type FormEvent } from 'react';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { RegisterRequest } from '../../../types/auth.types';
import { validators } from '../../../utils/validators';
import styles from './SignUp.module.css';

interface SignUpProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type RegistrationType = 'User' | 'Seller';

interface FormData extends RegisterRequest {
  gstNumber: string;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [registrationType, setRegistrationType] = useState<RegistrationType>('User');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gstNumber: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isSeller = registrationType === 'Seller';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    const firstNameError = validators.required(formData.firstName, 'First name');
    if (firstNameError) {
      newErrors.firstName = firstNameError;
    }

    const lastNameError = validators.required(formData.lastName, 'Last name');
    if (lastNameError) {
      newErrors.lastName = lastNameError;
    }

    const emailError = validators.email(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validators.password(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmPasswordError = validators.confirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    if (formData.phoneNumber) {
      const phoneError = validators.phoneNumber(formData.phoneNumber);
      if (phoneError) {
        newErrors.phoneNumber = phoneError;
      }
    }

    // GST validation for sellers
    if (isSeller) {
      const gstError = validators.gstNumber(formData.gstNumber, true);
      if (gstError) {
        newErrors.gstNumber = gstError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toastService.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const requestData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber || undefined,
        role: registrationType,
        gstNumber: isSeller ? formData.gstNumber : undefined,
      };

      const response = await authService.register(requestData);
      
      if (isSeller) {
        toastService.success(
          'Registration successful! Your seller account is pending admin approval.',
          5000
        );
      } else {
        toastService.success('Registration successful! You can now login.');
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRegistrationTypeChange = (type: RegistrationType) => {
    setRegistrationType(type);
    // Clear GST error when switching to User
    if (type === 'User') {
      setErrors((prev) => ({ ...prev, gstNumber: undefined }));
    }
  };

  return (
    <div className={styles.signUpContainer}>
      <h2 className={styles.title}>Sign Up</h2>
      
      {/* Registration Type Toggle */}
      <div className={styles.toggleContainer}>
        <div className={styles.toggleWrapper}>
          <button
            type="button"
            className={`${styles.toggleButton} ${!isSeller ? styles.toggleActive : ''}`}
            onClick={() => handleRegistrationTypeChange('User')}
          >
            <span className={styles.toggleIcon}>👤</span>
            Customer
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${isSeller ? styles.toggleActive : ''}`}
            onClick={() => handleRegistrationTypeChange('Seller')}
          >
            <span className={styles.toggleIcon}>🏪</span>
            Seller
          </button>
        </div>
        {isSeller && (
          <p className={styles.sellerNote}>
            Seller accounts require admin approval before activation
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              placeholder="First name"
            />
            {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              placeholder="Last name"
            />
            {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            Phone Number <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
            placeholder="Enter your phone number"
          />
          {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
        </div>

        {/* GST Number field for Sellers */}
        {isSeller && (
          <div className={styles.formGroup}>
            <label htmlFor="gstNumber" className={styles.label}>
              GST Number <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className={`${styles.input} ${errors.gstNumber ? styles.inputError : ''}`}
              placeholder="e.g., 22AAAAA0000A1Z5"
              maxLength={15}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.gstNumber && <span className={styles.error}>{errors.gstNumber}</span>}
            <span className={styles.hint}>15-character GST identification number</span>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Enter your password"
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <span className={styles.error}>{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
        >
          {isLoading ? 'Registering...' : isSeller ? 'Register as Seller' : 'Sign Up'}
        </button>

        {onSwitchToLogin && (
          <p className={styles.switchText}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={styles.switchButton}
            >
              Login
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default SignUp;
