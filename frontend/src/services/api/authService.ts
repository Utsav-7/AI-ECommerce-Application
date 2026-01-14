import apiClient from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';
import type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, ResetPasswordRequest, VerifyOtpRequest, UserRole } from '../../types/auth.types';
import { UserRoleValues } from '../../types/auth.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

// Helper function to normalize role (convert numeric to string)
const normalizeRole = (role: UserRole | number | string): UserRole => {
  // If role is already a string matching our enum values, return it
  if (typeof role === 'string' && Object.values(UserRoleValues).includes(role as UserRole)) {
    return role as UserRole;
  }
  
  // If role is a number, convert it to string
  if (typeof role === 'number') {
    switch (role) {
      case 1:
        return UserRoleValues.Admin;
      case 2:
        return UserRoleValues.Seller;
      case 3:
        return UserRoleValues.User;
      default:
        return UserRoleValues.User;
    }
  }
  
  // Default fallback
  return UserRoleValues.User;
};

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data.success && response.data.data) {
        const loginData = response.data.data;
        
        // Normalize role: convert numeric role to string if needed
        const normalizedUserInfo = {
          ...loginData.userInfo,
          role: normalizeRole(loginData.userInfo.role)
        };
        
        // Store tokens and user info
        localStorage.setItem(STORAGE_KEYS.TOKEN, loginData.token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUserInfo));

        return {
          ...loginData,
          userInfo: normalizedUserInfo
        };
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getUserInfo() {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userInfo) {
      return null;
    }
    
    const parsed = JSON.parse(userInfo);
    // Normalize role in case it's stored as numeric
    if (parsed && parsed.role) {
      parsed.role = normalizeRole(parsed.role);
    }
    return parsed;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async sendPasswordResetOtp(email: string): Promise<void> {
    try {
      const request: ResetPasswordRequest = { email };
      const response = await apiClient.post<ApiResponse<object>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async verifyOtpAndResetPassword(request: VerifyOtpRequest): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        API_ENDPOINTS.AUTH.VERIFY_OTP_RESET_PASSWORD,
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

