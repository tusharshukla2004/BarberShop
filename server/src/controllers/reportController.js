import { Booking } from '../models/Booking.js';
import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { Customer } from '../models/Customer.js';
import { Offer } from '../models/Offer.js';
import { Payment } from '../models/Payment.js';
import { CustomerPackage } from '../models/CustomerPackage.js';
import { CustomerMembership } from '../models/CustomerMembership.js';
import { LoyaltyAccount } from '../models/LoyaltyAccount.js';
import { getKolkataCurrentDateAndMinutes, timeToMinutes } from '../utils/slots.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  calculateRevenue,
  calculateNoShowRate,
  calculateRepeatRate,
  calculatePeriodDelta,
  calculatePaymentBreakdown,
  calculateWalletMetrics,
} from '../reports/definitions.js';

// In-memory 60s cache
const reportCache = new Map();
const CACHE_TTL_MS = 60000;

function getCached(key) {
  const item = reportCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    reportCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  reportCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Resolves date parameters and role security
 */
function resolveReportParams(req) {
  const { dateStr, todayDate } = getKolkataCurrentDateAndMinutes();
  const todayStr = dateStr || todayDate || new Date().toISOString().slice(0, 10);
  let to = req.query.to || todayStr;
  let toDate = new Date(`${to}T00:00:00Z`);
  if (isNaN(toDate.getTime())) {
    to = todayStr;
    toDate = new Date(`${to}T00:00:00Z`);
  }

  // Default: 30 days prior
  let from = req.query.from;
  let fromDate;
  if (!from) {
    fromDate = new Date(toDate.getTime() - 29 * 86400000);
    from = fromDate.toISOString().slice(0, 10);
  } else {
    fromDate = new Date(`${from}T00:00:00Z`);
    if (isNaN(fromDate.getTime())) {
      fromDate = new Date(toDate.getTime() - 29 * 86400000);
      from = fromDate.toISOString().slice(0, 10);
    }
  }
  const diffDays = Math.max(1, Math.round((toDate - fromDate) / 86400000) + 1);

  const prevToDate = new Date(fromDate.getTime() - 86400000);
  const prevFromDate = new Date(prevToDate.getTime() - (diffDays - 1) * 86400000);
  const prevFrom = prevFromDate.toISOString().slice(0, 10);
  const prevTo = prevToDate.toISOString().slice(0, 10);

  // Role security: Barbers can only see their own numbers
  let barberId = req.query.barberId || '';
  if (req.user?.role === 'barber') {
    barberId = req.user.barberId || req.user.id;
  }

  const granularity = req.query.granularity || 'day';
  const format = req.query.format || 'json';

  return { from, to, prevFrom, prevTo, barberId, granularity, format, diffDays };
}

/**
 * Generates an Excel-ready UTF-8 CSV with BOM
 */
function sendCSVResponse(res, filename, columns, rows) {
  const BOM = '\uFEFF';
  const headerLine = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  return res.status(200).send(csvContent);
}

/**
 * Computes rule-based insights from period data
 */
function generateInsights({ summary, peakHours, services, barbers }) {
  const insights = [];

  // Peak window insight
  if (peakHours && peakHours.busiestWindow) {
    insights.push(`${peakHours.busiestWindow.dayName} ${peakHours.busiestWindow.hourLabel} is your busiest time.`);
  }

  // No-show rate insight
  if (summary.deltas.noShowRate > 2) {
    insights.push(`No-show rate is ${summary.deltas.noShowRate}% higher than previous period.`);
  } else if (summary.deltas.noShowRate < -2) {
    insights.push(`No-show rate dropped by ${Math.abs(summary.deltas.noShowRate)}% compared to last period.`);
  }

  // Top service insight
  if (services && services.length > 0 && services[0].revenue > 0) {
    insights.push(`${services[0].name} is your top revenue driver (₹${services[0].revenue.toLocaleString('en-IN')}).`);
  }

  // Revenue trend
  if (summary.deltas.revenue > 5) {
    insights.push(`Gross revenue increased by +${summary.deltas.revenue}% vs previous period.`);
  } else if (summary.deltas.revenue < -5) {
    insights.push(`Revenue contracted by ${summary.deltas.revenue}% vs previous period.`);
  }

  // Customer repeat rate
  if (summary.repeatRate >= 40) {
    insights.push(`High client loyalty: ${summary.repeatRate}% repeat visitor rate.`);
  }

  return insights;
}

/**
 * GET /api/admin/reports/summary
 */
export async function getSummaryReport(req, res, next) {
  try {
    const { from, to, prevFrom, prevTo, barberId, format } = resolveReportParams(req);
    const cacheKey = `summary:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const baseFilter = { date: { $gte: from, $lte: to } };
    if (barberId) baseFilter.barberId = barberId;

    const prevFilter = { date: { $gte: prevFrom, $lte: prevTo } };
    if (barberId) prevFilter.barberId = barberId;

    const [currentBookings, prevBookings, periodPayments, uniqueCustomers] = await Promise.all([
      Booking.find(baseFilter).lean(),
      Booking.find(prevFilter).lean(),
      Payment.find({}).lean(),
      Customer.find({ isDeleted: false }).lean(),
    ]);

    // Current period metrics
    const totalBookings = currentBookings.length;
    const completedBookings = currentBookings.filter((b) => b.status === 'completed');
    const completedCount = completedBookings.length;
    const revenue = calculateRevenue(completedBookings);
    const noShows = currentBookings.filter((b) => b.status === 'no_show').length;
    const noShowRate = calculateNoShowRate(noShows, completedCount);

    // Customer metrics in period
    const distinctPhonesInPeriod = new Set(
      currentBookings.map((b) => b.phone).filter(Boolean)
    );
    const customerVisitCounts = {};
    for (const b of currentBookings) {
      if (b.phone) {
        customerVisitCounts[b.phone] = (customerVisitCounts[b.phone] || 0) + 1;
      }
    }
    const repeatCount = Object.values(customerVisitCounts).filter((cnt) => cnt > 1).length;
    const repeatRate = calculateRepeatRate(repeatCount, distinctPhonesInPeriod.size);

    // Previous period metrics
    const prevCompleted = prevBookings.filter((b) => b.status === 'completed');
    const prevCompletedCount = prevCompleted.length;
    const prevRevenue = calculateRevenue(prevCompleted);
    const prevNoShows = prevBookings.filter((b) => b.status === 'no_show').length;
    const prevNoShowRate = calculateNoShowRate(prevNoShows, prevCompletedCount);

    const prevPhones = new Set(prevBookings.map((b) => b.phone).filter(Boolean));
    const prevVisits = {};
    for (const b of prevBookings) {
      if (b.phone) prevVisits[b.phone] = (prevVisits[b.phone] || 0) + 1;
    }
    const prevRepeatCount = Object.values(prevVisits).filter((c) => c > 1).length;
    const prevRepeatRate = calculateRepeatRate(prevRepeatCount, prevPhones.size);

    // Deltas
    const deltas = {
      totalBookings: calculatePeriodDelta(totalBookings, prevBookings.length),
      completedBookings: calculatePeriodDelta(completedCount, prevCompletedCount),
      revenue: calculatePeriodDelta(revenue, prevRevenue),
      noShowRate: Math.round((noShowRate - prevNoShowRate) * 10) / 10,
      uniqueCustomers: calculatePeriodDelta(distinctPhonesInPeriod.size, prevPhones.size),
      repeatRate: Math.round((repeatRate - prevRepeatRate) * 10) / 10,
    };

    const summaryPayload = {
      period: { from, to, prevFrom, prevTo },
      totalBookings,
      completedBookings: completedCount,
      revenue,
      noShows,
      noShowRate,
      uniqueCustomers: distinctPhonesInPeriod.size,
      repeatRate,
      previousPeriod: {
        totalBookings: prevBookings.length,
        completedBookings: prevCompletedCount,
        revenue: prevRevenue,
        noShowRate: prevNoShowRate,
        uniqueCustomers: prevPhones.size,
        repeatRate: prevRepeatRate,
      },
      deltas,
      payments: calculatePaymentBreakdown(currentBookings, periodPayments),
    };

    // Calculate light insights
    const insights = generateInsights({ summary: summaryPayload });
    summaryPayload.insights = insights;

    setCached(cacheKey, summaryPayload);

    if (format === 'csv') {
      const csvRows = [
        { Metric: 'Total Bookings', 'Current Period': totalBookings, 'Previous Period': prevBookings.length, Change: `${deltas.totalBookings}%` },
        { Metric: 'Completed Services', 'Current Period': completedCount, 'Previous Period': prevCompletedCount, Change: `${deltas.completedBookings}%` },
        { Metric: 'Gross Revenue (INR)', 'Current Period': revenue, 'Previous Period': prevRevenue, Change: `${deltas.revenue}%` },
        { Metric: 'No-Show Rate (%)', 'Current Period': `${noShowRate}%`, 'Previous Period': `${prevNoShowRate}%`, Change: `${deltas.noShowRate}%` },
        { Metric: 'Distinct Customers', 'Current Period': distinctPhonesInPeriod.size, 'Previous Period': prevPhones.size, Change: `${deltas.uniqueCustomers}%` },
        { Metric: 'Repeat Customer Rate (%)', 'Current Period': `${repeatRate}%`, 'Previous Period': `${prevRepeatRate}%`, Change: `${deltas.repeatRate}%` },
      ];
      return sendCSVResponse(
        res,
        `summary-report-${from}-to-${to}`,
        [
          { key: 'Metric', label: 'Metric' },
          { key: 'Current Period', label: 'Current Period' },
          { key: 'Previous Period', label: 'Previous Period' },
          { key: 'Change', label: 'Change' },
        ],
        csvRows
      );
    }

    return sendSuccess(res, summaryPayload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/bookings-over-time
 */
export async function getBookingsOverTime(req, res, next) {
  try {
    const { from, to, barberId, granularity, format } = resolveReportParams(req);
    const cacheKey = `over-time:${from}:${to}:${barberId}:${granularity}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const bookings = await Booking.find(matchQuery).sort({ date: 1 }).lean();

    // Grouping map
    const timelineMap = new Map();

    // Pre-populate continuous timeline dates for 'day' granularity
    if (granularity === 'day') {
      const curr = new Date(`${from}T00:00:00Z`);
      const end = new Date(`${to}T00:00:00Z`);
      while (curr <= end) {
        const dStr = curr.toISOString().slice(0, 10);
        timelineMap.set(dStr, {
          date: dStr,
          totalBookings: 0,
          completedBookings: 0,
          revenue: 0,
          noShows: 0,
        });
        curr.setDate(curr.getDate() + 1);
      }
    }

    // Populate data
    for (const b of bookings) {
      let bucketKey = b.date;
      if (granularity === 'month') {
        bucketKey = b.date.slice(0, 7); // YYYY-MM
      } else if (granularity === 'week') {
        const d = new Date(`${b.date}T00:00:00Z`);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday of week
        const monday = new Date(d.setUTCDate(diff));
        bucketKey = monday.toISOString().slice(0, 10);
      }

      if (!timelineMap.has(bucketKey)) {
        timelineMap.set(bucketKey, {
          date: bucketKey,
          totalBookings: 0,
          completedBookings: 0,
          revenue: 0,
          noShows: 0,
        });
      }

      const item = timelineMap.get(bucketKey);
      item.totalBookings++;
      if (b.status === 'completed') {
        item.completedBookings++;
        item.revenue += b.priceAtBooking || 0;
      } else if (b.status === 'no_show') {
        item.noShows++;
      }
    }

    const result = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    setCached(cacheKey, result);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `bookings-over-time-${granularity}-${from}-to-${to}`,
        [
          { key: 'date', label: 'Date' },
          { key: 'totalBookings', label: 'Total Bookings' },
          { key: 'completedBookings', label: 'Completed' },
          { key: 'revenue', label: 'Revenue (INR)' },
          { key: 'noShows', label: 'No Shows' },
        ],
        result
      );
    }

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/services
 */
export async function getServicesReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `services:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const [bookings, services] = await Promise.all([
      Booking.find(matchQuery).lean(),
      Service.find().lean(),
    ]);

    const serviceMap = new Map();
    for (const s of services) {
      const sid = s.id || s._id.toString();
      serviceMap.set(sid, {
        serviceId: sid,
        name: s.name,
        category: s.category || 'Grooming',
        durationMinutes: s.durationMinutes || 30,
        price: s.price || 0,
        bookingsCount: 0,
        completedCount: 0,
        revenue: 0,
      });
    }

    let totalRealizedRevenue = 0;
    for (const b of bookings) {
      const sid = b.serviceId;
      if (!serviceMap.has(sid)) {
        serviceMap.set(sid, {
          serviceId: sid,
          name: 'Custom Service',
          category: 'Other',
          durationMinutes: 30,
          price: b.priceAtBooking || 0,
          bookingsCount: 0,
          completedCount: 0,
          revenue: 0,
        });
      }
      const entry = serviceMap.get(sid);
      entry.bookingsCount++;
      if (b.status === 'completed') {
        entry.completedCount++;
        entry.revenue += b.priceAtBooking || 0;
        totalRealizedRevenue += b.priceAtBooking || 0;
      }
    }

    const result = Array.from(serviceMap.values())
      .filter((s) => s.bookingsCount > 0)
      .map((s) => ({
        ...s,
        shareOfRevenue:
          totalRealizedRevenue > 0
            ? Math.round((s.revenue / totalRealizedRevenue) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setCached(cacheKey, result);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `services-performance-${from}-to-${to}`,
        [
          { key: 'name', label: 'Service Name' },
          { key: 'category', label: 'Category' },
          { key: 'bookingsCount', label: 'Total Bookings' },
          { key: 'completedCount', label: 'Completed' },
          { key: 'revenue', label: 'Revenue (INR)' },
          { key: 'shareOfRevenue', label: 'Revenue Share (%)' },
        ],
        result
      );
    }

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/barbers
 */
export async function getBarbersReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `barbers:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const [bookings, barbers, services] = await Promise.all([
      Booking.find(matchQuery).lean(),
      Barber.find().lean(),
      Service.find().lean(),
    ]);

    const serviceDurationMap = new Map();
    for (const s of services) {
      serviceDurationMap.set(s.id || s._id.toString(), s.durationMinutes || 30);
    }

    const barberMap = new Map();
    for (const b of barbers) {
      const bId = b.id || b._id.toString();
      // If barber filter is active, only include target barber
      if (barberId && bId !== barberId) continue;

      barberMap.set(bId, {
        barberId: bId,
        name: b.name,
        role: b.role || 'Barber',
        isActive: b.isActive,
        totalAssigned: 0,
        completedCount: 0,
        revenue: 0,
        noShowCount: 0,
        totalDurationMinutes: 0,
      });
    }

    for (const b of bookings) {
      const bId = (b.barberId || '').toString();
      if (!barberMap.has(bId)) {
        if (!barberId) {
          barberMap.set(bId, {
            barberId: bId || 'unassigned',
            name: bId ? 'Other Staff' : 'Any Barber',
            role: 'Barber',
            isActive: true,
            totalAssigned: 0,
            completedCount: 0,
            revenue: 0,
            noShowCount: 0,
            totalDurationMinutes: 0,
          });
        } else {
          continue;
        }
      }

      const entry = barberMap.get(bId);
      entry.totalAssigned++;

      if (b.status === 'completed') {
        entry.completedCount++;
        entry.revenue += b.priceAtBooking || 0;
        const dur = serviceDurationMap.get(b.serviceId) || 30;
        entry.totalDurationMinutes += dur;
      } else if (b.status === 'no_show') {
        entry.noShowCount++;
      }
    }

    const result = Array.from(barberMap.values())
      .map((b) => {
        const noShowRate = calculateNoShowRate(b.noShowCount, b.completedCount);
        const avgServiceDuration =
          b.completedCount > 0
            ? Math.round(b.totalDurationMinutes / b.completedCount)
            : 0;

        return {
          barberId: b.barberId,
          name: b.name,
          role: b.role,
          totalAssigned: b.totalAssigned,
          completedCount: b.completedCount,
          revenue: b.revenue,
          noShowCount: b.noShowCount,
          noShowRate,
          avgServiceDuration,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    setCached(cacheKey, result);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `barbers-performance-${from}-to-${to}`,
        [
          { key: 'name', label: 'Barber Name' },
          { key: 'totalAssigned', label: 'Total Assigned' },
          { key: 'completedCount', label: 'Completed' },
          { key: 'revenue', label: 'Revenue (INR)' },
          { key: 'noShowCount', label: 'No Shows' },
          { key: 'noShowRate', label: 'No Show Rate (%)' },
          { key: 'avgServiceDuration', label: 'Avg Duration (Mins)' },
        ],
        result
      );
    }

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/peak-hours
 */
export async function getPeakHoursReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `peak-hours:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const bookings = await Booking.find(matchQuery).lean();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // Build empty matrix
    const matrix = [];
    for (let day = 0; day < 7; day++) {
      for (const h of hours) {
        const periodStr = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h;
        matrix.push({
          dayOfWeek: day,
          dayName: dayNames[day],
          hour: h,
          hourLabel: `${displayHour}:00 ${periodStr}`,
          count: 0,
          revenue: 0,
        });
      }
    }

    // Populate from bookings
    for (const b of bookings) {
      if (!b.startTime) continue;
      const d = new Date(`${b.date}T00:00:00Z`);
      const day = d.getUTCDay();

      const mins = timeToMinutes(b.startTime);
      const hour = Math.floor(mins / 60);

      const cell = matrix.find((c) => c.dayOfWeek === day && c.hour === hour);
      if (cell) {
        cell.count++;
        if (b.status === 'completed') {
          cell.revenue += b.priceAtBooking || 0;
        }
      }
    }

    // Find highest peak cell
    let maxCell = null;
    let maxCount = -1;
    for (const cell of matrix) {
      if (cell.count > maxCount) {
        maxCount = cell.count;
        maxCell = cell;
      }
    }

    const payload = {
      matrix,
      busiestWindow: maxCell && maxCount > 0 ? maxCell : null,
    };

    setCached(cacheKey, payload);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `peak-hours-heatmap-${from}-to-${to}`,
        [
          { key: 'dayName', label: 'Day' },
          { key: 'hourLabel', label: 'Time Window' },
          { key: 'count', label: 'Bookings Count' },
          { key: 'revenue', label: 'Revenue (INR)' },
        ],
        matrix
      );
    }

    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/customers
 */
export async function getCustomersReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `customers:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const [periodBookings, allCustomers] = await Promise.all([
      Booking.find(matchQuery).lean(),
      Customer.find({ isDeleted: false }).lean(),
    ]);

    // Customer map
    const customerMap = new Map();
    for (const c of allCustomers) {
      const cId = c.id || c._id.toString();
      customerMap.set(cId, {
        id: cId,
        name: c.name,
        phone: c.phone,
        notes: c.notes || '',
        tags: c.tags || [],
        totalLifetimeVisits: c.stats?.totalVisits || 0,
        lifetimeSpent: c.stats?.totalSpent || 0,
        visitsInPeriod: 0,
        spentInPeriod: 0,
        createdAt: c.createdAt,
      });
    }

    const seenPhonesInPeriod = new Set();

    for (const b of periodBookings) {
      const cId = b.customerId?.toString();
      if (cId && customerMap.has(cId)) {
        const c = customerMap.get(cId);
        c.visitsInPeriod++;
        if (b.status === 'completed') {
          c.spentInPeriod += b.priceAtBooking || 0;
        }
      }
      if (b.phone) seenPhonesInPeriod.add(b.phone);
    }

    // Identify new vs returning:
    // A customer is 'new' if their createdAt is >= from date
    const fromDate = new Date(`${from}T00:00:00Z`);
    let newCustomersCount = 0;
    let returningCustomersCount = 0;

    for (const c of customerMap.values()) {
      if (c.visitsInPeriod > 0) {
        if (new Date(c.createdAt) >= fromDate) {
          newCustomersCount++;
        } else {
          returningCustomersCount++;
        }
      }
    }

    const topCustomers = Array.from(customerMap.values())
      .filter((c) => c.visitsInPeriod > 0)
      .sort((a, b) => b.spentInPeriod - a.spentInPeriod)
      .slice(0, 20);

    const payload = {
      totalDistinctInPeriod: seenPhonesInPeriod.size,
      newCustomersCount,
      returningCustomersCount,
      topCustomers,
    };

    setCached(cacheKey, payload);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `top-customers-${from}-to-${to}`,
        [
          { key: 'name', label: 'Customer Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'visitsInPeriod', label: 'Visits in Period' },
          { key: 'spentInPeriod', label: 'Spent in Period (INR)' },
          { key: 'totalLifetimeVisits', label: 'Total Lifetime Visits' },
          { key: 'lifetimeSpent', label: 'Lifetime Spent (INR)' },
        ],
        topCustomers
      );
    }

    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/no-shows
 */
export async function getNoShowsReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `no-shows:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to }, status: 'no_show' };
    if (barberId) matchQuery.barberId = barberId;

    const [noShowBookings, barbers, services, customers] = await Promise.all([
      Booking.find(matchQuery).sort({ date: -1 }).lean(),
      Barber.find().lean(),
      Service.find().lean(),
      Customer.find({ isDeleted: false }).lean(),
    ]);

    const barberMap = new Map(barbers.map((b) => [b.id || b._id.toString(), b.name]));
    const serviceMap = new Map(services.map((s) => [s.id || s._id.toString(), s.name]));
    const customerMap = new Map(customers.map((c) => [c.id || c._id.toString(), c]));

    const enrichedNoShows = noShowBookings.map((b) => {
      const c = b.customerId ? customerMap.get(b.customerId.toString()) : null;
      return {
        id: b.id || b._id.toString(),
        date: b.date,
        startTime: b.startTime,
        customerName: b.customerName,
        phone: b.phone,
        barberName: barberMap.get(b.barberId) || 'Unassigned',
        serviceName: serviceMap.get(b.serviceId) || 'Grooming',
        price: b.priceAtBooking || 0,
        isFlagged: c?.isFlagged || false,
        noShowCount: c?.stats?.noShowCount || 1,
      };
    });

    setCached(cacheKey, enrichedNoShows);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `no-shows-report-${from}-to-${to}`,
        [
          { key: 'date', label: 'Date' },
          { key: 'startTime', label: 'Time' },
          { key: 'customerName', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'serviceName', label: 'Service' },
          { key: 'barberName', label: 'Barber' },
          { key: 'price', label: 'Value (INR)' },
          { key: 'noShowCount', label: 'Customer Total No Shows' },
        ],
        enrichedNoShows
      );
    }

    return sendSuccess(res, enrichedNoShows);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/sources
 */
export async function getSourcesReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `sources:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const bookings = await Booking.find(matchQuery).lean();

    const sourceStats = {
      online_booking: { source: 'online_booking', label: 'Online Booking', count: 0, completedCount: 0, revenue: 0 },
      walk_in: { source: 'walk_in', label: 'Walk-in Queue', count: 0, completedCount: 0, revenue: 0 },
      admin_created: { source: 'admin_created', label: 'Admin Created', count: 0, completedCount: 0, revenue: 0 },
    };

    let totalCount = bookings.length;

    for (const b of bookings) {
      const srcKey =
        b.source === 'walk_in'
          ? 'walk_in'
          : b.source === 'admin'
          ? 'admin_created'
          : 'online_booking';

      const item = sourceStats[srcKey];
      item.count++;
      if (b.status === 'completed') {
        item.completedCount++;
        item.revenue += b.priceAtBooking || 0;
      }
    }

    const result = Object.values(sourceStats).map((item) => ({
      ...item,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 1000) / 10 : 0,
    }));

    setCached(cacheKey, result);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `booking-sources-${from}-to-${to}`,
        [
          { key: 'label', label: 'Source Channel' },
          { key: 'count', label: 'Total Bookings' },
          { key: 'completedCount', label: 'Completed' },
          { key: 'percentage', label: 'Share (%)' },
          { key: 'revenue', label: 'Revenue (INR)' },
        ],
        result
      );
    }

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports/offers
 */
