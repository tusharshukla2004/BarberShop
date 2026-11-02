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
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/admin/StatusBadge';
import QueryState from '@/components/common/QueryState';
import { useGetBookingsQuery } from '@/features/booking/bookingApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetServicesQuery } from '@/features/services/servicesApi';
import { useGetReportsSummaryQuery } from '@/features/reports/reportsApi';

export default function AdminDashboardPage() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { data: bookings = [], isLoading, isError, error, refetch } = useGetBookingsQuery();
  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: services = [] } = useGetServicesQuery();
  const { data: summaryData } = useGetReportsSummaryQuery();

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
    return bookings.filter((b) => b.date === todayStr);
  }, [bookings, todayStr]);

  // Next 5 upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return [...bookings]
      .filter((b) => b.status === 'confirmed' || b.status === 'pending')
      .slice(0, 5);
  }, [bookings]);

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
    <div className="space-y-8">
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

        <div className="flex items-center gap-3">
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
          <Card tone="light" className="p-5 border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                Pending Requests
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="font-display text-3xl sm:text-4xl text-ink mt-2">{counts.pending}</p>
          </Card>

          <Card tone="light" className="p-5 border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                Confirmed
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-display text-3xl sm:text-4xl text-ink mt-2">{counts.confirmed}</p>
          </Card>

          <Card tone="light" className="p-5 border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                Completed
              </span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <p className="font-display text-3xl sm:text-4xl text-ink mt-2">{counts.completed}</p>
          </Card>

          <Card tone="light" className="p-5 border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                Cancelled
              </span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="font-display text-3xl sm:text-4xl text-ink mt-2">{counts.cancelled}</p>
          </Card>
        </div>

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
              <p className="text-muted text-xs p-6 bg-white rounded-lg border border-border-light text-center">
                No active upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto overscroll-contain pr-1.5">
                {upcomingAppointments.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-lg bg-white border border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink">{bk.customerName}</span>
                        <StatusBadge status={bk.status} />
                      </div>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-accent" />
                        <span>{serviceMap[bk.serviceId] || 'Classic Haircut'}</span>
                        <span>•</span>
                        <User className="w-3.5 h-3.5 text-accent" />
                        <span>{barberMap[bk.barberId] || 'Devraj Saxena'}</span>
                      </p>
                    </div>

                    <div className="text-right sm:self-center">
                      <p className="font-display text-base text-ink">{bk.startTime}</p>
                      <p className="text-[11px] text-muted">{bk.date}</p>
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
                    className="p-4 rounded-lg bg-white border border-border-light flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-card shrink-0">
                        <img
                          src={barber.photoUrl}
                          alt={barber.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-ink">{barber.name}</p>
                        <p className="text-[11px] text-accent font-medium">{barber.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {bookedCount} booked
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
