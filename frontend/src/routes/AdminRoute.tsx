import { Navigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { getDashboardPathByUserInfo } from '../utils/routeHelpers';
import { UserRoleValues } from '../types/auth.types';

interface AdminRouteProps {
  children: React.ReactElement;
}

const isAdminRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Admin;
  if (typeof role === 'number') return role === 1;
  return false;
};

/**
 * Guard for Admin-only routes.
 * If not authenticated → redirect to login.
 * If authenticated but not Admin → redirect to user's dashboard (Seller or Customer).
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = authService.getUserInfo();
  if (!isAdminRole(userInfo?.role)) {
    const dashboardPath = getDashboardPathByUserInfo(userInfo);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default AdminRoute;
