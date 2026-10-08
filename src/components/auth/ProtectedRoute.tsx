import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { loading: companyLoading } = useCompany();
  const location = useLocation();

  if (authLoading || companyLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading FormaDesk...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
