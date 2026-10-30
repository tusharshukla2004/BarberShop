import { useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FormField from '@/components/admin/FormField';
import QueryState from '@/components/common/QueryState';
import {
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/features/reviews/reviewsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminReviewsPage() {
  const dispatch = useAppDispatch();
  const { data: reviews = [], isLoading, isError, error, refetch } = useGetReviewsQuery();

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const [modalReview, setModalReview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleToggleApproved = async (review) => {
    try {
      const newStatus = review.isApproved !== false ? false : true;
      await updateReview({ id: review.id, isApproved: newStatus }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Review ${newStatus ? 'published' : 'hidden'} on public site.`,
        })
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to update review' }));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Review deleted.' }));
      setDeleteId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete review' }));
    }
  };

  const handleSave = async (formData) => {
    try {
      if (modalReview.id) {
        await updateReview({ id: modalReview.id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Review updated.' }));
      } else {
        await createReview(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New testimonial added.' }));
      }
      setModalReview(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save review' }));
    }
  };

  const columns = [
    {
      key: 'customerName',
      label: 'Client Name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-ink block">{row.customerName}</span>
          <span className="text-muted text-[11px]">{row.role || 'Client'}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (
        <div className="flex items-center gap-1 text-accent">
          {Array.from({ length: val || 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
          ))}
        </div>
      ),
    },
    {
      key: 'text',
      label: 'Review Text',
      render: (val) => <span className="line-clamp-2 max-w-md">{val}</span>,
    },
    {
      key: 'isApproved',
      label: 'Visibility',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => handleToggleApproved(row)}
          aria-label={`Toggle approval for ${row.customerName}`}
          className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
        >
          <StatusBadge status={val !== false ? 'Active' : 'Inactive'} />
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Edit"
            onClick={() => setModalReview(row)}
            aria-label={`Edit review from ${row.customerName}`}
            className="p-1.5 rounded hover:bg-card text-muted hover:text-ink transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => setDeleteId(row.id)}
            aria-label={`Delete review from ${row.customerName}`}
            className="p-1.5 rounded hover:bg-card text-muted hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
            CLIENT TESTIMONIALS & REVIEWS
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Moderate, approve, edit, and feature client reviews displayed on the home page.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            setModalReview({
              customerName: '',
              role: 'Loyal Client',
              rating: 5,
              text: '',
              isApproved: true,
            })
          }
          className="self-start sm:self-auto tracking-wider uppercase font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Review
        </Button>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DataTable
          columns={columns}
          data={reviews}
          searchPlaceholder="Search reviews..."
          searchKeys={['customerName', 'text']}
          pageSize={10}
        />
      </QueryState>

      {modalReview && (
        <ReviewModal
          initial={modalReview}
          isLoading={isCreating || isUpdating}
          onClose={() => setModalReview(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this testimonial?"
        confirmLabel="Delete Review"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function ReviewModal({ initial, isLoading, onClose, onSave }) {
  const [customerName, setCustomerName] = useState(initial.customerName || '');
  const [role, setRole] = useState(initial.role || 'Loyal Client');
  const [rating, setRating] = useState(initial.rating || 5);
  const [text, setText] = useState(initial.text || '');
  const [isApproved, setIsApproved] = useState(initial.isApproved !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      customerName,
      role,
      rating: Number(rating),
      text,
      isApproved,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" aria-hidden="true" />
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-2xl border border-border-light animate-in zoom-in-95 duration-150">
        <h3 id="review-modal-title" className="font-display text-2xl text-ink uppercase mb-4 border-b border-border-light pb-2">
          {initial.id ? 'Edit Testimonial' : 'Add Testimonial'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Client Name" required id="rev-name">
            <input
              id="rev-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            />
          </FormField>

          <FormField label="Role / Affiliation" id="rev-role">
            <input
              id="rev-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Creative Director"
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            />
          </FormField>

          <FormField label="Rating (1-5)" id="rev-rating">
            <select
              id="rev-rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            >
              <option value={5}>5 Stars - Exceptional</option>
              <option value={4}>4 Stars - Great</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </select>
          </FormField>

          <FormField label="Testimonial Quote" required id="rev-text">
            <textarea
              id="rev-text"
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="The client's experience in their own words..."
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink resize-none"
            />
          </FormField>

          <div className="pt-2 flex items-center gap-2">
            <input
              id="rev-approved"
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="h-4 w-4 rounded text-accent focus:ring-accent"
            />
            <label htmlFor="rev-approved" className="text-xs font-semibold text-ink cursor-pointer">
              Approved and featured on home page slider
            </label>
          </div>

          <div className="pt-4 border-t border-border-light flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
