import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';

export default function RoleRoute({ requiredRole = 'owner' }) {
  const isOwner = useAppSelector(selectIsOwner);

  if (requiredRole === 'owner' && !isOwner) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

