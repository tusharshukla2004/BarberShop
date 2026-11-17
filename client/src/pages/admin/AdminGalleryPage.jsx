import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/admin/FormField';
import ImageUploader from '@/components/admin/ImageUploader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import QueryState from '@/components/common/QueryState';
import {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} from '@/features/gallery/galleryApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminGalleryPage() {
  const dispatch = useAppDispatch();
  const { data: gallery = [], isLoading, isError, error, refetch } = useGetGalleryQuery();

  const [createItem, { isLoading: isCreating }] = useCreateGalleryItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateGalleryItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteGalleryItemMutation();

  const [modalItem, setModalItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Gallery item removed.' }));
      setDeleteId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete item' }));
    }
  };

  const handleSave = async (formData) => {
    try {
      if (modalItem.id) {
        await updateItem({ id: modalItem.id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Gallery item updated.' }));
      } else {
        await createItem(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New image added to portfolio.' }));
      }
      setModalItem(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save item' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
            PORTFOLIO GALLERY
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Add, curate, categorize, and organize showcase images displayed on the public gallery.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            setModalItem({
              imageUrl: '',
              category: 'Haircut',
              caption: '',
              order: gallery.length + 1,
            })
          }
          className="self-start sm:self-auto tracking-wider uppercase font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Image
        </Button>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {gallery.length === 0 ? (
          <EmptyState
            title="Your gallery is ready to grow"
            message="Add the first image to curate the work shown on your public gallery."
            actionLabel="Add image"
            onAction={() =>
              setModalItem({
                imageUrl: '',
                category: 'Haircut',
                caption: '',
                order: gallery.length + 1,
              })
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {gallery.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-xl bg-white border border-border-light overflow-hidden shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/5] bg-card overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Gallery item'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-ink/85 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <p className="text-sm text-ink line-clamp-2 mb-3">
                    {item.caption || 'No caption provided'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border-light/60">
                    <span className="text-[11px] text-muted">Order {item.order || index + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => setModalItem(item)}
                        aria-label={`Edit ${item.caption || 'gallery item'}`}
                        className="p-2 rounded-lg text-muted hover:text-ink hover:bg-card transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setDeleteId(item.id)}
                        aria-label={`Delete ${item.caption || 'gallery item'}`}
                        className="p-2 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>

      {modalItem && (
        <GalleryModal
          initial={modalItem}
          isLoading={isCreating || isUpdating}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Remove Gallery Image"
        message="Are you sure you want to delete this photo from the public works gallery?"
        confirmLabel="Delete Image"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function GalleryModal({ initial, isLoading, onClose, onSave }) {
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '');
  const [category, setCategory] = useState(initial.category || 'Haircut');
  const [caption, setCaption] = useState(initial.caption || '');
  const [order, setOrder] = useState(initial.order || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ imageUrl, category, caption, order: Number(order) });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" aria-hidden="true" />
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-2xl border border-border-light animate-in zoom-in-95 duration-150">
        <h3 id="gallery-modal-title" className="font-display text-2xl text-ink uppercase mb-4 border-b border-border-light pb-2">
          {initial.id ? 'Edit Gallery Item' : 'Add Showcase Image'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader label="Showcase Photograph" value={imageUrl} onChange={setImageUrl} />

          <FormField label="Category" required id="gal-cat">
            <select
              id="gal-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            >
              <option value="Haircut">Haircut</option>
              <option value="Beard">Beard</option>
              <option value="Shave">Shave</option>
              <option value="Treatment">Treatment</option>
              <option value="Combo">Combo</option>
            </select>
          </FormField>

          <FormField label="Caption / Description" id="gal-caption">
            <input
              id="gal-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Scissor taper with razor lineup"
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            />
          </FormField>

          <FormField label="Display Order" id="gal-order">
            <input
              id="gal-order"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink"
            />
          </FormField>

          <div className="pt-4 border-t border-border-light flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" disabled={!imageUrl || isLoading}>
              {isLoading ? 'Saving...' : 'Save Image'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
