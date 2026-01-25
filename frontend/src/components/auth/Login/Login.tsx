import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { toastService } from '../../../services/toast/toastService';
import type { LoginRequest } from '../../../types/auth.types';
import { validators } from '../../../utils/validators';
import Modal from '../../common/Modal/Modal';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import ResetPassword from '../ResetPassword/ResetPassword';
import styles from './Login.module.css';

interface LoginProps {
  onSuccess?: (userInfo?: any) => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    const emailError = validators.email(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validators.password(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const loginResponse = await authService.login(formData);
      toastService.success('Login successful! Welcome back.');
      if (onSuccess) {
        // Pass userInfo to onSuccess callback for immediate redirect
        onSuccess(loginResponse.userInfo);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrorMessage('');
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

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

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className={styles.linksContainer}>
          {onSwitchToRegister && (
            <p className={styles.switchText}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className={styles.switchButton}
              >
                Sign Up
              </button>
            </p>
          )}
          <p className={styles.forgotPasswordText}>
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className={styles.forgotPasswordButton}
            >
              Forgot Password?
            </button>
          </p>
        </div>
      </form>

      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      >
        <ForgotPassword
          onSuccess={(email) => {
            if (email) {
              setResetEmail(email);
              setIsForgotPasswordOpen(false);
              setTimeout(() => {
                setIsResetPasswordOpen(true);
              }, 300);
            }
          }}
          onBackToLogin={() => setIsForgotPasswordOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      >
        <ResetPassword
          email={resetEmail}
          onSuccess={() => {
            setIsResetPasswordOpen(false);
          }}
          onBack={() => {
            setIsResetPasswordOpen(false);
            setIsForgotPasswordOpen(true);
          }}
        />
      </Modal>
    </div>
  );
};

export default Login;