export async function getOffersReport(req, res, next) {
  try {
    const { from, to, barberId, format } = resolveReportParams(req);
    const cacheKey = `offers:${from}:${to}:${barberId}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const matchQuery = { date: { $gte: from, $lte: to } };
    if (barberId) matchQuery.barberId = barberId;

    const [bookings, offers] = await Promise.all([
      Booking.find(matchQuery).lean(),
      Offer.find().lean(),
    ]);

    const offerMap = new Map();
    for (const o of offers) {
      const oId = o.id || o._id.toString();
      offerMap.set(oId, {
        offerId: oId,
        title: o.title?.en || 'Promotional Offer',
        promoCode: o.promoCode || 'N/A',
        type: o.type,
        value: o.value,
        usesInPeriod: 0,
        totalDiscountGiven: 0,
        revenueGenerated: 0,
        totalLifetimeUses: o.usedCount || 0,
      });
    }

    for (const b of bookings) {
      if (b.appliedOfferId) {
        const oId = b.appliedOfferId.toString();
        if (!offerMap.has(oId)) {
          offerMap.set(oId, {
            offerId: oId,
            title: b.promoCode ? `Promo ${b.promoCode}` : 'Promotional Offer',
            promoCode: b.promoCode || 'N/A',
            type: 'percent',
            value: 0,
            usesInPeriod: 0,
            totalDiscountGiven: 0,
            revenueGenerated: 0,
            totalLifetimeUses: 1,
          });
        }
        const item = offerMap.get(oId);
        item.usesInPeriod++;
        item.totalDiscountGiven += b.discountAmount || 0;
        if (b.status === 'completed') {
          item.revenueGenerated += b.priceAtBooking || 0;
        }
      }
    }

    const result = Array.from(offerMap.values()).sort((a, b) => b.usesInPeriod - a.usesInPeriod);

    setCached(cacheKey, result);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `offers-performance-${from}-to-${to}`,
        [
          { key: 'title', label: 'Offer Title' },
          { key: 'promoCode', label: 'Promo Code' },
          { key: 'type', label: 'Discount Type' },
          { key: 'value', label: 'Value' },
          { key: 'usesInPeriod', label: 'Uses in Period' },
          { key: 'totalDiscountGiven', label: 'Discount Given (INR)' },
          { key: 'revenueGenerated', label: 'Revenue Generated (INR)' },
          { key: 'totalLifetimeUses', label: 'Total Lifetime Uses' },
        ],
        result
      );
    }

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}


/**
 * GET /api/admin/reports/wallet
 */
export async function getWalletReport(req, res, next) {
  try {
    const { from, to, format } = resolveReportParams(req);
    const cacheKey = `wallet:${from}:${to}`;

    if (format !== 'csv') {
      const cached = getCached(cacheKey);
      if (cached) return sendSuccess(res, cached);
    }

    const fromDate = new Date(`${from}T00:00:00+05:30`);
    const toDate = new Date(`${to}T23:59:59+05:30`);

    const [packages, memberships, loyaltyAccounts] = await Promise.all([
      CustomerPackage.find({
        purchasedAt: { $gte: fromDate, $lte: toDate },
      }).lean(),
      CustomerMembership.find({
        startsAt: { $gte: fromDate, $lte: toDate },
      }).lean(),
      LoyaltyAccount.find().lean(),
    ]);

    const metrics = calculateWalletMetrics({
      customerPackages: packages,
      customerMemberships: memberships,
      loyaltyAccounts,
    });

    setCached(cacheKey, metrics);

    if (format === 'csv') {
      return sendCSVResponse(
        res,
        `wallet-loyalty-${from}-to-${to}`,
        [
          { key: 'packageSalesCount', label: 'Package Sales Count' },
          { key: 'packageSalesRevenue', label: 'Package Revenue (INR)' },
          { key: 'membershipSalesCount', label: 'Membership Sales Count' },
          { key: 'membershipSalesRevenue', label: 'Membership Revenue (INR)' },
          { key: 'sessionRedemptionsCount', label: 'Sessions Redeemed' },
          { key: 'outstandingSessionLiability', label: 'Outstanding Session Liability (INR)' },
          { key: 'loyaltyRewardsGiven', label: 'Loyalty Rewards Given' },
        ],
        [metrics]
      );
    }

    return sendSuccess(res, metrics);
  } catch (err) {
    next(err);
  }
}
