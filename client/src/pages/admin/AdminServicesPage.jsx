import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FormField from '@/components/admin/FormField';
import QueryState from '@/components/common/QueryState';
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '@/features/services/servicesApi';
import { formatPrice } from '@/lib/formatters';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminServicesPage() {
  const dispatch = useAppDispatch();
  const { data: services = [], isLoading, isError, error, refetch } = useGetServicesQuery();

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const [modalService, setModalService] = useState(null); // null = closed, {} = new, object = edit
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleToggleActive = async (service) => {
    try {
      await updateService({ id: service.id, isActive: !service.isActive }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `${service.name} is now ${!service.isActive ? 'active' : 'inactive'}.`,
        })
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to update service' }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteService(deleteTargetId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Service removed successfully.' }));
      setDeleteTargetId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete service' }));
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (modalService.id) {
        await updateService({ id: modalService.id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Service updated successfully.' }));
      } else {
        await createService(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New service created successfully.' }));
      }
      setModalService(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save service' }));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Service Name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-ink block">{row.name}</span>
          <span className="text-muted text-[11px] line-clamp-1">{row.description}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-[11px] bg-card border border-border-light font-semibold">
          {val}
        </span>
      ),
    },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (val) => `${val} mins`,
    },
    {
      key: 'price',
      label: 'Price',
      render: (val) => (
        <span className="font-display text-base text-ink">{formatPrice(val)}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          aria-label={`Toggle active status for ${row.name}`}
          className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
        >
          <StatusBadge status={val ? 'Active' : 'Inactive'} />
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
            onClick={() => setModalService(row)}
            aria-label={`Edit ${row.name}`}
            className="p-1.5 rounded hover:bg-card text-muted hover:text-ink transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => setDeleteTargetId(row.id)}
            aria-label={`Delete ${row.name}`}
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
            SERVICES & TREATMENTS
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Manage your grooming catalog, categories, pricing, and active menu items.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            setModalService({
              name: '',
              category: 'Hair',
              description: '',
              price: 850,
              durationMinutes: 45,
              isActive: true,
            })
          }
          className="self-start sm:self-auto tracking-wider uppercase font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Service
        </Button>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DataTable
          columns={columns}
          data={services}
          searchPlaceholder="Search services..."
          searchKeys={['name', 'category', 'description']}
          pageSize={10}
        />
      </QueryState>

      {/* Add / Edit Modal */}
      {modalService && (
        <ServiceModal
          initial={modalService}
          isLoading={isCreating || isUpdating}
          onClose={() => setModalService(null)}
          onSave={handleSaveModal}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Service"
        message="Are you sure you want to permanently delete this service? It will no longer be available for online booking."
        confirmLabel="Delete Service"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

function ServiceModal({ initial, isLoading, onClose, onSave }) {
  const [name, setName] = useState(initial.name || '');
  const [category, setCategory] = useState(initial.category || 'Hair');
  const [description, setDescription] = useState(initial.description || '');
  const [price, setPrice] = useState(initial.price || 500);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes || 30);
  const [isActive, setIsActive] = useState(initial.isActive !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      category,
      description,
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      isActive,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" aria-hidden="true" />
      <div className="w-full max-w-lg bg-white rounded-lg p-6 shadow-2xl border border-border-light animate-in zoom-in-95 duration-150">
        <h3 id="service-modal-title" className="font-display text-2xl text-ink uppercase mb-4 border-b border-border-light pb-2">
          {initial.id ? 'Edit Service' : 'Create New Service'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Service Name" required id="svc-name">
            <input
              id="svc-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Traditional Hot Towel Shave"
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Category" required id="svc-cat">
              <select
                id="svc-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Hair">Hair</option>
                <option value="Shave">Shave</option>
                <option value="Beard">Beard</option>
                <option value="Treatment">Treatment</option>
                <option value="Combo">Combo / Packages</option>
              </select>
            </FormField>

            <FormField label="Duration (Minutes)" required id="svc-dur">
              <input
                id="svc-dur"
                type="number"
                min={10}
                max={240}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>
          </div>

          <FormField label="Price in INR (₹)" required id="svc-price">
            <input
              id="svc-price"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </FormField>

          <FormField label="Description" required id="svc-desc">
            <textarea
              id="svc-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the treatment ritual..."
              className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </FormField>

          <div className="pt-2 flex items-center gap-2">
            <input
              id="svc-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent"
            />
            <label htmlFor="svc-active" className="text-xs font-semibold text-ink cursor-pointer">
              Active and visible on public booking menu
            </label>
          </div>

          <div className="pt-4 border-t border-border-light flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
