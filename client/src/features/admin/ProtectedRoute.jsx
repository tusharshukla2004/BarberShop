import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectCanAccessAdmin, selectAuthStatus } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApi';

export default function ProtectedRoute() {
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const canAccess = useAppSelector(selectCanAccessAdmin);
  const status = useAppSelector(selectAuthStatus);

  // Skip query if already authenticated in state
  const { isLoading } = useGetMeQuery(undefined, { skip: Boolean(currentUser) });

  if (isLoading && status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-on-dark-muted font-semibold">
            Verifying Terminal Session...
          </span>
        </div>
      </div>
    );
  }

  if (!canAccess || !currentUser) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?returnTo=${returnTo}`} replace />;
  }

  // Enforce password change on first login
  if (currentUser.mustChangePassword && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
}
