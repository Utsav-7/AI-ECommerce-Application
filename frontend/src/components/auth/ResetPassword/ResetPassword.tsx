import { useState, type FormEvent } from 'react';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { VerifyOtpRequest } from '../../../types/auth.types';
import { validators } from '../../../utils/validators';
import styles from './ResetPassword.module.css';

interface ResetPasswordProps {
  email?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email: emailProp, onSuccess, onBack }) => {
  const [formData, setFormData] = useState<VerifyOtpRequest>({
    email: emailProp || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VerifyOtpRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VerifyOtpRequest, string>> = {};

    const emailError = validators.email(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d+$/.test(formData.otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    const passwordError = validators.password(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    const confirmPasswordError = validators.confirmPassword(
      formData.newPassword,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
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
      await authService.verifyOtpAndResetPassword(formData);
      setSuccessMessage('Password has been reset successfully!');
      toastService.success('Password reset successfully!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setErrorMessage(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof VerifyOtpRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <h2 className={styles.title}>Reset Password</h2>
      <p className={styles.subtitle}>
        Enter the OTP sent to your email and your new password.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

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
            disabled={!!emailProp}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="otp" className={styles.label}>
            OTP
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            className={`${styles.input} ${errors.otp ? styles.inputError : ''}`}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            disabled={isLoading}
          />
          {errors.otp && <span className={styles.error}>{errors.otp}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
            placeholder="Enter new password"
            disabled={isLoading}
          />
          {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}
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
            placeholder="Confirm new password"
            disabled={isLoading}
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
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        {onBack && (
          <p className={styles.switchText}>
            <button
              type="button"
              onClick={onBack}
              className={styles.switchButton}
            >
              Back
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;

