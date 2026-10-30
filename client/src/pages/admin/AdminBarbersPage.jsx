import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FormField from '@/components/admin/FormField';
import ImageUploader from '@/components/admin/ImageUploader';
import QueryState from '@/components/common/QueryState';
import {
  useGetBarbersQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
} from '@/features/barbers/barbersApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

const DEFAULT_WORKING_HOURS = [
  { day: 'Monday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Tuesday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Wednesday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Thursday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Friday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Saturday', start: '09:00', end: '20:30', isWorking: true },
  { day: 'Sunday', start: '10:00', end: '19:00', isWorking: false },
];

export default function AdminBarbersPage() {
  const dispatch = useAppDispatch();
  const { data: barbers = [], isLoading, isError, error, refetch } = useGetBarbersQuery();

  const [createBarber, { isLoading: isCreating }] = useCreateBarberMutation();
  const [updateBarber, { isLoading: isUpdating }] = useUpdateBarberMutation();
  const [deleteBarber, { isLoading: isDeleting }] = useDeleteBarberMutation();

  const [modalBarber, setModalBarber] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleToggleActive = async (barber) => {
    try {
      await updateBarber({ id: barber.id, isActive: !barber.isActive }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `${barber.name} status updated.`,
        })
      );
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to update barber' }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteBarber(deleteTargetId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Barber removed successfully.' }));
      setDeleteTargetId(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete barber' }));
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (modalBarber.id) {
        await updateBarber({ id: modalBarber.id, ...formData }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Barber profile updated successfully.' }));
      } else {
        await createBarber(formData).unwrap();
        dispatch(addToast({ type: 'success', message: 'New master barber added successfully.' }));
      }
      setModalBarber(null);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save barber profile' }));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Barber',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-card border border-border-light shrink-0">
            <img src={row.photoUrl} alt={row.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-semibold text-ink block">{row.name}</span>
            <span className="text-muted text-[11px]">{row.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      render: (val) => `${val || 0} years`,
    },
    {
      key: 'specialties',
      label: 'Specialties',
      render: (val) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(val || []).map((s) => (
            <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-card border border-border-light text-ink">
              {s}
            </span>
          ))}
        </div>
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
            onClick={() => setModalBarber(row)}
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
            MASTER BARBERS & ARTISANS
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Configure profiles, weekly shift hours, leave schedules, and specialties.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            setModalBarber({
              name: '',
              role: 'Senior Barber',
              photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
              experienceYears: 5,
              specialties: ['Classic Haircuts', 'Beard Styling'],
              workingHours: DEFAULT_WORKING_HOURS,
              leaveDays: [],
              isActive: true,
            })
          }
          className="self-start sm:self-auto tracking-wider uppercase font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Barber
        </Button>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <DataTable
          columns={columns}
          data={barbers}
          searchPlaceholder="Search master barbers..."
          searchKeys={['name', 'role']}
          pageSize={10}
        />
      </QueryState>

      {/* Edit / Add Modal */}
      {modalBarber && (
        <BarberModal
          initial={modalBarber}
          isLoading={isCreating || isUpdating}
          onClose={() => setModalBarber(null)}
          onSave={handleSaveModal}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Barber Profile"
        message="Are you sure you want to delete this barber? Existing appointments assigned to this barber will remain preserved in historical records."
        confirmLabel="Delete Barber"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

function BarberModal({ initial, isLoading, onClose, onSave }) {
  const [name, setName] = useState(initial.name || '');
  const [role, setRole] = useState(initial.role || 'Senior Barber');
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl || '');
  const [experienceYears, setExperienceYears] = useState(initial.experienceYears || 5);
  const [specialtiesText, setSpecialtiesText] = useState((initial.specialties || []).join(', '));
  const [workingHours, setWorkingHours] = useState(initial.workingHours || DEFAULT_WORKING_HOURS);
  const [leaveDays, setLeaveDays] = useState(
    (initial.leaveDays || []).map((d) => (typeof d === 'string' ? d.split('T')[0] : d))
  );
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [isActive, setIsActive] = useState(initial.isActive !== false);

  const handleWorkingHourChange = (day, field, value) => {
    setWorkingHours((prev) =>
      prev.map((wh) => (wh.day === day ? { ...wh, [field]: value } : wh))
    );
  };

  const handleAddLeaveDate = () => {
    if (newLeaveDate && !leaveDays.includes(newLeaveDate)) {
      setLeaveDays([...leaveDays, newLeaveDate]);
      setNewLeaveDate('');
    }
  };

  const handleRemoveLeaveDate = (dateToRemove) => {
    setLeaveDays(leaveDays.filter((d) => d !== dateToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      name,
      role,
      photoUrl,
      experienceYears: Number(experienceYears),
      specialties,
      workingHours,
      leaveDays,
      isActive,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="barber-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" aria-hidden="true" />
      <div className="w-full max-w-2xl bg-white rounded-lg p-6 sm:p-8 shadow-2xl border border-border-light my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <h3 id="barber-modal-title" className="font-display text-2xl text-ink uppercase mb-6 border-b border-border-light pb-2">
          {initial.id ? `Edit ${initial.name}` : 'Add Master Barber'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required id="barb-name">
              <input
                id="barb-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neil Fernandes"
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>

            <FormField label="Role / Title" required id="barb-role">
              <input
                id="barb-role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Traditional Barber & Stylist"
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Experience (Years)" id="barb-exp">
              <input
                id="barb-exp"
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>

            <FormField label="Specialties (comma-separated)" id="barb-spec">
              <input
                id="barb-spec"
                type="text"
                value={specialtiesText}
                onChange={(e) => setSpecialtiesText(e.target.value)}
                placeholder="e.g. Scissor Fades, Straight Razor Shaves"
                className="w-full px-3 py-2 rounded bg-card border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>
          </div>

          <ImageUploader
            label="Barber Portrait Photo"
            value={photoUrl}
            onChange={setPhotoUrl}
          />

          {/* Weekly Hours Editor */}
          <div className="space-y-3 pt-3 border-t border-border-light">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <h4 className="font-display text-lg text-ink uppercase">Weekly Shift Schedule</h4>
            </div>

            <div className="border border-border-light rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-card text-muted uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2 text-left">Day</th>
                    <th className="p-2 text-center">Working?</th>
                    <th className="p-2 text-left">Start Time</th>
                    <th className="p-2 text-left">End Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {workingHours.map((wh) => (
                    <tr key={wh.day} className="hover:bg-card/30">
                      <td className="p-2 font-semibold text-ink">{wh.day}</td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={wh.isWorking}
                          onChange={(e) => handleWorkingHourChange(wh.day, 'isWorking', e.target.checked)}
                          className="h-4 w-4 rounded text-accent focus:ring-accent"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          disabled={!wh.isWorking}
                          value={wh.start}
                          onChange={(e) => handleWorkingHourChange(wh.day, 'start', e.target.value)}
                          className="px-2 py-1 rounded bg-card border border-border-light text-xs w-20 disabled:opacity-40"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          disabled={!wh.isWorking}
                          value={wh.end}
                          onChange={(e) => handleWorkingHourChange(wh.day, 'end', e.target.value)}
                          className="px-2 py-1 rounded bg-card border border-border-light text-xs w-20 disabled:opacity-40"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Days Calendar */}
          <div className="space-y-3 pt-3 border-t border-border-light">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <h4 className="font-display text-lg text-ink uppercase">Scheduled Leave Dates</h4>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newLeaveDate}
                onChange={(e) => setNewLeaveDate(e.target.value)}
                className="px-3 py-1.5 rounded bg-card border border-border-light text-xs text-ink"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddLeaveDate}>
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Date
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {leaveDays.length === 0 ? (
                <span className="text-xs text-muted">No scheduled leave dates recorded.</span>
              ) : (
                leaveDays.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-card border border-border-light text-xs text-ink font-mono"
                  >
                    {date}
                    <button
                      type="button"
                      onClick={() => handleRemoveLeaveDate(date)}
                      className="text-muted hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="barb-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border-light text-accent focus:ring-accent"
              />
              <label htmlFor="barb-active" className="text-xs font-semibold text-ink cursor-pointer">
                Active on booking roster
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
