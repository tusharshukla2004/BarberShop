import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
  KeyRound,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Scissors,
  AlertTriangle,
} from 'lucide-react';
import Seo from '@/components/common/Seo';
import { Button, Card, Modal, Input, Badge } from '@/components/ui';
import {
  useGetStaffUsersQuery,
  useCreateStaffUserMutation,
  useUpdateStaffUserMutation,
  useResetStaffPasswordMutation,
} from '@/features/auth/authApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';

const createStaffSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email address required'),
    role: z.enum(['owner', 'barber']),
    barberId: z.string().optional(),
    temporaryPassword: z.string().min(10, 'Temporary password must be at least 10 characters'),
  })
  .refine(
    (data) => {
      if (data.role === 'barber') {
        return Boolean(data.barberId && data.barberId.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Please link a barber profile for the barber role',
      path: ['barberId'],
    }
  );

function generateSecureTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function AdminStaffUsersPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: staffList = [], isLoading, isFetching, refetch } = useGetStaffUsersQuery();
  const { data: barbers = [] } = useGetBarbersQuery();

  const [createStaff, { isLoading: isCreating }] = useCreateStaffUserMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetStaffPasswordMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [createdSummary, setCreatedSummary] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'barber',
      barberId: '',
      temporaryPassword: '',
    },
  });

  const selectedRole = watch('role');

  const handleOpenCreate = () => {
    const generated = generateSecureTempPassword();
    reset({
      name: '',
      email: '',
      role: 'barber',
      barberId: barbers[0]?._id || barbers[0]?.id || '',
      temporaryPassword: generated,
    });
    setCreatedSummary(null);
    setCreateModalOpen(true);
  };

  const onFormSubmit = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        temporaryPassword: data.temporaryPassword,
        ...(data.role === 'barber' && data.barberId ? { barberId: data.barberId } : {}),
      };

      await createStaff(payload).unwrap();
      dispatch(addToast({ type: 'success', message: `Staff account created for ${data.name}` }));
      setCreatedSummary({
        email: data.email,
        temporaryPassword: data.temporaryPassword,
      });
    } catch (err) {
      const msg = err.message || err.data?.message || 'Failed to create staff account';
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await updateStaff({
        id: user._id || user.id,
        isActive: !user.isActive,
      }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `${user.name} is now ${!user.isActive ? 'active' : 'deactivated'}`,
        })
      );
    } catch (err) {
      const msg = err.message || err.data?.message || 'Failed to update staff status';
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  const handleOpenResetModal = (user) => {
    setResetModalUser(user);
    setTempPassword(generateSecureTempPassword());
    setCopied(false);
  };

  const handleExecuteResetPassword = async () => {
    if (!resetModalUser) return;
    try {
      await resetPassword({
        id: resetModalUser._id || resetModalUser.id,
        temporaryPassword: tempPassword,
      }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Password reset successfully for ${resetModalUser.name}.`,
        })
      );
      setResetModalUser(null);
    } catch (err) {
      const msg = err.message || err.data?.message || 'Failed to reset password';
      dispatch(addToast({ type: 'error', message: msg }));
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo title="Staff Accounts | Admin Console" noindex />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Access Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-ink">
              Staff Accounts
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Manage terminal login credentials for shop owners and barbers. No customer accounts exist.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 bg-accent hover:bg-accent-hover text-white">
              <UserPlus className="w-4 h-4" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {/* Staff Table Card */}
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/10 border-b border-border text-muted uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Linked Barber</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 rounded-pill border-2 border-accent border-t-transparent animate-spin" />
                        <span>Loading staff credentials...</span>
                      </div>
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      No staff accounts found.
                    </td>
                  </tr>
                ) : (
                  staffList.map((user) => {
                    const isSelf = (user._id || user.id) === currentUser?.id;
                    const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();

                    return (
                      <tr key={user._id || user.id} className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-ink flex items-center gap-1.5">
                              {user.name}
                              {isSelf && (
                                <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="text-muted text-xs block">{user.email}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              user.role === 'owner'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-muted">
                          {user.barberId ? (
                            <span className="inline-flex items-center gap-1">
                              <Scissors className="w-3.5 h-3.5 text-accent" />
                              {user.barberId.name || user.barberId}
                            </span>
                          ) : (
                            <span className="text-muted/60">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {isLocked ? (
                              <Badge variant="destructive" className="text-[10px] gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Locked (15m)
                              </Badge>
                            ) : user.isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-medium">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Inactive
                              </span>
                            )}

                            {user.mustChangePassword && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                Must change password
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-muted text-xs">
                          {user.lastLoginAt ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(user.lastLoginAt).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted/60">Never</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenResetModal(user)}
                              title="Reset Password"
                              className="text-xs h-7 px-2.5 gap-1"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              Reset
                            </Button>

                            <Button
                              variant={user.isActive ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                              disabled={isUpdating || (isSelf && user.role === 'owner')}
                              className={`text-xs h-7 px-2.5 ${
                                user.isActive ? 'text-rose-600 hover:bg-rose-50' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Staff Member"
      >
        {createdSummary ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm">
              <p className="font-semibold text-emerald-900 mb-1">Staff Account Created!</p>
              <p className="text-emerald-700 mb-3">
                Share these temporary credentials with the staff member. They will be required to change their password on first login.
              </p>
              <div className="p-3 bg-white rounded border border-emerald-300 font-mono text-xs space-y-1">
                <div>
                  <span className="text-muted">Email:</span> {createdSummary.email}
                </div>
                <div>
                  <span className="text-muted">Temporary Password:</span> {createdSummary.temporaryPassword}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `Staff Login:\nEmail: ${createdSummary.email}\nTemp Password: ${createdSummary.temporaryPassword}`
                  )
                }
                className="gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Credentials'}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreatedSummary(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div>
              <label htmlFor="staff-name" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                Full Name
              </label>
              <Input
                id="staff-name"
                {...register('name')}
                placeholder="e.g. John Doe"
                className="text-xs sm:text-sm"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                Email Address
              </label>
              <Input
                id="staff-email"
                type="email"
                {...register('email')}
                placeholder="staff@modernmane.com"
                className="text-xs sm:text-sm"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff-role" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Role
                </label>
                <select
                  id="staff-role"
                  {...register('role')}
                  className="w-full px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="barber">Barber</option>
                  <option value="owner">Owner</option>
                </select>
                {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role.message}</p>}
              </div>

              {selectedRole === 'barber' && (
                <div>
                  <label htmlFor="staff-barber" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Link Barber Profile
                  </label>
                  <select
                    id="staff-barber"
                    {...register('barberId')}
                    className="w-full px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Select Barber Profile</option>
                    {barbers.map((b) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.barberId && (
                    <p className="text-xs text-rose-500 mt-1">{errors.barberId.message}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="staff-temp-password" className="text-xs font-semibold uppercase tracking-wider text-ink">
                  Temporary Password
                </label>
                <button
                  type="button"
                  onClick={() => setValue('temporaryPassword', generateSecureTempPassword())}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate New
                </button>
              </div>
              <Input
                id="staff-temp-password"
                {...register('temporaryPassword')}
                placeholder="Minimum 10 characters"
                className="font-mono text-xs sm:text-sm"
              />
              {errors.temporaryPassword && (
                <p className="text-xs text-rose-500 mt-1">{errors.temporaryPassword.message}</p>
              )}
              <p className="text-[11px] text-muted mt-1">
                Must be at least 10 characters. The user must change this on first login.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating} className="bg-accent hover:bg-accent-hover text-white">
                {isCreating ? 'Creating Account...' : 'Create Staff Member'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={Boolean(resetModalUser)}
        onClose={() => setResetModalUser(null)}
        title={`Reset Password for ${resetModalUser?.name}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <p className="font-semibold">Security Action</p>
            <p className="mt-0.5 text-amber-700">
              Resetting this password will invalidate all existing sessions for this user and require them to choose a new password upon signing in.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="staff-reset-password" className="text-xs font-semibold uppercase tracking-wider text-ink">
                New Temporary Password
              </label>
              <button
                type="button"
                onClick={() => setTempPassword(generateSecureTempPassword())}
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Generate
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                id="staff-reset-password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="font-mono text-xs sm:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(tempPassword)}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isResetting || tempPassword.length < 10}
              onClick={handleExecuteResetPassword}
              className="bg-accent hover:bg-accent-hover text-white"
            >
              {isResetting ? 'Resetting...' : 'Confirm Reset Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
