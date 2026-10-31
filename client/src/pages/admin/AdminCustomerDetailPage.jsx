import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Scissors,
  AlertTriangle,
  Save,
  MessageSquare,
  Trash2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import {
  useGetCustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '@/features/customers/customersApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);

  const { data: detailData, isLoading, isError, error, refetch } = useGetCustomerQuery(id);
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: settings = {} } = useGetSettingsQuery();

  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const customer = detailData?.customer;
  const bookings = detailData?.bookings || [];

  // Form states
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [preferredBarberId, setPreferredBarberId] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(false);

  // Anonymize confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (customer) {
      setNotes(customer.notes || '');
      setTagsInput(Array.isArray(customer.tags) ? customer.tags.join(', ') : '');
      setPreferredBarberId(customer.preferredBarberId || '');
      setIsFlagged(Boolean(customer.isFlagged));
      setFlagReason(customer.flagReason || '');
      setWhatsappConsent(Boolean(customer.whatsappConsent));
    }
  }, [customer]);

  const stats = customer?.stats || {};
  const noShowCount = stats.noShowCount || 0;
  const isHighNoShow = noShowCount >= 2;

  // Handle saving customer details
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        id,
        notes,
      };

      // Owner can update all fields, barber can only update notes
      if (isOwner) {
        payload.tags = parsedTags;
        payload.preferredBarberId = preferredBarberId || null;
        payload.isFlagged = isFlagged;
        payload.flagReason = isFlagged ? flagReason || 'Staff Flagged' : '';
        payload.whatsappConsent = whatsappConsent;
      }

      await updateCustomer(payload).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Customer profile updated successfully!',
        })
      );
      refetch();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.message || err?.message || 'Failed to update profile.',
        })
      );
    }
  };

  // Handle permanent customer data erasure (anonymize)
  const handleAnonymize = async () => {
    try {
      await deleteCustomer(id).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Customer records have been permanently anonymized.',
        })
      );
      navigate('/admin/customers');
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.message || 'Failed to delete customer data.',
        })
      );
    }
  };

  // WhatsApp quick actions
  const handleSendWhatsAppMessage = (type = 'generic') => {
    if (!customer?.phone) return;

    let message = '';
    const shopName = settings?.shopName || 'Modern Mane';

    if (type === 'rebooking') {
      message = `Namaste ${customer.name}! Kafi din ho gaye aapka visit karein ${shopName} par. Kya hum aapka fresh haircut ya grooming session schedule karein? Website par slots check karein ya hume yahan reply karein!`;
    } else {
      message = `Namaste ${customer.name}! ${shopName} se greetings. Hum aapki kya sahayata kar sakte hain?`;
    }

    const link = buildWhatsAppLink(customer.phone, message);
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-ink/70 hover:text-ink font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>

        {isOwner && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Customer Data
          </Button>
        )}
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error}>
        {customer && (
          <>
            {/* Header Profile Card */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-light">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/15 text-accent border border-accent/30 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold font-heading text-ink tracking-tight">
                        {customer.name}
                      </h1>
                      {customer.whatsappConsent ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          WhatsApp Consent Opted-In
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-border-light">
                          No WhatsApp Opt-in
                        </span>
                      )}
                      {customer.isFlagged && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {customer.flagReason || 'Flagged Account'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-ink/70 mt-1.5 flex-wrap font-mono">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-ink/40" />
                        {customer.phone}
                      </span>
                      {customer.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-ink/40" />
                          {customer.email}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-ink/40">
                        Customer since {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSendWhatsAppMessage('generic')}
                    className="text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-sm inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Customer</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendWhatsAppMessage('rebooking')}
                    className="text-xs inline-flex items-center gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Rebooking Nudge</span>
                  </Button>
                </div>
              </div>

              {/* Stats Counters Header */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
                <div className="p-3 rounded-lg bg-surface border border-border-light">
                  <span className="block text-[11px] uppercase font-bold text-ink/50 tracking-wider">
                    Total Visits
                  </span>
                  <span className="text-xl font-bold font-mono text-ink mt-0.5 block">
                    {stats.totalVisits || 0}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="block text-[11px] uppercase font-bold text-emerald-700 tracking-wider">
                    Completed
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-600 mt-0.5 block">
                    {stats.completedVisits || 0}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-100 border border-border-light">
                  <span className="block text-[11px] uppercase font-bold text-neutral-600 tracking-wider">
                    Cancelled
                  </span>
                  <span className="text-xl font-bold font-mono text-neutral-700 mt-0.5 block">
                    {stats.cancelledCount || 0}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    isHighNoShow
                      ? 'bg-red-500/10 border-red-500/30 text-red-700'
                      : 'bg-surface border border-border-light text-ink'
                  }`}
                >
                  <span className="block text-[11px] uppercase font-bold tracking-wider">
                    No-Shows
                  </span>
                  <span className="text-xl font-bold font-mono mt-0.5 block">
                    {stats.noShowCount || 0}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border-light">
                  <span className="block text-[11px] uppercase font-bold text-ink/50 tracking-wider">
                    Lifetime Spend
                  </span>
                  <span className="text-xl font-bold font-mono text-accent mt-0.5 block">
                    ₹{stats.totalSpent || 0}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border-light">
                  <span className="block text-[11px] uppercase font-bold text-ink/50 tracking-wider">
                    Last Visit
                  </span>
                  <span className="text-xs font-semibold text-ink mt-1.5 block">
                    {formatDate(stats.lastVisitAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Repeat No-Show Warning Banner */}
            {(customer.isFlagged || isHighNoShow) && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong>Staff Alert: </strong>
                  {customer.flagReason ||
                    `This client has recorded ${noShowCount} no-shows. Review before confirming new slots.`}
                </div>
              </div>
            )}

            {/* Main Content: Notes & Profile Form and Visit History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Editable Notes & Preferences */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-accent" />
                      Barber Notes & Style Preferences
                    </h2>
                    {!isOwner && (
                      <span className="text-[10px] text-muted">Notes edit only</span>
                    )}
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label
                        htmlFor="cust-detail-notes"
                        className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                      >
                        Barber Cutting Notes
                      </label>
                      <textarea
                        id="cust-detail-notes"
                        rows={4}
                        placeholder="Cut style, clipper guards, hair direction, beverage choice..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 rounded-lg bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent resize-none font-mono"
                      />
                    </div>

                    {isOwner && (
                      <>
                        <div>
                          <label
                            htmlFor="cust-detail-tags"
                            className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                          >
                            Client Tags (Comma separated)
                          </label>
                          <input
                            id="cust-detail-tags"
                            type="text"
                            placeholder="VIP, Fade, Low-Skin, Beard"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="cust-detail-barber"
                            className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                          >
                            Preferred Craftsman
                          </label>
                          <select
                            id="cust-detail-barber"
                            value={preferredBarberId}
                            onChange={(e) => setPreferredBarberId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <option value="">No preference</option>
                            {barbers.map((b) => (
                              <option key={b._id || b.id} value={b._id || b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Flagging Controls */}
                        <div className="p-3.5 rounded-lg bg-surface border border-border-light space-y-3">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="is-flagged-toggle"
                              className="text-xs font-bold text-ink cursor-pointer select-none"
                            >
                              Flag for Review
                            </label>
                            <input
                              type="checkbox"
                              id="is-flagged-toggle"
                              checked={isFlagged}
                              onChange={(e) => setIsFlagged(e.target.checked)}
                              className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                            />
                          </div>

                          {isFlagged && (
                            <div>
                              <input
                                type="text"
                                placeholder="Reason (e.g. Repeated no-shows, aggressive behavior)"
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                                className="w-full px-3 py-1.5 rounded bg-card border border-red-300 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Consent */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="wa-consent-detail"
                            checked={whatsappConsent}
                            onChange={(e) => setWhatsappConsent(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <label
                            htmlFor="wa-consent-detail"
                            className="text-xs text-ink/80 select-none cursor-pointer"
                          >
                            Client opted-in for WhatsApp communication
                          </label>
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      variant="accent"
                      size="sm"
                      disabled={isUpdating}
                      className="w-full uppercase tracking-wider font-semibold text-xs shadow-sm"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Right Column: Visit History Timeline */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      Visit History Timeline ({bookings.length})
                    </h2>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-xs text-ink/60">
                      No past appointments recorded for this profile.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => {
                        const statusColor =
                          booking.status === 'completed'
                            ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                            : booking.status === 'cancelled'
                            ? 'text-neutral-500 bg-neutral-100 border-border-light'
                            : booking.status === 'no_show'
                            ? 'text-red-600 bg-red-500/10 border-red-500/30'
                            : 'text-amber-600 bg-amber-500/10 border-amber-500/20';

                        return (
                          <div
                            key={booking._id || booking.id}
                            className="p-3.5 rounded-lg border border-border-light bg-surface/50 hover:bg-surface transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-ink font-mono text-sm">
                                  {booking.date}
                                </span>
                                <span className="text-ink/60 font-mono">
                                  {booking.startTime}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}
                                >
                                  {booking.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-ink/70">
                                <span>{booking.serviceName || 'Grooming Treatment'}</span>
                                <span>•</span>
                                <span>{booking.barberName || 'Master Barber'}</span>
                              </div>

                              {booking.notes && (
                                <p className="text-[11px] text-ink/60 italic font-mono">
                                  &quot;{booking.notes}&quot;
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-sm text-ink block">
                                ₹{booking.priceAtBooking || 0}
                              </span>
                              <span className="text-[10px] text-ink/40">Price at booking</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </QueryState>

      {/* Anonymize Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 text-left border border-red-300">
            <div className="flex items-center gap-2.5 text-red-600 mb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-ink">
                Permanently Anonymize Customer Data?
              </h3>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed mb-4">
              This action complies with privacy regulations (Right to be Forgotten). All personal
              identifiable information (name, phone, email, barber notes, and tags) on this customer
              and their linked bookings will be permanently overwritten with anonymized placeholders.
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleAnonymize}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
              >
                {isDeleting ? 'Anonymizing...' : 'Yes, Delete Customer Data'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
