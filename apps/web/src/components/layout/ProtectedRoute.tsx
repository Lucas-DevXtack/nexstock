import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTenant } from '../../app/providers/TenantProvider';

export default function ProtectedRoute() {
  const { token } = useAuth();
  const { tenantId } = useTenant();

  if (!token) return <Navigate to="/login" replace />;
  if (!tenantId) return <Navigate to="/tenant/select" replace />;
  return <Outlet />;
}
