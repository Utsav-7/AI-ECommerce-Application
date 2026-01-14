export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5049';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    ME: '/api/Auth/me',
    RESET_PASSWORD: '/api/Auth/reset-password',
    VERIFY_OTP_RESET_PASSWORD: '/api/Auth/verify-otp-reset-password',
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_info',
} as const;

