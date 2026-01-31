import { Navigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { getDashboardPathByUserInfo } from '../utils/routeHelpers';

interface GuestRouteProps {
  children: React.ReactElement;
}

/**
 * Guard for public-only routes (Home, Login, Register).
 * If user is already logged in, redirect to their role-based dashboard.
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  if (authService.isAuthenticated()) {
    const userInfo = authService.getUserInfo();
    const dashboardPath = getDashboardPathByUserInfo(userInfo);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default GuestRoute;
