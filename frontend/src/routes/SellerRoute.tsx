import { Navigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { getDashboardPathByUserInfo } from '../utils/routeHelpers';
import { UserRoleValues } from '../types/auth.types';

interface SellerRouteProps {
  children: React.ReactElement;
}

const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Seller;
  if (typeof role === 'number') return role === 2;
  return false;
};

/**
 * Guard for Seller-only routes.
 * If not authenticated → redirect to login.
 * If authenticated but not Seller → redirect to user's dashboard (Admin or Customer).
 */
const SellerRoute: React.FC<SellerRouteProps> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = authService.getUserInfo();
  if (!isSellerRole(userInfo?.role)) {
    const dashboardPath = getDashboardPathByUserInfo(userInfo);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default SellerRoute;
