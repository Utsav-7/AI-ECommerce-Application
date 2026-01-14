export const UserRoleValues = {
  Admin: 'Admin',
  Seller: 'Seller',
  User: 'User',
} as const;

export type UserRole = (typeof UserRoleValues)[keyof typeof UserRoleValues];

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  // role is not sent - backend sets it to User by default
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userInfo: UserInfo;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  message: string;
}
