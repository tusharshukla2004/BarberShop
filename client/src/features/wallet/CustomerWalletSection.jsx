import { useState } from 'react';
import {
  Wallet,
  Crown,
  Package as PackageIcon,
  Sparkles,
  Share2,
  Copy,
  QrCode,
  Plus,
  Check,
  Gift,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  useGetCustomerWalletQuery,
  useGetAdminPackagesQuery,
  useGetAdminMembershipsQuery,
  useSellPackageMutation,
  useSellMembershipMutation,
  useConsumePackageSessionMutation,
  useAdjustLoyaltyMutation,
  useRedeemLoyaltyRewardMutation,
  useGenerateWalletTokenMutation,
  useRevokeWalletTokenMutation,
} from '@/features/wallet/walletApi';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function CustomerWalletSection({ customerId, customerPhone, customerName }) {
  const dispatch = useAppDispatch();

  const { data: wallet = {}, refetch } = useGetCustomerWalletQuery(customerId);
  const { data: packages = [] } = useGetAdminPackagesQuery();
  const { data: plans = [] } = useGetAdminMembershipsQuery();

  const [sellPackage, { isLoading: isSellingPkg }] = useSellPackageMutation();
  const [sellMembership, { isLoading: isSellingPlan }] = useSellMembershipMutation();
  const [consumeSession, { isLoading: isConsuming }] = useConsumePackageSessionMutation();
  const [adjustLoyalty, { isLoading: isAdjustingLoyalty }] = useAdjustLoyaltyMutation();
  const [redeemReward, { isLoading: isRedeeming }] = useRedeemLoyaltyRewardMutation();
  const [generateToken, { isLoading: isGeneratingToken }] = useGenerateWalletTokenMutation();
  const [revokeToken] = useRevokeWalletTokenMutation();

  // Modals
  const [sellPackageModal, setSellPackageModal] = useState(false);
  const [sellPlanModal, setSellPlanModal] = useState(false);
  const [adjustLoyaltyModal, setAdjustLoyaltyModal] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Form states
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [pkgPayMethod, setPkgPayMethod] = useState('cash');
  const [pkgCustomAmount, setPkgCustomAmount] = useState('');

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [planPayMethod, setPlanPayMethod] = useState('cash');
  const [planCustomAmount, setPlanCustomAmount] = useState('');

  const [loyaltyAmount, setLoyaltyAmount] = useState(1);
  const [loyaltyNotes, setLoyaltyNotes] = useState('Manual visit stamp');

  const activePackages = wallet?.packages || [];
  const activeMembership = wallet?.membership;
  const loyalty = wallet?.loyalty || { balance: 0, stampsForReward: 10 };
  const walletToken = wallet?.walletToken;

  const publicWalletUrl = walletToken
    ? `${window.location.origin}/wallet/${walletToken}`
    : '';

  const handleCopyLink = () => {
    if (!publicWalletUrl) return;
    navigator.clipboard.writeText(publicWalletUrl);
    dispatch(addToast({ type: 'success', message: 'Customer wallet pass link copied!' }));
  };

  const handleShareWhatsApp = () => {
    if (!publicWalletUrl) return;
    const msg = `Hello ${customerName}! Here is your digital wallet pass for Modern Mane: ${publicWalletUrl}\n\nTrack your prepaid haircut sessions and loyalty stamps anytime. See you soon!`;
    const link = buildWhatsAppLink(customerPhone, msg);
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGenerateToken = async () => {
    try {
      await generateToken(customerId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Unguessable wallet token generated.' }));
      refetch();
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to generate pass token.' }));
    }
  };

  const handleRevokeToken = async () => {
    try {
      await revokeToken(customerId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Wallet pass token revoked.' }));
      refetch();
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to revoke token.' }));
    }
  };

  const handleSellPackageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPkgId) return;
    try {
      const pkg = packages.find((p) => p.id === selectedPkgId || p._id === selectedPkgId);
      const amount = pkgCustomAmount ? Number(pkgCustomAmount) : pkg?.price;

      await sellPackage({
        customerId,
        packageId: selectedPkgId,
        paymentMethod: pkgPayMethod,
        amountPaid: amount,
      }).unwrap();

      dispatch(addToast({ type: 'success', message: 'Package sold successfully!' }));
      setSellPackageModal(false);
      setSelectedPkgId('');
      setPkgCustomAmount('');
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to sell package.' }));
    }
  };

  const handleSellPlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    try {
      const plan = plans.find((p) => p.id === selectedPlanId || p._id === selectedPlanId);
      const amount = planCustomAmount ? Number(planCustomAmount) : plan?.price;

      await sellMembership({
        customerId,
        planId: selectedPlanId,
        paymentMethod: planPayMethod,
        amountPaid: amount,
      }).unwrap();

      dispatch(addToast({ type: 'success', message: 'VIP Membership sold successfully!' }));
      setSellPlanModal(false);
      setSelectedPlanId('');
      setPlanCustomAmount('');
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to sell membership.' }));
    }
  };

  const handleConsumeSession = async (custPkgId) => {
    try {
      await consumeSession({
        customerId,
        customerPackageId: custPkgId,
        serviceId: '',
      }).unwrap();
      dispatch(addToast({ type: 'success', message: '1 session consumed successfully.' }));
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to consume session.' }));
    }
  };

  const handleAdjustLoyaltySubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustLoyalty({
        customerId,
        amount: Number(loyaltyAmount),
        notes: loyaltyNotes,
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Loyalty balance updated.' }));
      setAdjustLoyaltyModal(false);
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to update stamps.' }));
    }
  };

  const handleRedeemReward = async () => {
    try {
      await redeemReward({
        customerId,
        stampsToRedeem: loyalty.stampsForReward || 10,
        notes: 'Redeemed Free Service Reward in Studio',
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Loyalty reward redeemed!' }));
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Redemption failed.' }));
    }
  };

  const stampsForReward = loyalty.stampsForReward || 10;
  const currentStamps = loyalty.balance || 0;
  const isRewardReady = currentStamps >= stampsForReward;

  return (
    <Card className="p-6 border-accent/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-light">
        <div>
          <h2 className="text-base font-bold font-serif text-ink flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent" />
            Customer Wallet, Memberships & Loyalty
          </h2>
          <p className="text-xs text-muted">
            Manage prepaid sessions, active memberships, stamp progress, and digital pass links.
          </p>
        </div>

        {/* Digital Wallet Pass Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {walletToken ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs inline-flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Pass Link
              </Button>
              <Button
                size="sm"
                onClick={handleShareWhatsApp}
                className="text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white inline-flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Pass
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrModalOpen(true)}
                className="text-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeToken}
                className="text-xs text-red-600 hover:text-red-700"
                title="Revoke pass link"
              >
                Revoke Pass
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateToken}
              disabled={isGeneratingToken}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate Digital Pass
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Section 1: Prepaid Packages */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <PackageIcon className="w-4 h-4 text-primary" />
              Prepaid Packages ({activePackages.length})
            </h3>
            <Button variant="outline" size="sm" onClick={() => setSellPackageModal(true)} className="text-[11px] h-7 px-2">
              <Plus className="w-3 h-3 mr-1" /> Sell Package
            </Button>
          </div>

          {activePackages.length === 0 ? (
            <div className="p-4 rounded-lg bg-surface/50 border border-border-light text-center text-xs text-muted">
              No active prepaid packages for this customer.
            </div>
          ) : (
            <div className="space-y-3">
              {activePackages.map((pkg) => {
                const total = pkg.sessionsTotal || 1;
                const used = pkg.sessionsUsed || 0;
                const remaining = pkg.sessionsRemaining ?? Math.max(0, total - used);
                const percent = Math.min(100, Math.round((remaining / total) * 100));

                return (
                  <div
                    key={pkg.id || pkg._id}
                    className="p-3.5 rounded-lg border border-border-light bg-surface/50 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-ink block">{pkg.packageName?.en || 'Package'}</span>
                        <span className="text-[10px] text-muted font-mono">
                          Expires: {new Date(pkg.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          pkg.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {remaining} Left
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted">Sessions:</span>
                        <span className="font-semibold text-ink">
                          {remaining} / {total} remaining
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {pkg.status === 'active' && remaining > 0 && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConsumeSession(pkg.id || pkg._id)}
                          disabled={isConsuming}
                          className="text-[11px] h-7 px-2.5"
                        >
                          Consume 1 Session
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: VIP Membership */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              VIP Membership
            </h3>
            <Button variant="outline" size="sm" onClick={() => setSellPlanModal(true)} className="text-[11px] h-7 px-2">
              <Plus className="w-3 h-3 mr-1" /> Sell Plan
            </Button>
          </div>

          {activeMembership ? (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    {activeMembership.planName?.en || 'VIP Member'}
                  </span>
                  <span className="text-[10px] text-muted block mt-0.5">
                    Valid until {new Date(activeMembership.endsAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                  Active
                </span>
              </div>

              <div className="pt-2 border-t border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Active Perks
                </span>
                {Array.isArray(activeMembership.benefits) &&
                  activeMembership.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[11px] text-amber-950 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>
                        {b.type === 'discount_percent' && `${b.value}% off haircuts & treatments`}
                        {b.type === 'free_service' && `Free service benefit`}
                        {b.type === 'priority_booking' && `Priority booking line`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-surface/50 border border-border-light text-center text-xs text-muted">
              Customer does not have an active VIP membership plan.
            </div>
          )}
        </div>

        {/* Section 3: Loyalty Stamp Program */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Loyalty Stamps ({currentStamps} / {stampsForReward})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdjustLoyaltyModal(true)}
              className="text-[11px] h-7 px-2"
            >
              Adjust Stamps
            </Button>
          </div>

          <div className="p-4 rounded-lg border border-border-light bg-surface/50 space-y-4 text-xs">
            {/* Visual 10-Stamp Grid */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-muted font-medium">Visit Stamp Card</span>
                <span className="text-[11px] font-bold text-ink">
                  {currentStamps} of {stampsForReward} stamps
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: stampsForReward }).map((_, index) => {
                  const isEarned = index < currentStamps;
                  return (
                    <div
                      key={index}
                      className={`h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                        isEarned
                          ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-500 scale-100'
                          : 'bg-neutral-100 text-neutral-400 border border-dashed border-neutral-300'
                      }`}
                    >
                      {isEarned ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward Redemption Callout */}
            {isRewardReady ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Gift className="w-4 h-4 text-emerald-600 animate-bounce" />
                  Reward Threshold Reached!
                </div>
                <p className="text-[11px] text-emerald-800">
                  Customer has 10 stamps ready for a complimentary grooming service.
                </p>
                <Button
                  size="sm"
                  onClick={handleRedeemReward}
                  disabled={isRedeeming}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Gift className="w-3.5 h-3.5 mr-1" /> Redeem Free Reward
                </Button>
              </div>
            ) : (
              <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
                <Gift className="w-3.5 h-3.5 text-accent" />
                <span>Earn {stampsForReward - (currentStamps % stampsForReward)} more stamps for a free haircut reward.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sell Package Modal */}
      {sellPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-base font-bold font-serif text-ink mb-4">
              Sell Prepaid Package to {customerName}
            </h2>

            <form onSubmit={handleSellPackageSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="sell-pkg-select" className="block font-semibold text-ink mb-1">Select Package *</label>
                <select
                  id="sell-pkg-select"
                  required
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full p-2 border border-border-light rounded text-xs"
                >
                  <option value="">-- Choose Package --</option>
                  {packages
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name?.en} (₹{p.price} · {p.sessions} sessions)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sell-pkg-method" className="block font-semibold text-ink mb-1">Payment Method</label>
                  <select
                    id="sell-pkg-method"
                    value={pkgPayMethod}
                    onChange={(e) => setPkgPayMethod(e.target.value)}
                    className="w-full p-2 border border-border-light rounded text-xs"
                  >
                    <option value="cash">Cash in Studio</option>
                    <option value="upi">UPI / QR Code</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="online">Online Link</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sell-pkg-amount" className="block font-semibold text-ink mb-1">Amount Paid (₹)</label>
                  <input
                    id="sell-pkg-amount"
                    type="number"
                    min="0"
                    placeholder="Package default"
                    value={pkgCustomAmount}
                    onChange={(e) => setPkgCustomAmount(e.target.value)}
                    className="w-full p-2 border border-border-light rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setSellPackageModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isSellingPkg || !selectedPkgId}>
                  Confirm Sale
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Sell Plan Modal */}
      {sellPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-base font-bold font-serif text-ink mb-4">
              Sell VIP Membership to {customerName}
            </h2>

            <form onSubmit={handleSellPlanSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="sell-plan-select" className="block font-semibold text-ink mb-1">Select Membership Plan *</label>
                <select
                  id="sell-plan-select"
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2 border border-border-light rounded text-xs"
                >
                  <option value="">-- Choose VIP Plan --</option>
                  {plans
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name?.en} (₹{p.price} · {p.durationDays} days)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sell-plan-method" className="block font-semibold text-ink mb-1">Payment Method</label>
                  <select
                    id="sell-plan-method"
                    value={planPayMethod}
                    onChange={(e) => setPlanPayMethod(e.target.value)}
                    className="w-full p-2 border border-border-light rounded text-xs"
                  >
                    <option value="cash">Cash in Studio</option>
                    <option value="upi">UPI / QR Code</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="online">Online Link</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sell-plan-amount" className="block font-semibold text-ink mb-1">Amount Paid (₹)</label>
                  <input
                    id="sell-plan-amount"
                    type="number"
                    min="0"
                    placeholder="Plan default"
                    value={planCustomAmount}
                    onChange={(e) => setPlanCustomAmount(e.target.value)}
                    className="w-full p-2 border border-border-light rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setSellPlanModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isSellingPlan || !selectedPlanId}>
                  Confirm VIP Sale
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Adjust Loyalty Modal */}
      {adjustLoyaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-sm p-6 bg-white">
            <h2 className="text-base font-bold font-serif text-ink mb-3">Adjust Loyalty Stamps</h2>

            <form onSubmit={handleAdjustLoyaltySubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="adjust-loyalty-amount" className="block font-semibold text-ink mb-1">Stamps to Add *</label>
                <input
                  id="adjust-loyalty-amount"
                  type="number"
                  min="1"
                  required
                  value={loyaltyAmount}
                  onChange={(e) => setLoyaltyAmount(e.target.value)}
                  className="w-full p-2 border border-border-light rounded"
                />
              </div>

              <div>
                <label htmlFor="adjust-loyalty-notes" className="block font-semibold text-ink mb-1">Audit Reason / Note *</label>
                <input
                  id="adjust-loyalty-notes"
                  type="text"
                  required
                  value={loyaltyNotes}
                  onChange={(e) => setLoyaltyNotes(e.target.value)}
                  className="w-full p-2 border border-border-light rounded"
                  placeholder="e.g. Visit stamp or bonus compensation"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setAdjustLoyaltyModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isAdjustingLoyalty}>
                  Save Stamps
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* QR Code Pass Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-sm p-6 bg-white text-center">
            <h3 className="text-base font-bold font-serif text-ink mb-2">Digital Wallet Pass QR</h3>
            <p className="text-xs text-muted mb-4">
              Customer can scan this code with their phone camera to instantly view their pass.
            </p>

            <div className="p-4 bg-white border border-border-light rounded-xl inline-block shadow-inner mx-auto mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  publicWalletUrl
                )}`}
                alt="Wallet QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-[11px] text-ink font-mono break-all px-2 py-1 bg-surface rounded mb-4">
              {publicWalletUrl}
            </p>

            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQrModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={handleShareWhatsApp}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Send to WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

