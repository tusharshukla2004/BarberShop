import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  User,
  Scissors,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/admin/StatusBadge';
import QueryState from '@/components/common/QueryState';
import { useGetBookingsQuery } from '@/features/booking/bookingApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import {
  useGetBookingsOverTimeQuery,
  useGetReportsSummaryQuery,
} from '@/features/reports/reportsApi';

export default function AdminDashboardPage() {
  const todayStr = useMemo(() => {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }, []);

  const { data: bookings = [], isLoading, isError, error, refetch } = useGetBookingsQuery();
  const {
    data: barbers = [],
    isLoading: barbersLoading,
    isError: barbersIsError,
    error: barbersError,
    refetch: refetchBarbers,
  } = useGetBarbersQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: summaryData } = useGetReportsSummaryQuery();
  const {
    data: bookingTrend = [],
    isLoading: trendIsLoading,
    isError: trendIsError,
    error: trendError,
    refetch: refetchTrend,
  } = useGetBookingsOverTimeQuery({ granularity: 'day' });

  // Metrics
  const counts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;

    bookings.forEach((b) => {
      if (b.status === 'pending') pending++;
      else if (b.status === 'confirmed') confirmed++;
      else if (b.status === 'completed') completed++;
      else if (b.status === 'cancelled') cancelled++;
    });

    return { pending, confirmed, completed, cancelled, total: bookings.length };
  }, [bookings]);

  // Today's bookings
  const todayBookings = useMemo(() => {
    return bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled');
  }, [bookings, todayStr]);

  // Next 5 upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const toMinutes = (time = '') => {
      const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return 0;
      const rawHour = Number(match[1]);
      const hour = match[3]
        ? (rawHour % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0)
        : rawHour;
      return hour * 60 + Number(match[2]);
    };

    return [...bookings]
      .filter(
        (b) =>
          (b.status === 'confirmed' || b.status === 'pending') &&
          b.date >= todayStr
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || toMinutes(a.startTime) - toMinutes(b.startTime)
      )
      .slice(0, 5);
  }, [bookings, todayStr]);

  const serviceMap = useMemo(() => {
    const map = {};
    services.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [services]);

  const barberMap = useMemo(() => {
    const map = {};
    barbers.forEach((b) => {
      map[b.id] = b.name;
    });
    return map;
  }, [barbers]);

  return (
    <div className="space-y-6">
      {/* Page Title & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-wide uppercase">
            STUDIO DASHBOARD
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Operational overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-white bg-ink px-3 py-1.5 rounded-pill hover:bg-ink/90 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span>Reports & Analytics</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-accent hover:text-ink transition-colors self-start sm:self-auto"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Rule-based Business Insights Highlight */}
      {summaryData?.insights && summaryData.insights.length > 0 && (
        <div className="bg-sand/30 border border-border/80 rounded-card p-4 flex items-start gap-3">
          <div className="p-2 bg-accent/20 text-accent rounded-base shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
              Live Business Insights
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {summaryData.insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-ink font-medium">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {/* Metric Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card tone="white" className="p-5 border border-amber-200 bg-amber-50/40 shadow-2xs hover:shadow-xs transition-shadow duration-200 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-amber-900/80 font-bold">
                Pending Requests
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl sm:text-4xl text-amber-900 mt-3 tracking-tight">{counts.pending}</p>
            <div className="mt-2 flex items-center text-[10px] text-muted">
              <span>Awaiting staff confirmation</span>
            </div>
          </Card>

          <Card tone="white" className="p-5 border border-sky-200 bg-sky-50/40 shadow-2xs hover:shadow-xs transition-shadow duration-200 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-sky-900/80 font-bold">
                Confirmed
              </span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-700 transition-colors group-hover:bg-sky-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl sm:text-4xl text-sky-800 mt-3 tracking-tight">{counts.confirmed}</p>
            <div className="mt-2 flex items-center text-[10px] text-muted">
              <span>Ready for appointments</span>
            </div>
          </Card>

          <Card tone="white" className="p-5 border border-emerald-200 bg-emerald-50/40 shadow-2xs hover:shadow-xs transition-shadow duration-200 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-emerald-900/80 font-bold">
                Completed
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 transition-colors group-hover:bg-emerald-500/20">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl sm:text-4xl text-emerald-800 mt-3 tracking-tight">{counts.completed}</p>
            <div className="mt-2 flex items-center text-[10px] text-muted">
              <span>Services concluded</span>
            </div>
          </Card>

          <Card tone="white" className="p-5 border border-rose-200 bg-rose-50/40 shadow-2xs hover:shadow-xs transition-shadow duration-200 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-rose-900/80 font-bold">
                Cancelled
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-700 transition-colors group-hover:bg-rose-500/20">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl sm:text-4xl text-rose-800 mt-3 tracking-tight">{counts.cancelled}</p>
            <div className="mt-2 flex items-center text-[10px] text-muted">
              <span>Voided or dismissed</span>
            </div>
          </Card>
        </div>

        <section className="rounded-xl border border-border-light bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink tracking-wide uppercase">
                Booking Activity
              </h2>
              <p className="mt-1 text-xs text-muted">Daily appointment volume</p>
            </div>
            <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              All barbers
            </span>
          </div>
          <QueryState
            isLoading={trendIsLoading}
            isError={trendIsError}
            error={trendError}
            onRetry={refetchTrend}
            isEmpty={bookingTrend.length === 0}
            emptyMessage="No booking activity is available for this period."
          >
            <div
              className="h-56 w-full sm:h-64"
              role="img"
              aria-label="Daily bookings and completed appointments for all barbers"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-admin-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                    tick={{ fill: 'var(--color-admin-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--color-admin-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: 'var(--color-admin-border)',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="totalBookings"
                    name="Total bookings"
                    stroke="var(--color-ink)"
                    strokeWidth={2}
                    fill="var(--color-ink)"
                    fillOpacity={0.05}
                  />
                  <Area
                    type="monotone"
                    dataKey="completedBookings"
                    name="Completed"
                    stroke="var(--color-accent-hover)"
                    strokeWidth={2}
                    fill="var(--color-accent)"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </QueryState>
        </section>

        {/* 2-Column: Upcoming Appointments & Barber Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Next 5 Upcoming Appointments (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-border-light pb-2">
              <h2 className="font-display text-xl text-ink tracking-wide uppercase">
                Upcoming Appointments
              </h2>
              <span className="text-xs text-muted font-medium">
                {todayBookings.length} scheduled for today
              </span>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-border-light bg-white px-6 py-7 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-ink">No upcoming appointments</p>
                <p className="mt-1 text-xs text-muted">
                  Confirmed and pending bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto overscroll-contain pr-1.5">
                {upcomingAppointments.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-white border border-border-light/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-accent/40 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-ink">{bk.customerName}</span>
                        <StatusBadge status={bk.status} />
                      </div>
                      <p className="text-xs text-muted mt-1.5 flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-ink/80">
                          <Scissors className="w-3.5 h-3.5 text-accent" />
                          <span>{serviceMap[bk.serviceId] || 'Service unavailable'}</span>
                        </span>
                        <span className="text-muted/50">•</span>
                        <span className="inline-flex items-center gap-1.5 text-ink/80">
                          <User className="w-3.5 h-3.5 text-accent" />
                          <span>{barberMap[bk.barberId] || 'Unassigned'}</span>
                        </span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-light/60">
                      <p className="font-display text-base text-ink tracking-tight">{bk.startTime}</p>
                      <p className="text-[11px] text-muted font-mono">{bk.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barber Availability Today (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border-b border-border-light pb-2">
              <h2 className="font-display text-xl text-ink tracking-wide uppercase">
                Artisan Rosters Today
              </h2>
            </div>

            <QueryState
              isLoading={barbersLoading}
              isError={barbersIsError}
              error={barbersError}
              onRetry={refetchBarbers}
              isEmpty={barbers.length === 0}
              emptyMessage="No barber profiles are available."
            >
              <div className="space-y-3 max-h-[440px] overflow-y-auto overscroll-contain pr-1.5">
                {barbers.map((barber) => {
                  const bookedCount = bookings.filter(
                    (b) =>
                      b.barberId === barber.id &&
                      b.date === todayStr &&
                      b.status !== 'cancelled'
                  ).length;

                  return (
                    <div
                      key={barber.id}
                      className="p-3.5 rounded-xl bg-white border border-border-light/90 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-card shrink-0 border border-border-light shadow-2xs">
                          <img
                            src={barber.photoUrl}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-ink">{barber.name}</p>
                          <p className="text-[11px] text-accent font-semibold tracking-wide uppercase">{barber.role}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                          {bookedCount} booked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </QueryState>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
