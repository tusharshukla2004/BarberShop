import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit2, Trash2, Copy, Sparkles, Tag, Calendar, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageUploader from '@/components/admin/ImageUploader';
import QueryState from '@/components/common/QueryState';
import {
  useGetAdminOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useDuplicateOfferMutation,
} from '@/features/offers/offersApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { formatPrice } from '@/lib/formatters';

export default function AdminOffersPage() {
  const dispatch = useAppDispatch();
  const { data: offers = [], isLoading, isError, error, refetch } = useGetAdminOffersQuery();

  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();
  const [duplicateOffer, { isLoading: isDuplicating }] = useDuplicateOfferMutation();

  const [modalOffer, setModalOffer] = useState(null); // null = closed, {} = new, object = edit
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteOffer(deleteTargetId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Offer deleted successfully.' }));
      setDeleteTargetId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete offer' }));
    }
  };

  const handleDuplicate = async (offer) => {
    try {
      const id = offer.id || offer._id;
      await duplicateOffer(id).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Duplicated "${offer.title?.en || 'Offer'}" as inactive draft.`,
        })
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to duplicate offer' }));
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      const id = modalOffer.id || modalOffer._id;
      if (id) {
        await updateOffer({ id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Offer updated successfully.' }));
      } else {
        await createOffer(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New offer published successfully.' }));
      }
      setModalOffer(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save offer' }));
    }
  };

  const columns = [
    {
      header: 'Offer',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt=""
              className="w-10 h-10 rounded-md object-cover border border-border-light shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-neutral-100 border border-border-light flex items-center justify-center text-accent shrink-0">
              <Tag className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-xs text-ink truncate">{row.title?.en || 'Untitled'}</p>
            {row.showOnHome && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent font-semibold mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Home Banner
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Promo Code',
      accessor: (row) =>
        row.promoCode ? (
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 border border-border-light text-ink uppercase tracking-wider">
            {row.promoCode}
          </span>
        ) : (
          <span className="text-xs text-muted">Auto-Applied</span>
        ),
    },
    {
      header: 'Discount',
      accessor: (row) => {
        if (row.type === 'percent') return `${row.value}% Off`;
        if (row.type === 'flat') return `Flat ${formatPrice(row.value)} Off`;
        if (row.type === 'combo') return `Combo ${formatPrice(row.value)} Off`;
        return `${row.type} (${row.value})`;
      },
    },
    {
      header: 'Validity',
      accessor: (row) => {
        const start = row.startsAt ? new Date(row.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
        const end = row.endsAt ? new Date(row.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        return (
          <div className="text-xs text-muted flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{start} - {end}</span>
          </div>
        );
      },
    },
    {
      header: 'Usage',
      accessor: (row) => (
        <span className="text-xs text-ink font-medium">
          {row.usedCount || 0} / {row.usageLimit !== null && row.usageLimit !== undefined ? row.usageLimit : '∞'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const badge = row.statusBadge || (row.isActive ? 'live' : 'inactive');
        return <StatusBadge status={badge.toLowerCase()} />;
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDuplicate(row)}
            disabled={isDuplicating}
            title="Duplicate Offer"
            className="text-xs text-muted hover:text-ink p-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModalOffer(row)}
            title="Edit Offer"
            className="text-xs text-muted hover:text-ink p-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTargetId(row.id || row._id)}
            title="Delete Offer"
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wider text-ink">
            Promotions & Offers
          </h1>
          <p className="text-xs text-muted mt-1">
            Publish seasonal campaigns, coupon codes, and home page promotional banners.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => setModalOffer({})}
          className="uppercase tracking-wider text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Offer
        </Button>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={offers.length === 0}
        emptyMessage="No promotional offers created yet. Click 'Create Offer' to get started."
      >
        <DataTable
          columns={columns}
          data={offers}
          searchKey="title"
          searchPlaceholder="Search offers by title..."
        />
      </QueryState>

      {/* Create / Edit Modal with Live Preview */}
      {modalOffer && (
        <OfferModal
          offer={modalOffer}
          isSubmitting={isCreating || isUpdating}
          onClose={() => setModalOffer(null)}
          onSave={handleSaveModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Offer"
        message="Are you sure you want to permanently delete this promotional offer? Customers will no longer be able to use this promo code."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

function OfferModal({ offer, isSubmitting, onClose, onSave }) {
  const isEditing = Boolean(offer.id || offer._id);

  const [form, setForm] = useState({
    titleEn: offer.title?.en || '',
    titleHi: offer.title?.hi || '',
    descriptionEn: offer.description?.en || '',
    descriptionHi: offer.description?.hi || '',
    imageUrl: offer.imageUrl || '',
    type: offer.type || 'percent',
    value: offer.value !== undefined ? offer.value : 10,
    promoCode: offer.promoCode || '',
    startsAt: offer.startsAt ? offer.startsAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
    endsAt: offer.endsAt
      ? offer.endsAt.slice(0, 16)
      : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    isActive: offer.isActive !== undefined ? offer.isActive : true,
    showOnHome: offer.showOnHome !== undefined ? offer.showOnHome : true,
    usageLimit: offer.usageLimit !== null && offer.usageLimit !== undefined ? offer.usageLimit : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titleEn.trim()) return;

    onSave({
      title: {
        en: form.titleEn.trim(),
        hi: form.titleHi.trim(),
      },
      description: {
        en: form.descriptionEn.trim(),
        hi: form.descriptionHi.trim(),
      },
      imageUrl: form.imageUrl,
      type: form.type,
      value: Number(form.value) || 0,
      promoCode: form.promoCode.trim().toUpperCase(),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      isActive: Boolean(form.isActive),
      showOnHome: Boolean(form.showOnHome),
      usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-border-light flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <h2 className="font-display text-xl uppercase tracking-wider text-ink">
            {isEditing ? 'Edit Promotional Offer' : 'Create New Offer'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Fields (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Title Input */}
              <div>
                <label htmlFor="offer-title-en" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Title <span className="text-accent">*</span>
                </label>
                <input
                  id="offer-title-en"
                  type="text"
                  required
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="e.g. Festival Grooming Special 20% Off"
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="offer-desc-en" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Description
                </label>
                <textarea
                  id="offer-desc-en"
                  rows={2}
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  placeholder="Details about services included, timing restrictions, or benefits..."
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="offer-discount-type" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Discount Type
                  </label>
                  <select
                    id="offer-discount-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="combo">Combo Saver (₹)</option>
                    <option value="free_addon">Free Add-on</option>
                    <option value="info">Informational</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="offer-discount-value" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Discount Value ({form.type === 'percent' ? '%' : '₹'})
                  </label>
                  <input
                    id="offer-discount-value"
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Promo Code & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="offer-promo-code" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    id="offer-promo-code"
                    type="text"
                    value={form.promoCode}
                    onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                    className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm font-mono tracking-wider uppercase text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="offer-usage-limit" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Usage Limit (Blank = Unlimited)
                  </label>
                  <input
                    id="offer-usage-limit"
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Validity Window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="offer-starts-at" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Starts At
                  </label>
                  <input
                    id="offer-starts-at"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-card border border-border-light text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="offer-ends-at" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                    Ends At
                  </label>
                  <input
                    id="offer-ends-at"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-card border border-border-light text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Image Uploader */}
              <ImageUploader
                label="Offer Banner Image"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />

              {/* Toggles */}
              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-xs font-semibold text-ink">Active & Redeemable</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.showOnHome}
                    onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                    className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-xs font-semibold text-ink">Display on Home Banner</span>
                </label>
              </div>
            </div>

            {/* Live Customer Preview (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-neutral-50 p-5 rounded-xl border border-border-light space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent border-b border-border-light pb-2">
                <Eye className="w-3.5 h-3.5" />
                Live Customer Card Preview
              </div>

              {/* Mock Rendered Card */}
              <div className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="relative h-36 w-full bg-neutral-900 overflow-hidden">
                  <img
                    src={
                      form.imageUrl ||
                      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
                    }
                    alt=""
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded bg-accent text-white text-[10px] font-bold uppercase tracking-wider">
                      {form.type === 'percent'
                        ? `${form.value}% OFF`
                        : form.type === 'flat'
                        ? `FLAT ₹${form.value} OFF`
                        : 'OFFER'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-display text-base uppercase tracking-wider text-ink">
                    {form.titleEn || 'Offer Title Preview'}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {form.descriptionEn || 'Offer description will appear here as the customer browses packages.'}
                  </p>

                  {form.promoCode && (
                    <div className="p-2 rounded bg-neutral-100 border border-dashed border-border-light flex items-center justify-between text-xs">
                      <span className="font-mono font-bold uppercase text-ink">{form.promoCode}</span>
                      <span className="text-[10px] text-accent font-semibold">Copy</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded bg-accent text-white text-xs font-bold uppercase tracking-wider opacity-90"
                    >
                      Book with this Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-border-light flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={isSubmitting}
              className="uppercase tracking-wider text-xs font-semibold px-6"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

OfferModal.propTypes = {
  offer: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

