import { Navigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { getDashboardPathByUserInfo } from '../utils/routeHelpers';
import { UserRoleValues } from '../types/auth.types';

interface CustomerRouteProps {
  children: React.ReactElement;
}

const isCustomerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.User;
  if (typeof role === 'number') return role === 3;
  return false;
};

/**
 * Guard for Customer (User) only routes: /user/dashboard, /account.
 * If not authenticated → redirect to login.
 * If authenticated but not Customer (e.g. Admin or Seller) → redirect to their dashboard.
 */
const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = authService.getUserInfo();
  if (!isCustomerRole(userInfo?.role)) {
    const dashboardPath = getDashboardPathByUserInfo(userInfo);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default CustomerRoute;
