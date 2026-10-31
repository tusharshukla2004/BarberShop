import { useState, useMemo } from 'react';
import { Download, Search, RotateCcw, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import QueryState from '@/components/common/QueryState';
import {
  useGetAdminPaymentsQuery,
  useGetReconciliationQuery,
  useRefundPaymentMutation,
  useMarkPaidAtShopMutation,
} from '@/features/payments/paymentsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';
import { formatPrice } from '@/lib/formatters';

export default function AdminPaymentsPage() {
  const dispatch = useAppDispatch();

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Refund Modal state
  const [refundTarget, setRefundTarget] = useState(null); // payment object or null
  const [refundAmountRupees, setRefundAmountRupees] = useState('');
  const [refundReason, setRefundReason] = useState('Customer requested cancellation');
  const [bypassPolicy, setBypassPolicy] = useState(false);

  // Queries & Mutations
  const {
    data: paymentsData = { payments: [], pagination: {} },
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAdminPaymentsQuery({
    status: statusFilter,
    method: methodFilter,
    search: searchTerm,
  });

  const { data: reconciliation = {} } = useGetReconciliationQuery();

  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();
  const [markPaidAtShop, { isLoading: isMarkingPaid }] = useMarkPaidAtShopMutation();

  // Filtered payments (client-side backup)
  const filteredPayments = useMemo(() => {
    const paymentsList = paymentsData.payments || [];
    return paymentsList.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const customerName = p.booking?.customerName?.toLowerCase() || '';
        const phone = p.booking?.phone || '';
        const orderId = p.razorpayOrderId?.toLowerCase() || '';
        const paymentId = p.razorpayPaymentId?.toLowerCase() || '';
        return (
          customerName.includes(q) ||
          phone.includes(q) ||
          orderId.includes(q) ||
          paymentId.includes(q)
        );
      }
      return true;
    });
  }, [paymentsData.payments, statusFilter, methodFilter, searchTerm]);

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0) / 100, 0);
  const totalRefunded = filteredPayments.reduce(
    (sum, p) => sum + (p.refundedAmount || 0) / 100,
    0
  );

  // CSV Export
  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    const headers = [
      'Payment ID',
      'Order ID',
      'Date',
      'Customer',
      'Phone',
      'Booking Date',
      'Time',
      'Amount (INR)',
      'Refunded (INR)',
      'Purpose',
      'Method',
      'Status',
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.razorpayPaymentId || p.id}"`,
      `"${p.razorpayOrderId}"`,
      `"${new Date(p.createdAt).toLocaleString('en-IN')}"`,
      `"${p.booking?.customerName || 'N/A'}"`,
      `"${p.booking?.phone || 'N/A'}"`,
      `"${p.booking?.date || 'N/A'}"`,
      `"${p.booking?.startTime || 'N/A'}"`,
      (p.amount || 0) / 100,
      (p.refundedAmount || 0) / 100,
      `"${p.purpose || 'deposit'}"`,
      `"${p.method || 'online'}"`,
      `"${p.status}"`,
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Mark Paid at Studio
  const handleMarkPaid = async (bookingId) => {
    try {
      await markPaidAtShop(bookingId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Remaining balance marked as paid at studio.' }));
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to update booking status' }));
    }
  };

  // Open Refund Modal
  const openRefundModal = (payment) => {
    setRefundTarget(payment);
    const maxRefundRupees = Math.max(0, (payment.amount - (payment.refundedAmount || 0)) / 100);
    setRefundAmountRupees(String(maxRefundRupees));
    setRefundReason('Customer requested cancellation');
    setBypassPolicy(false);
  };

  // Submit Refund
  const handleConfirmRefund = async () => {
    if (!refundTarget) return;
    const amountVal = parseFloat(refundAmountRupees);
    if (isNaN(amountVal) || amountVal <= 0) {
      dispatch(addToast({ type: 'error', message: 'Please enter a valid refund amount.' }));
      return;
    }

    try {
      await refundPayment({
        id: refundTarget.id || refundTarget._id,
        amountPaise: Math.round(amountVal * 100),
        reason: refundReason,
        bypassPolicy,
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: `Successfully processed refund of ₹${amountVal}.`,
        })
      );
      setRefundTarget(null);
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Refund processing failed' }));
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (_, p) => (
        <div className="text-xs">
          <p className="font-semibold text-ink">
            {new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-muted">
            {new Date(p.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (_, p) => (
        <div className="text-xs">
          <p className="font-semibold text-ink">{p.booking?.customerName || 'Walk-in / Direct'}</p>
          <p className="text-muted">{p.booking?.phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'booking',
      label: 'Appointment',
      render: (_, p) => (
        <div className="text-xs">
          <p className="font-medium text-ink">
            {p.booking?.date} at {p.booking?.startTime}
          </p>
          <p className="text-[11px] text-muted font-mono">{p.razorpayOrderId}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount (₹)',
      render: (_, p) => (
        <div className="text-xs">
          <p className="font-bold text-ink">{formatPrice((p.amount || 0) / 100)}</p>
          {p.refundedAmount > 0 && (
            <p className="text-[11px] text-purple-700">
              Ref: -{formatPrice(p.refundedAmount / 100)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'purpose',
      label: 'Type',
      render: (val) => (
        <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
          {val || 'deposit'}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (val) => (
        <span className="text-xs uppercase text-muted font-mono">{val || 'Online'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, p) => {
        const canRefund = p.status === 'captured' || p.status === 'partially_refunded';
        const bookingId = p.booking?.id || p.bookingId;
        const hasBalanceDue = p.booking?.status !== 'completed' && p.status === 'captured';

        return (
          <div className="flex items-center gap-1.5">
            {canRefund && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openRefundModal(p)}
                className="text-[11px] py-1 px-2.5 text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Refund
              </Button>
            )}

            {hasBalanceDue && bookingId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isMarkingPaid}
                onClick={() => handleMarkPaid(bookingId)}
                className="text-[11px] py-1 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <Check className="w-3 h-3 mr-1" />
                Paid at Shop
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-display text-2xl text-ink uppercase tracking-wide">
            Payments & Financial Ledger
          </h1>
          <p className="text-xs text-muted mt-1">
            Track Razorpay online deposits, full collections, studio settlements, and issue refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
            className="text-xs uppercase font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial Reconciliation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card tone="white" className="p-4 border border-border-light">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Total Expected
          </p>
          <p className="text-xl font-display text-ink mt-1">
            {formatPrice(reconciliation.totalExpected || 0)}
          </p>
          <p className="text-[10px] text-muted mt-0.5">Confirmed & completed</p>
        </Card>

        <Card tone="white" className="p-4 border border-emerald-200 bg-emerald-50/30">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Collected Online
          </p>
          <p className="text-xl font-display text-emerald-700 mt-1">
            {formatPrice(reconciliation.collectedOnline || 0)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Via Razorpay Gateway</p>
        </Card>

        <Card tone="white" className="p-4 border border-sky-200 bg-sky-50/30">
          <p className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
            Collected at Studio
          </p>
          <p className="text-xl font-display text-sky-700 mt-1">
            {formatPrice(reconciliation.collectedAtShop || 0)}
          </p>
          <p className="text-[10px] text-sky-600 mt-0.5">In-person cash & cards</p>
        </Card>

        <Card tone="white" className="p-4 border border-amber-200 bg-amber-50/30">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Pending Balances
          </p>
          <p className="text-xl font-display text-amber-700 mt-1">
            {formatPrice(reconciliation.pendingBalance || 0)}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">Due upon arrival</p>
        </Card>

        <Card tone="white" className="p-4 border border-purple-200 bg-purple-50/30">
          <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
            Refunded
          </p>
          <p className="text-xl font-display text-purple-700 mt-1">
            {formatPrice(reconciliation.refundedOnline || 0)}
          </p>
          <p className="text-[10px] text-purple-600 mt-0.5">Returned to clients</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card tone="white" className="p-4 border border-border-light space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border-light bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Status & Method Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-border-light bg-neutral-50 text-ink focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="captured">Captured</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
              <option value="created">Created (Pending)</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-border-light bg-neutral-50 text-ink focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <Card tone="white" className="border border-border-light overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredPayments}
            emptyMessage="No payments found matching the selected filters."
          />

          {/* Totals Summary Row */}
          {filteredPayments.length > 0 && (
            <div className="px-6 py-3.5 bg-neutral-50 border-t border-border-light flex flex-col sm:flex-row items-center justify-between text-xs text-muted">
              <span>Showing {filteredPayments.length} transactions</span>
              <div className="flex items-center gap-6 font-semibold text-ink">
                <span>
                  Net Total:{' '}
                  <strong className="text-accent">{formatPrice(totalAmount - totalRefunded)}</strong>
                </span>
                {totalRefunded > 0 && (
                  <span className="text-purple-700">Refunded: {formatPrice(totalRefunded)}</span>
                )}
              </div>
            </div>
          )}
        </Card>
      </QueryState>

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg shadow-xl border border-border-light overflow-hidden">
            <div className="p-5 border-b border-border-light flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <h3 className="font-display text-base text-ink uppercase tracking-wider">
                  Process Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="text-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded border border-border-light space-y-1">
                <p>
                  <strong>Customer:</strong> {refundTarget.booking?.customerName} (
                  {refundTarget.booking?.phone})
                </p>
                <p>
                  <strong>Appointment:</strong> {refundTarget.booking?.date} at{' '}
                  {refundTarget.booking?.startTime}
                </p>
                <p>
                  <strong>Original Paid:</strong> {formatPrice(refundTarget.amount / 100)}
                </p>
              </div>

              <div>
                <label htmlFor="refund-amount-input" className="block font-semibold text-ink mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  id="refund-amount-input"
                  type="number"
                  step="1"
                  min="1"
                  max={(refundTarget.amount - (refundTarget.refundedAmount || 0)) / 100}
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border-light bg-neutral-50 focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label htmlFor="refund-reason-input" className="block font-semibold text-ink mb-1">
                  Refund Audit Reason
                </label>
                <input
                  id="refund-reason-input"
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Cancelled 2 hours prior, Salon emergency, etc."
                  className="w-full px-3 py-2 rounded border border-border-light bg-neutral-50 focus:bg-white text-xs"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bypassPolicy}
                  onChange={(e) => setBypassPolicy(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded text-accent"
                />
                <span className="text-[11px] text-muted leading-tight">
                  Admin Override: bypass cancellation policy window (e.g. exception granted by
                  manager)
                </span>
              </label>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-border-light flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRefundTarget(null)}
                className="text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                disabled={isRefunding}
                onClick={handleConfirmRefund}
                className="text-xs uppercase font-semibold"
              >
                {isRefunding ? 'Refunding...' : 'Confirm Refund'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
