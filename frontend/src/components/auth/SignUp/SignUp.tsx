import { useState, type FormEvent } from 'react';
import { authService } from '../../../services/api/authService';
import type { RegisterRequest } from '../../../types/auth.types';
import { validators } from '../../../utils/validators';
import styles from './SignUp.module.css';

interface SignUpProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterRequest, string>> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      // Don't send role field - backend will set it to User by default
      // This avoids enum conversion issues and ensures security
      await authService.register(formData);
      setSuccessMessage('Registration successful! You can now login.');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className={styles.signUpContainer}>
      <h2 className={styles.title}>Sign Up</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

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
          {isLoading ? 'Registering...' : 'Sign Up'}
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

