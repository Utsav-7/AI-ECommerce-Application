export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  gstNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  gstNumber?: string;
  createdAt: string;
}

export interface PendingSeller {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gstNumber?: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  pendingSellers: number;
}
