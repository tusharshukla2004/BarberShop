import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Seo from '@/components/common/Seo';
import { Button, Card } from '@/components/ui';
import { useChangePasswordMutation } from '@/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(10, 'New password must be at least 10 characters long'),
    confirmPassword: z.string().min(10, 'Please confirm your new password'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password cannot be the same as your current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: 'Password changed successfully. Your terminal session is updated.',
        })
      );
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err.message || err.data?.message || 'Failed to change password. Please verify current password.';
      setErrorMessage(msg);
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  return (
    <>
      <Seo title="Change Password | Admin Terminal" noindex />

      <div className="max-w-xl mx-auto py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security Credential
          </div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-ink">
            Change Staff Password
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Ensure your terminal password is at least 10 characters and unique.
          </p>
        </div>

        {currentUser?.mustChangePassword && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 flex items-start gap-3 text-xs sm:text-sm"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Initial Password Reset Required</p>
              <p className="mt-0.5 text-xs text-amber-700">
                You are logging in with a temporary password. Please set a new permanent password to continue accessing the admin terminal.
              </p>
            </div>
          </div>
        )}

        <Card tone="light" className="p-6 sm:p-8 border border-border shadow-md">
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs uppercase tracking-wider font-semibold text-ink mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('currentPassword')}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.currentPassword ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs uppercase tracking-wider font-semibold text-ink mb-1.5"
              >
                New Password (minimum 10 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 10 characters"
                  {...register('newPassword')}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.newPassword ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs uppercase tracking-wider font-semibold text-ink mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  {...register('confirmPassword')}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-border-light'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="w-full justify-center font-semibold text-xs uppercase tracking-wider py-2.5"
              >
                {isLoading ? 'Updating Password...' : 'Update Password & Save'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

