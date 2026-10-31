import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import QueryState from '@/components/common/QueryState';
import {
  useGetAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} from '@/features/faqs/faqsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

const CATEGORIES = ['Booking', 'Pricing', 'Services', 'Policies', 'Other'];

export default function AdminFaqsPage() {
  const dispatch = useAppDispatch();
  const { data: rawData = [], isLoading, isError, error, refetch } = useGetAdminFaqsQuery();

  const faqs = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData.faqs && Array.isArray(rawData.faqs)) return rawData.faqs;
    return [];
  }, [rawData]);

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const [reorderFaqs, { isLoading: isReordering }] = useReorderFaqsMutation();

  const [modalFaq, setModalFaq] = useState(null); // null = closed, {} = new, object = edit
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteFaq(deleteTargetId).unwrap();
      dispatch(addToast({ type: 'success', message: 'FAQ deleted successfully.' }));
      setDeleteTargetId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete FAQ' }));
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      const id = modalFaq.id || modalFaq._id;
      if (id) {
        await updateFaq({ id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'FAQ updated successfully.' }));
      } else {
        await createFaq(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New FAQ published successfully.' }));
      }
      setModalFaq(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save FAQ' }));
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orders = reordered.map((f, idx) => ({
      id: f.id || f._id,
      order: idx + 1,
    }));

    try {
      await reorderFaqs(orders).unwrap();
      dispatch(addToast({ type: 'success', message: 'FAQ order updated.' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to reorder' }));
    }
  };

  const columns = [
    {
      header: '#',
      accessor: (row, idx) => (
        <div className="flex items-center gap-1 text-muted font-mono text-xs">
          <span>{row.order || idx + 1}</span>
          <div className="flex flex-col ml-1">
            <button
              type="button"
              disabled={idx === 0 || isReordering}
              onClick={() => handleMoveOrder(idx, 'up')}
              className="hover:text-ink disabled:opacity-30 p-0.5 cursor-pointer"
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={idx === faqs.length - 1 || isReordering}
              onClick={() => handleMoveOrder(idx, 'down')}
              className="hover:text-ink disabled:opacity-30 p-0.5 cursor-pointer"
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: 'Question',
      accessor: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-xs text-ink truncate">{row.question?.en}</p>
          {row.question?.hi && (
            <p className="text-[11px] text-muted font-hindi truncate mt-0.5">
              {row.question.hi}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 border border-border-light text-ink uppercase tracking-wider">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${
            row.isPublished
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
          }`}
        >
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModalFaq(row)}
            title="Edit FAQ"
            className="text-xs text-muted hover:text-ink p-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTargetId(row.id || row._id)}
            title="Delete FAQ"
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
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage customer help questions, policies, and accordion display order.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => setModalFaq({})}
          className="uppercase tracking-wider text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Question
        </Button>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        isEmpty={faqs.length === 0}
        emptyMessage="No FAQs created yet. Click 'Add Question' to publish answers for your guests."
      >
        <DataTable
          columns={columns}
          data={faqs}
          searchKey="question"
          searchPlaceholder="Search questions..."
        />
      </QueryState>

      {/* Create / Edit Modal */}
      {modalFaq && (
        <FaqModal
          faq={modalFaq}
          isSubmitting={isCreating || isUpdating}
          onClose={() => setModalFaq(null)}
          onSave={handleSaveModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Question"
        message="Are you sure you want to delete this FAQ question? It will be immediately removed from the customer FAQ page."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

function FaqModal({ faq, isSubmitting, onClose, onSave }) {
  const isEditing = Boolean(faq.id || faq._id);

  const [form, setForm] = useState({
    questionEn: faq.question?.en || '',
    questionHi: faq.question?.hi || '',
    answerEn: faq.answer?.en || '',
    answerHi: faq.answer?.hi || '',
    category: faq.category || 'Booking',
    isPublished: faq.isPublished !== undefined ? faq.isPublished : true,
  });

  const [activeLangTab, setActiveLangTab] = useState('en'); // 'en' | 'hi'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.questionEn.trim() || !form.answerEn.trim()) return;

    onSave({
      question: {
        en: form.questionEn.trim(),
        hi: form.questionHi.trim(),
      },
      answer: {
        en: form.answerEn.trim(),
        hi: form.answerHi.trim(),
      },
      category: form.category,
      isPublished: Boolean(form.isPublished),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-border-light flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <h2 className="font-display text-xl uppercase tracking-wider text-ink">
            {isEditing ? 'Edit FAQ Question' : 'Add New Question'}
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
          <div className="space-y-4">
            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="faq-category" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Category
                </label>
                <select
                  id="faq-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-xs font-semibold text-ink">Published Live on Site</span>
                </label>
              </div>
            </div>

            {/* Bilingual Tab Switcher */}
            <div className="flex items-center justify-between border-b border-border-light pb-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                Bilingual Language Input
              </span>
              <div className="flex rounded-md bg-neutral-100 p-0.5 border border-border-light text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeLangTab === 'en'
                      ? 'bg-white font-semibold text-ink shadow-sm'
                      : 'text-muted'
                  }`}
                >
                  English (Primary)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('hi')}
                  className={`px-3 py-1 rounded font-hindi transition-colors ${
                    activeLangTab === 'hi'
                      ? 'bg-white font-semibold text-ink shadow-sm'
                      : 'text-muted'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>

            {/* Question Field */}
            {activeLangTab === 'en' ? (
              <div>
                <label htmlFor="faq-q-en" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Question (English) <span className="text-accent">*</span>
                </label>
                <input
                  id="faq-q-en"
                  type="text"
                  required
                  value={form.questionEn}
                  onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
                  placeholder="e.g. Do I need an appointment or can I walk in?"
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="faq-q-hi" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1 font-hindi">
                  प्रश्न (Hindi Question)
                </label>
                <input
                  id="faq-q-hi"
                  type="text"
                  value={form.questionHi}
                  onChange={(e) => setForm({ ...form, questionHi: e.target.value })}
                  placeholder="उदा. क्या मुझे अपॉइंटमेंट की आवश्यकता है या मैं सीधे आ सकता हूँ?"
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink font-hindi focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}

            {/* Answer Field */}
            {activeLangTab === 'en' ? (
              <div>
                <label htmlFor="faq-ans-en" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                  Answer (English) <span className="text-accent">*</span>
                </label>
                <textarea
                  id="faq-ans-en"
                  rows={4}
                  required
                  value={form.answerEn}
                  onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
                  placeholder="Explain your policy or answer clearly for the client..."
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="faq-ans-hi" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1 font-hindi">
                  उत्तर (Hindi Answer)
                </label>
                <textarea
                  id="faq-ans-hi"
                  rows={4}
                  value={form.answerHi}
                  onChange={(e) => setForm({ ...form, answerHi: e.target.value })}
                  placeholder="ग्राहक के लिए अपनी नीति या उत्तर स्पष्ट रूप से समझाएं..."
                  className="w-full px-3.5 py-2 rounded-md bg-card border border-border-light text-sm text-ink font-hindi focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}

            {/* Accordion Live Preview */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                <Eye className="w-3.5 h-3.5" />
                Live Accordion Preview
              </div>
              <div className="p-4 rounded-lg border border-border-light bg-neutral-50/70 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-xs text-ink">
                      {form.questionEn || 'Question preview...'}
                    </p>
                    {form.questionHi && (
                      <p className="text-[11px] text-muted font-hindi">{form.questionHi}</p>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-accent px-2 py-0.5 rounded bg-accent/10">
                    {form.category}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-light/60 text-xs text-ink/80 leading-relaxed">
                  <p>{form.answerEn || 'Answer preview will appear expanded here.'}</p>
                  {form.answerHi && (
                    <p className="text-muted font-hindi text-[11px] mt-1">{form.answerHi}</p>
                  )}
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

FaqModal.propTypes = {
  faq: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

