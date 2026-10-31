import { useState, useMemo, useId } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle,
  Users,
  AlertTriangle,
  Download,
  Printer,
  Sparkles,
  Table as TableIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  useGetReportsSummaryQuery,
  useGetBookingsOverTimeQuery,
  useGetServicesReportQuery,
  useGetBarbersReportQuery,
  useGetPeakHoursReportQuery,
  useGetCustomersReportQuery,
  useGetNoShowsReportQuery,
  useGetSourcesReportQuery,
} from '@/features/reports/reportsApi';
import { useGetOffersReportQuery } from '@/features/offers/offersApi';
import { useGetWalletReportQuery } from '@/features/wallet/walletApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectCurrentUser, selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';
import { Button } from '@/components/ui';

// Design token hex equivalents for Recharts SVG rendering
const TOKEN_COLORS = {
  ink: '#14100e',
  accent: '#f9a55a',
  brown: '#4a3f3a',
  cream: '#ebe0c8',
  muted: '#7a7a7a',
  emerald: '#10b981',
  danger: '#ef4444',
  grid: '#e5e7eb',
};

export default function AdminReportsPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isOwner = useAppSelector(selectIsOwner);
  const barberSelectId = useId();
  const customFromId = useId();
  const customToId = useId();

  // Presets: Today, 7 days, 30 days, This month, Last month, Custom
  const [activePreset, setActivePreset] = useState('30_days');
  const [granularity, setGranularity] = useState('day');
  const [selectedBarberId, setSelectedBarberId] = useState(
    !isOwner && currentUser?.barberId ? currentUser.barberId : ''
  );
  const [activeTab, setActiveTab] = useState('overview'); // overview, services, barbers, peak_hours, noshows, sources
  const [showScreenReaderTable, setShowScreenReaderTable] = useState(false);

  // Date calculation based on preset
  const { dateRange, label } = useMemo(() => {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);

    if (activePreset === 'today') {
      return { dateRange: { from: toStr, to: toStr }, label: 'Today' };
    }
    if (activePreset === '7_days') {
      const from = new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10);
      return { dateRange: { from, to: toStr }, label: 'Last 7 Days' };
    }
    if (activePreset === 'this_month') {
      const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      return { dateRange: { from, to: toStr }, label: 'This Month' };
    }
    if (activePreset === 'last_month') {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
      const to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
      return { dateRange: { from, to }, label: 'Last Month' };
    }
    // Default: 30 days
    const from = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);
    return { dateRange: { from, to: toStr }, label: 'Last 30 Days' };
  }, [activePreset]);

  const [customFrom, setCustomFrom] = useState(dateRange.from);
  const [customTo, setCustomTo] = useState(dateRange.to);

  const effectiveFrom = activePreset === 'custom' ? customFrom : dateRange.from;
  const effectiveTo = activePreset === 'custom' ? customTo : dateRange.to;

  const queryParams = {
    from: effectiveFrom,
    to: effectiveTo,
    barberId: selectedBarberId || undefined,
  };

  // Queries
  const {
    data: summaryData,
    refetch: refetchSummary,
  } = useGetReportsSummaryQuery(queryParams, { pollingInterval: 60000 });

  const { data: overTimeData = [] } = useGetBookingsOverTimeQuery({
    ...queryParams,
    granularity,
  });

  const { data: servicesData = [] } = useGetServicesReportQuery(queryParams);
  const { data: barbersData = [] } = useGetBarbersReportQuery(queryParams);
  const { data: peakHoursData } = useGetPeakHoursReportQuery(queryParams);
  const { data: customersData } = useGetCustomersReportQuery(queryParams);
  const { data: noShowsData = [] } = useGetNoShowsReportQuery(queryParams);
  const { data: sourcesData = [] } = useGetSourcesReportQuery(queryParams);
  const { data: offersData = [] } = useGetOffersReportQuery(queryParams);
  const { data: walletData = {} } = useGetWalletReportQuery(
    { from: effectiveFrom, to: effectiveTo },
    { skip: !isOwner }
  );

  const { data: barbersList = [] } = useGetBarbersQuery();

  // Print view trigger
  const handlePrint = () => {
    window.print();
  };

  // CSV Export trigger
  const handleExportCSV = (reportType = 'summary') => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const url = `${baseUrl}/admin/reports/${reportType}?from=${effectiveFrom}&to=${effectiveTo}&barberId=${selectedBarberId}&format=csv&granularity=${granularity}`;
      window.open(url, '_blank');
      dispatch(addToast({ type: 'success', message: 'Downloading report CSV...' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to initiate CSV export' }));
    }
  };

  const deltas = summaryData?.deltas || {};

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Top Header & Presets Bar */}
      <div className="bg-white p-5 rounded-card border border-border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-ink">
              Reports & Analytics
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-pill bg-card text-muted font-mono">
              {label}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Data-driven insights, revenue trends, and operational metrics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Preset Buttons */}
          <div className="inline-flex rounded-base border border-border p-1 bg-card/60">
            {[
              { id: 'today', label: 'Today' },
              { id: '7_days', label: '7 Days' },
              { id: '30_days', label: '30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  activePreset === p.id
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Barber filter (Owner only) */}
          {isOwner && (
            <div>
              <label htmlFor={barberSelectId} className="sr-only">
                Filter by Barber
              </label>
              <select
                id={barberSelectId}
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-base text-xs bg-white focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All Barbers</option>
                {barbersList.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CSV Export & Print */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(activeTab === 'overview' ? 'summary' : activeTab)}
            className="flex items-center gap-1.5 text-xs py-1.5"
            title="Download Excel-compatible UTF-8 CSV"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export CSV</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs py-1.5"
            title="Print report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetchSummary()}
            className="p-1.5"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Custom Date Range Pickers (if Custom preset chosen) */}
      {activePreset === 'custom' && (
        <div className="bg-white p-4 rounded-card border border-border flex flex-wrap items-center gap-3 text-xs print:hidden animate-in fade-in duration-fast">
          <span className="font-semibold text-ink">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <label htmlFor={customFromId} className="text-muted">From:</label>
            <input
              id={customFromId}
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2.5 py-1 border border-border rounded text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={customToId} className="text-muted">To:</label>
            <input
              id={customToId}
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2.5 py-1 border border-border rounded text-xs"
            />
          </div>
        </div>
      )}

      {/* Rule-based Business Insights Ribbon */}
      {summaryData?.insights && summaryData.insights.length > 0 && (
        <div className="bg-sand/30 border border-border/80 rounded-card p-4 flex items-start gap-3 print:bg-white">
          <div className="p-2 bg-accent/20 text-accent rounded-base shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
              Executive Highlights & Patterns
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {summaryData.insights.map((insight, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-ink font-medium">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Bookings */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">Bookings</span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-ink">
            {summaryData?.totalBookings || 0}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {deltas.totalBookings >= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />+{deltas.totalBookings}%
              </span>
            ) : (
              <span className="text-danger font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" />{deltas.totalBookings}%
              </span>
            )}
            <span className="text-muted">vs prior</span>
          </div>
        </div>

        {/* Completed Services */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-emerald-700">
            {summaryData?.completedBookings || 0}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {deltas.completedBookings >= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />+{deltas.completedBookings}%
              </span>
            ) : (
              <span className="text-danger font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" />{deltas.completedBookings}%
              </span>
            )}
            <span className="text-muted">vs prior</span>
          </div>
        </div>

        {/* Realized Revenue */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-ink">
            ₹{(summaryData?.revenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {deltas.revenue >= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />+{deltas.revenue}%
              </span>
            ) : (
              <span className="text-danger font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" />{deltas.revenue}%
              </span>
            )}
            <span className="text-muted">vs prior</span>
          </div>
        </div>

        {/* No-Show Rate */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">No-Show Rate</span>
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-danger">
            {summaryData?.noShowRate || 0}%
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {deltas.noShowRate <= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" />{deltas.noShowRate}%
              </span>
            ) : (
              <span className="text-danger font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />+{deltas.noShowRate}%
              </span>
            )}
            <span className="text-muted">vs prior</span>
          </div>
        </div>

        {/* Distinct Customers */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-ink">
            {summaryData?.uniqueCustomers || 0}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-muted">New: {customersData?.newCustomersCount || 0}</span>
          </div>
        </div>

        {/* Repeat Rate */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] uppercase font-bold tracking-wider">Repeat Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl text-accent">
            {summaryData?.repeatRate || 0}%
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {deltas.repeatRate >= 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                +{deltas.repeatRate}%
              </span>
            ) : (
              <span className="text-danger font-semibold flex items-center">
                {deltas.repeatRate}%
              </span>
            )}
            <span className="text-muted">loyalty</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border flex items-center gap-2 overflow-x-auto text-xs font-semibold uppercase tracking-wider print:hidden">
        {[
          { id: 'overview', label: 'Timeline & Overview' },
          { id: 'services', label: 'Services Performance' },
          { id: 'barbers', label: 'Barber Productivity' },
          { id: 'peak_hours', label: 'Peak Hours Heatmap' },
          { id: 'offers', label: 'Offers Performance' },
          { id: 'noshows', label: 'No-Shows Log' },
          { id: 'sources', label: 'Booking Sources' },
          { id: 'wallet', label: 'Packages & Loyalty' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview & Timeline */}
      {(activeTab === 'overview' || window.matchMedia?.('print').matches) && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl uppercase tracking-wide text-ink">
                  Bookings & Revenue Over Time
                </h3>
                <p className="text-xs text-muted">
                  Daily service volume and gross realized income
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <div className="inline-flex rounded border border-border p-0.5 bg-card text-xs">
                  {['day', 'week', 'month'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGranularity(g)}
                      className={`px-2 py-0.5 capitalize rounded ${
                        granularity === g ? 'bg-ink text-white font-semibold' : 'text-muted'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowScreenReaderTable(!showScreenReaderTable)}
                  className="px-2.5 py-1 rounded border border-border text-xs text-muted hover:text-ink flex items-center gap-1"
                  title="Toggle table fallback"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>{showScreenReaderTable ? 'Hide Table' : 'Data Table'}</span>
                </button>
              </div>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-72 w-full pt-2" aria-label="Bookings and revenue over time chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTimeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKEN_COLORS.grid} />
                  <XAxis dataKey="date" stroke={TOKEN_COLORS.muted} fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke={TOKEN_COLORS.muted} fontSize={11} tickLine={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={TOKEN_COLORS.accent}
                    fontSize={11}
                    tickFormatter={(v) => `₹${v}`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: TOKEN_COLORS.ink,
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="completedBookings"
                    name="Completed Cuts"
                    stroke={TOKEN_COLORS.emerald}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke={TOKEN_COLORS.accent}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Accessible Screen Reader Table Fallback */}
            {showScreenReaderTable && (
              <div className="mt-4 border-t border-border pt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <caption className="sr-only">Bookings and Revenue data table</caption>
                  <thead className="bg-card text-muted uppercase font-semibold">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Bookings</th>
                      <th className="p-2">Completed</th>
                      <th className="p-2">Revenue (₹)</th>
                      <th className="p-2">No-Shows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overTimeData.map((row) => (
                      <tr key={row.date} className="hover:bg-card/40">
                        <td className="p-2 font-mono">{row.date}</td>
                        <td className="p-2">{row.totalBookings}</td>
                        <td className="p-2 text-emerald-700 font-semibold">{row.completedBookings}</td>
                        <td className="p-2 font-mono">₹{row.revenue.toLocaleString('en-IN')}</td>
                        <td className="p-2 text-danger">{row.noShows}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Services Performance */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-ink">
              Revenue by Grooming Service
            </h3>

            {/* Bar Chart */}
            <div className="h-64 w-full" aria-label="Revenue by service chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKEN_COLORS.grid} />
                  <XAxis dataKey="name" stroke={TOKEN_COLORS.muted} fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke={TOKEN_COLORS.muted} fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: TOKEN_COLORS.ink, color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill={TOKEN_COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sortable Services Table */}
            <div className="overflow-x-auto border-t border-border pt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-card text-muted uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Service Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Bookings</th>
                    <th className="p-2.5">Completed</th>
                    <th className="p-2.5">Revenue</th>
                    <th className="p-2.5">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {servicesData.map((s) => (
                    <tr key={s.serviceId} className="hover:bg-card/30">
                      <td className="p-2.5 font-bold text-ink">{s.name}</td>
                      <td className="p-2.5 text-muted">{s.category}</td>
                      <td className="p-2.5 font-mono">{s.durationMinutes}m</td>
                      <td className="p-2.5">{s.bookingsCount}</td>
                      <td className="p-2.5 text-emerald-700 font-semibold">{s.completedCount}</td>
                      <td className="p-2.5 font-mono font-bold text-ink">₹{s.revenue.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-muted font-mono">{s.shareOfRevenue}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Barbers Productivity */}
      {activeTab === 'barbers' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-ink">
              Barber Performance & Utilization
            </h3>

            {/* Bar Chart */}
            <div className="h-64 w-full" aria-label="Barber completed cuts chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barbersData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKEN_COLORS.grid} />
                  <XAxis dataKey="name" stroke={TOKEN_COLORS.muted} fontSize={11} />
                  <YAxis stroke={TOKEN_COLORS.muted} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: TOKEN_COLORS.ink, color: '#fff', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="completedCount" name="Completed Cuts" fill={TOKEN_COLORS.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noShowCount" name="No-Shows" fill={TOKEN_COLORS.danger} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Barbers Table */}
            <div className="overflow-x-auto border-t border-border pt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-card text-muted uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Barber</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Assigned</th>
                    <th className="p-2.5">Completed</th>
                    <th className="p-2.5">Revenue</th>
                    <th className="p-2.5">No-Show Rate</th>
                    <th className="p-2.5">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {barbersData.map((b) => (
                    <tr key={b.barberId} className="hover:bg-card/30">
                      <td className="p-2.5 font-bold text-ink">{b.name}</td>
                      <td className="p-2.5 text-muted">{b.role}</td>
                      <td className="p-2.5">{b.totalAssigned}</td>
                      <td className="p-2.5 text-emerald-700 font-semibold">{b.completedCount}</td>
                      <td className="p-2.5 font-mono font-bold text-ink">₹{b.revenue.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 font-mono text-danger">{b.noShowRate}%</td>
                      <td className="p-2.5 font-mono">{b.avgServiceDuration}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Peak Hours Heatmap */}
      {activeTab === 'peak_hours' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl uppercase tracking-wide text-ink">
                  Peak Hours & Busiest Times
                </h3>
                <p className="text-xs text-muted">
                  Hourly traffic heatmap by weekday
                </p>
              </div>
              {peakHoursData?.busiestWindow && (
                <div className="bg-accent/15 px-3 py-1.5 rounded-base border border-accent/30 text-xs text-ink font-semibold">
                  Busiest: {peakHoursData.busiestWindow.dayName} at {peakHoursData.busiestWindow.hourLabel}
                </div>
              )}
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pt-2">
              <div className="min-w-[650px] space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName) => {
                  const dayCells = (peakHoursData?.matrix || []).filter((c) => c.dayName === dayName);
                  return (
                    <div key={dayName} className="flex items-center gap-2">
                      <span className="w-24 text-xs font-semibold text-ink shrink-0">
                        {dayName}
                      </span>
                      <div className="grid grid-cols-12 gap-1.5 flex-1">
                        {dayCells.map((cell) => {
                          // Intensity shading
                          let bgClass = 'bg-card/40 text-muted';
                          if (cell.count >= 8) bgClass = 'bg-accent text-white font-bold';
                          else if (cell.count >= 5) bgClass = 'bg-accent/70 text-white font-bold';
                          else if (cell.count >= 3) bgClass = 'bg-accent/40 text-ink font-semibold';
                          else if (cell.count >= 1) bgClass = 'bg-accent/20 text-ink';

                          return (
                            <div
                              key={cell.hour}
                              title={`${cell.dayName} ${cell.hourLabel}: ${cell.count} bookings (₹${cell.revenue})`}
                              className={`h-8 rounded flex items-center justify-center text-[10px] cursor-default transition-transform hover:scale-105 ${bgClass}`}
                            >
                              {cell.count > 0 ? cell.count : '·'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* X-axis Hour Labels */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="w-24 text-xs font-semibold text-muted shrink-0">Hour</span>
                  <div className="grid grid-cols-12 gap-1.5 flex-1 text-[10px] text-muted text-center font-mono">
                    {['9A', '10A', '11A', '12P', '1P', '2P', '3P', '4P', '5P', '6P', '7P', '8P'].map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: No-Shows Log */}
      {activeTab === 'noshows' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-ink">
              No-Show Records & Audit
            </h3>

            {noShowsData.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                Zero no-shows recorded in this date range. Excellent client attendance!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-card text-muted uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Service</th>
                      <th className="p-2.5">Barber</th>
                      <th className="p-2.5">Value</th>
                      <th className="p-2.5">Total Missed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {noShowsData.map((row) => (
                      <tr key={row.id} className="hover:bg-card/30">
                        <td className="p-2.5 font-mono">{row.date}</td>
                        <td className="p-2.5 font-mono">{row.startTime}</td>
                        <td className="p-2.5 font-bold text-ink flex items-center gap-1.5">
                          <span>{row.customerName}</span>
                          {row.isFlagged && (
                            <span className="px-1.5 py-0.2 bg-danger/15 text-danger rounded text-[9px] font-bold">
                              FLAGGED
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-muted">{row.phone}</td>
                        <td className="p-2.5">{row.serviceName}</td>
                        <td className="p-2.5">{row.barberName}</td>
                        <td className="p-2.5 font-mono">₹{row.price}</td>
                        <td className="p-2.5 font-mono font-bold text-danger">{row.noShowCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Booking Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wide text-ink">
              Channel Acquisition Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sourcesData.map((src) => (
                <div key={src.source} className="p-4 rounded-base border border-border bg-card/20 space-y-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-muted">
                    {src.label}
                  </div>
                  <div className="font-display text-3xl text-ink">
                    {src.count} bookings
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{src.percentage}% of all appointments</span>
                    <span className="font-mono font-bold text-ink">₹{src.revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Offers Performance */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl uppercase tracking-wide text-ink">
                  Promotional Offers & Campaign Performance
                </h3>
                <p className="text-xs text-muted">
                  Redemption volumes, discounts given, and net revenue generated by promo codes.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV('offers')}
                className="text-xs uppercase font-semibold shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export Offers CSV
              </Button>
            </div>

            {offersData.length === 0 ? (
              <div className="text-center py-12 text-muted text-xs">
                No offer redemptions recorded for the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-muted uppercase font-bold border-b border-border">
                    <tr>
                      <th className="p-3">Offer Title</th>
                      <th className="p-3">Promo Code</th>
                      <th className="p-3">Discount Type</th>
                      <th className="p-3">Value</th>
                      <th className="p-3 font-mono text-center">Uses in Period</th>
                      <th className="p-3 font-mono text-right">Discounts Given</th>
                      <th className="p-3 font-mono text-right">Revenue Generated</th>
                      <th className="p-3 font-mono text-center">Lifetime Uses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {offersData.map((row) => (
                      <tr key={row.offerId} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-3 font-semibold text-ink">{row.title}</td>
                        <td className="p-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 border border-border-light text-ink uppercase">
                            {row.promoCode}
                          </span>
                        </td>
                        <td className="p-3 capitalize text-muted">{row.type}</td>
                        <td className="p-3 font-mono">
                          {row.type === 'percent' ? `${row.value}%` : `₹${row.value}`}
                        </td>
                        <td className="p-3 font-mono text-center font-bold text-ink">
                          {row.usesInPeriod}
                        </td>
                        <td className="p-3 font-mono text-right text-emerald-700 font-bold">
                          ₹{(row.totalDiscountGiven || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono text-right font-bold text-ink">
                          ₹{(row.revenueGenerated || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono text-center text-muted">
                          {row.totalLifetimeUses || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: Packages, Memberships & Loyalty Analytics */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-1">
              <span className="text-xs text-muted uppercase font-bold tracking-wider">Package Sales Revenue</span>
              <div className="font-display text-2xl text-ink">
                ₹{(walletData.packageSalesRevenue || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-muted">
                {walletData.packageSalesCount || 0} packages sold
              </span>
            </div>

            <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-1">
              <span className="text-xs text-muted uppercase font-bold tracking-wider">Membership Revenue</span>
              <div className="font-display text-2xl text-amber-700">
                ₹{(walletData.membershipSalesRevenue || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-muted">
                {walletData.membershipSalesCount || 0} active subscriptions
              </span>
            </div>

            <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-1">
              <span className="text-xs text-muted uppercase font-bold tracking-wider">Sessions Redeemed</span>
              <div className="font-display text-2xl text-primary">
                {walletData.sessionRedemptionsCount || 0}
              </div>
              <span className="text-xs text-muted">Prepaid cuts completed</span>
            </div>

            <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-1">
              <span className="text-xs text-muted uppercase font-bold tracking-wider">Unredeemed Liability</span>
              <div className="font-display text-2xl text-ink">
                ₹{(walletData.outstandingSessionLiability || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-muted">Prepaid sessions outstanding</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg uppercase tracking-wide text-ink">Loyalty Rewards Summary</h3>
                <p className="text-xs text-muted">Digital stamp card reward redemptions during period</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV('wallet')}
                className="text-xs"
              >
                Export Wallet CSV
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-surface/50 border border-border-light flex justify-between items-center text-sm">
              <span className="text-ink font-semibold">Total Complimentary Rewards Redeemed (10 Stamps):</span>
              <span className="font-display text-xl text-emerald-700 font-bold">
                {walletData.loyaltyRewardsGiven || 0} rewards
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
