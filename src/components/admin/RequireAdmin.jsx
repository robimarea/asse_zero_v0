import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';

export default function RequireAdmin() {
  const { admin, status } = useAdminAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <p className="srOnly">Verifica sessione amministratore</p>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const role = admin.role ?? 'admin';
  if (role !== 'admin' && role !== 'editor') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
