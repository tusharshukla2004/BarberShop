import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight, Scissors } from 'lucide-react';
import Seo from '@/components/common/Seo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [authError, setAuthError] = useState('');

  const params = new URLSearchParams(location.search);
  const from = params.get('redirect') || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'owner@barbershop.com',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await login(data).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Signed in successfully. Welcome back!',
        })
      );
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setAuthError(msg);
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-4 sm:p-6 text-white relative overflow-hidden">
      <Seo title="Admin Sign In | Sovereign Barbershop" description="Admin portal sign in" noindex />

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
            SOVEREIGN PORTAL
          </h1>
          <p className="text-xs uppercase tracking-widest text-on-dark-muted mt-1">
            Management & Concierge Desk
          </p>
        </div>

        <Card tone="light" className="p-8 border border-border-light shadow-2xl">
          {authError && (
            <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="owner@barbershop.com"
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
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.password ? 'border-red-500' : 'border-border-light'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center text-xs tracking-wider uppercase font-semibold py-3 mt-3 shadow-md"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
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
