export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5049';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    ME: '/api/Auth/me',
    RESET_PASSWORD: '/api/Auth/reset-password',
    VERIFY_OTP_RESET_PASSWORD: '/api/Auth/verify-otp-reset-password',
  },
  CATEGORIES: {
    BASE: '/api/Categories',
    GET_ALL: '/api/Categories',
    GET_BY_ID: (id: number) => `/api/Categories/${id}`,
    CREATE: '/api/Categories',
    UPDATE: (id: number) => `/api/Categories/${id}`,
    DELETE: (id: number) => `/api/Categories/${id}`,
  },
  USERS: {
    BASE: '/api/Users',
    GET_ALL: '/api/Users',
    GET_BY_ID: (id: number) => `/api/Users/${id}`,
    GET_BY_ROLE: (role: string) => `/api/Users/role/${role}`,
    GET_PENDING_SELLERS: '/api/Users/pending-sellers',
    GET_STATS: '/api/Users/stats',
    UPDATE: (id: number) => `/api/Users/${id}`,
    UPDATE_STATUS: (id: number) => `/api/Users/${id}/status`,
    APPROVE_SELLER: (id: number) => `/api/Users/${id}/approve`,
    REJECT_SELLER: (id: number) => `/api/Users/${id}/reject`,
    DELETE: (id: number) => `/api/Users/${id}`,
  },
  PRODUCTS: {
    // Public endpoints (no auth required)
    PUBLIC_GET_ALL: '/api/Products/public',
    PUBLIC_GET_BY_ID: (id: number) => `/api/Products/public/${id}`,
    PUBLIC_GET_BY_CATEGORY: (categoryId: number) => `/api/Products/public/category/${categoryId}`,
    PUBLIC_SEARCH: '/api/Products/public/search',
    // Admin/Seller endpoints
    GET_ALL: '/api/Products',
    GET_BY_ID: (id: number) => `/api/Products/${id}`,
    GET_MY_PRODUCTS: '/api/Products/my-products',
    GET_BY_SELLER: (sellerId: number) => `/api/Products/seller/${sellerId}`,
    CREATE: '/api/Products',
    UPDATE: (id: number) => `/api/Products/${id}`,
    DELETE: (id: number) => `/api/Products/${id}`,
    TOGGLE_STATUS: (id: number) => `/api/Products/${id}/toggle-status`,
    TOGGLE_VISIBILITY: (id: number) => `/api/Products/${id}/toggle-visibility`,
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_info',
} as const;

