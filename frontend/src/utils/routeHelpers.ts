import { UserRoleValues, type UserRole } from '../types/auth.types';
import type { UserInfo } from '../types/auth.types';

// Helper to normalize role (handle both numeric and string)
const normalizeRole = (role: UserRole | number | string): UserRole => {
  if (typeof role === 'string' && Object.values(UserRoleValues).includes(role as UserRole)) {
    return role as UserRole;
  }
  
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
  
  return UserRoleValues.User;
};

export const getDashboardPath = (role: UserRole | number | string): string => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case UserRoleValues.Admin:
      return '/admin/dashboard';
    case UserRoleValues.Seller:
      return '/seller/dashboard';
    case UserRoleValues.User:
    default:
      return '/user/dashboard';
  }
};

export const getDashboardPathByUserInfo = (userInfo: UserInfo | null): string => {
  if (!userInfo) {
    return '/';
  }
  return getDashboardPath(userInfo.role);
};

export const getAccountPathByUserInfo = (userInfo: UserInfo | null): string => {
  if (!userInfo) {
    return '/account';
  }
  const role = normalizeRole(userInfo.role);
  switch (role) {
    case UserRoleValues.Admin:
      return '/admin/account';
    case UserRoleValues.Seller:
      return '/seller/account';
    case UserRoleValues.User:
    default:
      return '/account';
  }
};

