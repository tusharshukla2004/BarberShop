import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight, Scissors, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Seo from '@/components/common/Seo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { siteConfig } from '@/config/site';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLockedOut, setIsLockedOut] = useState(false);

  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo') || params.get('redirect') || '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    setIsLockedOut(false);
    try {
      const res = await login(data).unwrap();
      const user = res?.user || res?.data?.user;
      dispatch(
        addToast({
          type: 'success',
          message: `Welcome, ${user?.name || 'Staff'}. Session authenticated.`,
        })
      );
      if (user?.mustChangePassword) {
        navigate('/admin/change-password', { replace: true });
      } else {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      const message =
        err.message ||
        err.data?.message ||
        'Invalid email or password. Please verify your credentials.';
      const isLocked =
        message.toLowerCase().includes('locked') ||
        err.data?.error?.code === 'ACCOUNT_LOCKED';

      setIsLockedOut(isLocked);
      setAuthError(message);
      dispatch(addToast({ type: 'error', message }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-4 sm:p-6 text-white relative overflow-hidden">
      <Seo
        title={`Staff Sign In | ${siteConfig.name}`}
        description="Authorized staff portal sign in"
        noindex
      />

      {/* Luxury ambient light */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 text-accent mb-3 border border-accent/30 shadow-lg">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-white uppercase">
            {siteConfig.name} Portal
          </h1>
          <p className="text-xs uppercase tracking-widest text-on-dark-muted mt-1">
            Staff & Concierge Terminal
          </p>
        </div>

        <Card tone="light" className="p-8 border border-border-light shadow-2xl">
          {authError && (
            <div
              role="alert"
              className={`mb-6 p-3.5 rounded-lg border text-xs font-medium flex items-start gap-2.5 ${
                isLockedOut
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-current" />
              <div className="leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
              >
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="staff@modernmane.com"
                  {...register('email')}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.email ? 'border-red-500' : 'border-border-light'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.password ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={isLoading || isLockedOut}
              className="w-full justify-center text-xs tracking-wider uppercase font-semibold py-3 mt-3 shadow-md"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Terminal <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-light text-center">
            <Link
              to="/"
              className="text-xs text-muted hover:text-ink transition-colors font-medium"
            >
              ← Return to public website
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
