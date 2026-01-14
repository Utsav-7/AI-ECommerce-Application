import { Navigate } from 'react-router-dom';
import { authService } from '../services/api/authService';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

