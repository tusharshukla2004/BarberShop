import { useState } from 'react';
import {
  Package as PackageIcon,
  Crown,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Scissors,
  CheckCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import {
  useGetAdminPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useGetAdminMembershipsQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
  useGetExpiringWalletItemsQuery,
} from '@/features/wallet/walletApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminPackagesPlansPage() {
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);

  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'memberships' | 'expiring'

  const {
    data: packages = [],
    isLoading: isPkgLoading,
    isError: isPkgError,
    error: pkgError,
  } = useGetAdminPackagesQuery();

  const {
    data: plans = [],
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useGetAdminMembershipsQuery();

  const {
    data: expiringData = { expiringPackages: [], expiringMemberships: [] },
  } = useGetExpiringWalletItemsQuery(7);

  const { data: services = [] } = useGetServicesQuery();

  // Mutations
  const [createPackage, { isLoading: isCreatingPkg }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdatingPkg }] = useUpdatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();

  const [createMembership, { isLoading: isCreatingPlan }] = useCreateMembershipMutation();
  const [updateMembership, { isLoading: isUpdatingPlan }] = useUpdateMembershipMutation();
  const [deleteMembership] = useDeleteMembershipMutation();

  // Modal states
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: '', title: '' });

  // Package Form state
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgNameHi, setPkgNameHi] = useState('');
  const [pkgDescEn, setPkgDescEn] = useState('');
  const [pkgDescHi, setPkgDescHi] = useState('');
  const [pkgPrice, setPkgPrice] = useState(1500);
  const [pkgSessions, setPkgSessions] = useState(5);
  const [pkgValidityDays, setPkgValidityDays] = useState(90);
  const [pkgServiceIds, setPkgServiceIds] = useState([]);
  const [pkgIsActive, setPkgIsActive] = useState(true);

  // Membership Form state
  const [planNameEn, setPlanNameEn] = useState('');
  const [planNameHi, setPlanNameHi] = useState('');
  const [planDescEn, setPlanDescEn] = useState('');
  const [planDescHi, setPlanDescHi] = useState('');
  const [planPrice, setPlanPrice] = useState(999);
  const [planDurationDays, setPlanDurationDays] = useState(30);
  const [planDiscountPct, setPlanDiscountPct] = useState(20);
  const [planFreeServiceId, setPlanFreeServiceId] = useState('');
  const [planIsActive, setPlanIsActive] = useState(true);

  const openPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPkgNameEn(pkg.name?.en || '');
      setPkgNameHi(pkg.name?.hi || '');
      setPkgDescEn(pkg.description?.en || '');
      setPkgDescHi(pkg.description?.hi || '');
      setPkgPrice(pkg.price || 0);
      setPkgSessions(pkg.sessions || 5);
      setPkgValidityDays(pkg.validityDays || 90);
      setPkgServiceIds(pkg.serviceIds || []);
      setPkgIsActive(pkg.isActive !== false);
    } else {
      setEditingPackage(null);
      setPkgNameEn('');
      setPkgNameHi('');
      setPkgDescEn('');
      setPkgDescHi('');
      setPkgPrice(1500);
      setPkgSessions(5);
      setPkgValidityDays(90);
      setPkgServiceIds([]);
      setPkgIsActive(true);
    }
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: { en: pkgNameEn, hi: pkgNameHi },
        description: { en: pkgDescEn, hi: pkgDescHi },
        price: Number(pkgPrice),
        sessions: Number(pkgSessions),
        validityDays: Number(pkgValidityDays),
        serviceIds: pkgServiceIds,
        isActive: pkgIsActive,
      };

      if (editingPackage) {
        await updatePackage({ id: editingPackage.id || editingPackage._id, ...payload }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Package updated successfully.' }));
      } else {
        await createPackage(payload).unwrap();
        dispatch(addToast({ type: 'success', message: 'Package created successfully.' }));
      }
      setPackageModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to save package.' }));
    }
  };

  const openMembershipModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanNameEn(plan.name?.en || '');
      setPlanNameHi(plan.name?.hi || '');
      setPlanDescEn(plan.description?.en || '');
      setPlanDescHi(plan.description?.hi || '');
      setPlanPrice(plan.price || 0);
      setPlanDurationDays(plan.durationDays || 30);
      const discountBenefit = plan.benefits?.find((b) => b.type === 'discount_percent');
      const freeBenefit = plan.benefits?.find((b) => b.type === 'free_service');
      setPlanDiscountPct(discountBenefit?.value || 0);
      setPlanFreeServiceId(freeBenefit?.serviceIds?.[0] || '');
      setPlanIsActive(plan.isActive !== false);
    } else {
      setEditingPlan(null);
      setPlanNameEn('');
      setPlanNameHi('');
      setPlanDescEn('');
      setPlanDescHi('');
      setPlanPrice(999);
      setPlanDurationDays(30);
      setPlanDiscountPct(20);
      setPlanFreeServiceId('');
      setPlanIsActive(true);
    }
    setMembershipModalOpen(true);
  };

  const handleSaveMembership = async (e) => {
    e.preventDefault();
    try {
      const benefits = [];
      if (Number(planDiscountPct) > 0) {
        benefits.push({
          type: 'discount_percent',
          value: Number(planDiscountPct),
          serviceIds: [],
        });
      }
      if (planFreeServiceId) {
        benefits.push({
          type: 'free_service',
          value: 0,
          serviceIds: [planFreeServiceId],
        });
      }

      const payload = {
        name: { en: planNameEn, hi: planNameHi },
        description: { en: planDescEn, hi: planDescHi },
        price: Number(planPrice),
        durationDays: Number(planDurationDays),
        benefits,
        isActive: planIsActive,
      };

      if (editingPlan) {
        await updateMembership({ id: editingPlan.id || editingPlan._id, ...payload }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Membership plan updated successfully.' }));
      } else {
        await createMembership(payload).unwrap();
        dispatch(addToast({ type: 'success', message: 'Membership plan created successfully.' }));
      }
      setMembershipModalOpen(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to save membership plan.' }));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'package') {
        await deletePackage(deleteConfirm.id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Package deleted.' }));
      } else if (deleteConfirm.type === 'membership') {
        await deleteMembership(deleteConfirm.id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Membership plan deleted.' }));
      }
      setDeleteConfirm({ open: false, type: '', id: '', title: '' });
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to delete.' }));
    }
  };

  const expiringCount =
    (expiringData.expiringPackages?.length || 0) +
    (expiringData.expiringMemberships?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-light pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2">
            <PackageIcon className="w-6 h-6 text-primary" />
            Packages & Memberships
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage prepaid service bundles, recurring VIP memberships, and loyalty incentives.
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {activeTab === 'packages' && (
              <Button size="sm" onClick={() => openPackageModal()}>
                <Plus className="w-4 h-4 mr-1" /> Add Package
              </Button>
            )}
            {activeTab === 'memberships' && (
              <Button size="sm" onClick={() => openMembershipModal()}>
                <Plus className="w-4 h-4 mr-1" /> Add Plan
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-light gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'packages'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Scissors className="w-4 h-4" /> Prepaid Packages ({packages.length})
        </button>
        <button
          onClick={() => setActiveTab('memberships')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'memberships'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Crown className="w-4 h-4" /> Membership Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'expiring'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-500" /> Expiring Soon ({expiringCount})
        </button>
      </div>

      {/* Tab 1: Prepaid Packages */}
      {activeTab === 'packages' && (
        <QueryState
          isLoading={isPkgLoading}
          isError={isPkgError}
          error={pkgError}
          isEmpty={packages.length === 0}
          emptyMessage="No prepaid packages created yet."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id || pkg._id} className="relative p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        pkg.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xl font-bold font-serif text-ink">₹{pkg.price}</span>
                  </div>

                  <h3 className="text-base font-bold text-ink leading-snug">{pkg.name?.en}</h3>
                  <p className="text-xs text-muted font-sans mt-0.5">{pkg.name?.hi}</p>

                  <p className="text-xs text-muted mt-3 line-clamp-2">
                    {pkg.description?.en || 'Standard bundled package.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border-light space-y-1.5 text-xs text-ink">
                    <div className="flex justify-between">
                      <span className="text-muted">Total Sessions:</span>
                      <span className="font-semibold">{pkg.sessions} sessions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Validity:</span>
                      <span className="font-semibold">{pkg.validityDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Unit Value:</span>
                      <span className="font-semibold">₹{Math.round(pkg.price / (pkg.sessions || 1))} / cut</span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-6 pt-4 border-t border-border-light flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openPackageModal(pkg)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          type: 'package',
                          id: pkg.id || pkg._id,
                          title: pkg.name?.en,
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </QueryState>
      )}

      {/* Tab 2: Membership Plans */}
      {activeTab === 'memberships' && (
        <QueryState
          isLoading={isPlanLoading}
          isError={isPlanError}
          error={planError}
          isEmpty={plans.length === 0}
          emptyMessage="No membership plans created yet."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id || plan._id} className="relative p-6 flex flex-col justify-between hover:shadow-md transition-shadow border-amber-200">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        plan.isActive ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {plan.isActive ? 'VIP Plan' : 'Inactive'}
                    </span>
                    <span className="text-xl font-bold font-serif text-ink">₹{plan.price}</span>
                  </div>

                  <h3 className="text-base font-bold text-ink leading-snug flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500" />
                    {plan.name?.en}
                  </h3>
                  <p className="text-xs text-muted font-sans mt-0.5">{plan.name?.hi}</p>

                  <p className="text-xs text-muted mt-3 line-clamp-2">
                    {plan.description?.en || 'VIP privileges & grooming perks.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border-light space-y-1.5 text-xs text-ink">
                    <div className="flex justify-between">
                      <span className="text-muted">Duration:</span>
                      <span className="font-semibold">{plan.durationDays} days</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                        Benefits Included
                      </span>
                      <div className="space-y-1">
                        {Array.isArray(plan.benefits) && plan.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>
                              {b.type === 'discount_percent' && `${b.value}% off all bookings`}
                              {b.type === 'free_service' && `Complimentary service`}
                              {b.type === 'priority_booking' && `Priority booking queue`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-6 pt-4 border-t border-border-light flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openMembershipModal(plan)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          type: 'membership',
                          id: plan.id || plan._id,
                          title: plan.name?.en,
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </QueryState>
      )}

      {/* Tab 3: Expiring Soon */}
      {activeTab === 'expiring' && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-ink">Items Expiring Within 7 Days</h3>
            <p className="text-xs text-muted">
              Packages and memberships ending soon. Staff can reach out on WhatsApp for renewal.
            </p>
          </div>

          {expiringCount === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              No packages or memberships expiring in the next 7 days.
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {expiringData.expiringPackages?.map((item) => (
                <div key={item.id || item._id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-ink">{item.customerId?.name || 'Customer'}</span>
                    <span className="text-xs text-muted ml-2">({item.customerId?.phone})</span>
                    <div className="text-xs text-muted mt-0.5">
                      Package: <span className="text-ink font-medium">{item.packageName?.en || 'Package'}</span> ·{' '}
                      {item.sessionsRemaining} sessions remaining
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Expires {new Date(item.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {expiringData.expiringMemberships?.map((item) => (
                <div key={item.id || item._id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-ink">{item.customerId?.name || 'Customer'}</span>
                    <span className="text-xs text-muted ml-2">({item.customerId?.phone})</span>
                    <div className="text-xs text-muted mt-0.5">
                      VIP Membership: <span className="text-ink font-medium">{item.planName?.en || 'VIP'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Ends {new Date(item.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Package Form Modal */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-lg p-6 bg-white max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-serif text-ink mb-4">
              {editingPackage ? 'Edit Prepaid Package' : 'Create New Prepaid Package'}
            </h2>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pkgNameEn" className="block text-xs font-semibold text-ink mb-1">
                    English Name *
                  </label>
                  <input
                    id="pkgNameEn"
                    type="text"
                    required
                    value={pkgNameEn}
                    onChange={(e) => setPkgNameEn(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 5x Haircut Pack"
                  />
                </div>
                <div>
                  <label htmlFor="pkgNameHi" className="block text-xs font-semibold text-ink mb-1">
                    Hindi Name *
                  </label>
                  <input
                    id="pkgNameHi"
                    type="text"
                    required
                    value={pkgNameHi}
                    onChange={(e) => setPkgNameHi(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 5x हेयरकट पैक"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pkgDescEn" className="block text-xs font-semibold text-ink mb-1">
                    English Description
                  </label>
                  <textarea
                    id="pkgDescEn"
                    rows={2}
                    value={pkgDescEn}
                    onChange={(e) => setPkgDescEn(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="pkgDescHi" className="block text-xs font-semibold text-ink mb-1">
                    Hindi Description
                  </label>
                  <textarea
                    id="pkgDescHi"
                    rows={2}
                    value={pkgDescHi}
                    onChange={(e) => setPkgDescHi(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="pkgPrice" className="block text-xs font-semibold text-ink mb-1">
                    Price (₹) *
                  </label>
                  <input
                    id="pkgPrice"
                    type="number"
                    min="0"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded"
                  />
                </div>
                <div>
                  <label htmlFor="pkgSessions" className="block text-xs font-semibold text-ink mb-1">
                    Sessions *
                  </label>
                  <input
                    id="pkgSessions"
                    type="number"
                    min="1"
                    required
                    value={pkgSessions}
                    onChange={(e) => setPkgSessions(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded"
                  />
                </div>
                <div>
                  <label htmlFor="pkgValidity" className="block text-xs font-semibold text-ink mb-1">
                    Validity (Days) *
                  </label>
                  <input
                    id="pkgValidity"
                    type="number"
                    min="1"
                    required
                    value={pkgValidityDays}
                    onChange={(e) => setPkgValidityDays(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-ink mb-1">Eligible Services</span>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border-light rounded bg-surface/50">
                  {services.map((s) => {
                    const sId = s.id || s._id;
                    const isChecked = pkgServiceIds.includes(sId);
                    return (
                      <label key={sId} className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPkgServiceIds([...pkgServiceIds, sId]);
                            } else {
                              setPkgServiceIds(pkgServiceIds.filter((id) => id !== sId));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="pkgIsActive"
                  type="checkbox"
                  checked={pkgIsActive}
                  onChange={(e) => setPkgIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="pkgIsActive" className="text-xs font-semibold text-ink cursor-pointer">
                  Active (available to sell and display)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" type="button" onClick={() => setPackageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingPkg || isUpdatingPkg}>
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Membership Plan Form Modal */}
      {membershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-lg p-6 bg-white max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-serif text-ink mb-4">
              {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
            </h2>

            <form onSubmit={handleSaveMembership} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="planNameEn" className="block text-xs font-semibold text-ink mb-1">
                    English Name *
                  </label>
                  <input
                    id="planNameEn"
                    type="text"
                    required
                    value={planNameEn}
                    onChange={(e) => setPlanNameEn(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Black Card VIP Club"
                  />
                </div>
                <div>
                  <label htmlFor="planNameHi" className="block text-xs font-semibold text-ink mb-1">
                    Hindi Name *
                  </label>
                  <input
                    id="planNameHi"
                    type="text"
                    required
                    value={planNameHi}
                    onChange={(e) => setPlanNameHi(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded focus:ring-1 focus:ring-primary"
                    placeholder="e.g. ब्लैक कार्ड वीआईपी क्लब"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="planPrice" className="block text-xs font-semibold text-ink mb-1">
                    Price (₹) *
                  </label>
                  <input
                    id="planPrice"
                    type="number"
                    min="0"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded"
                  />
                </div>
                <div>
                  <label htmlFor="planDuration" className="block text-xs font-semibold text-ink mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    id="planDuration"
                    type="number"
                    min="1"
                    required
                    value={planDurationDays}
                    onChange={(e) => setPlanDurationDays(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-border-light rounded"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border-light space-y-3">
                <span className="text-xs font-bold text-ink block">Benefits Configuration</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="planDiscount" className="block text-xs font-medium text-muted mb-1">
                      Discount % On All Services
                    </label>
                    <input
                      id="planDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={planDiscountPct}
                      onChange={(e) => setPlanDiscountPct(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-border-light rounded"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label htmlFor="planFreeService" className="block text-xs font-medium text-muted mb-1">
                      Free Service (Optional)
                    </label>
                    <select
                      id="planFreeService"
                      value={planFreeServiceId}
                      onChange={(e) => setPlanFreeServiceId(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-border-light rounded"
                    >
                      <option value="">None</option>
                      {services.map((s) => (
                        <option key={s.id || s._id} value={s.id || s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="planIsActive"
                  type="checkbox"
                  checked={planIsActive}
                  onChange={(e) => setPlanIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="planIsActive" className="text-xs font-semibold text-ink cursor-pointer">
                  Active (available to sell and display)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" type="button" onClick={() => setMembershipModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingPlan || isUpdatingPlan}>
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title={`Delete ${deleteConfirm.type === 'package' ? 'Package' : 'Plan'}?`}
        message={`Are you sure you want to delete "${deleteConfirm.title}"? Existing customer purchases will remain valid until expiry.`}
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, type: '', id: '', title: '' })}
      />
    </div>
  );
}
