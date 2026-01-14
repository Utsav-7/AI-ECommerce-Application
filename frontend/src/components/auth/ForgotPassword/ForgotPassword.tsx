import { useState, type FormEvent } from 'react';
import { authService } from '../../../services/api/authService';
import { validators } from '../../../utils/validators';
import { toastService } from '../../../services/toast/toastService';
import styles from './ForgotPassword.module.css';

interface ForgotPasswordProps {
  onSuccess?: (email?: string) => void;
  onBackToLogin?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSuccess, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validate = (): boolean => {
    const emailError = validators.email(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

      setIsLoading(true);
    try {
      await authService.sendPasswordResetOtp(email);
      setSuccessMessage('OTP has been sent to your email address. Please check your inbox.');
      toastService.success('OTP sent successfully!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(email);
        }
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h2 className={styles.title}>Forgot Password</h2>
      <p className={styles.subtitle}>
        Enter your email address and we'll send you an OTP to reset your password.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>

        {onBackToLogin && (
          <p className={styles.switchText}>
            Remember your password?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className={styles.switchButton}
            >
              Back to Login
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;

