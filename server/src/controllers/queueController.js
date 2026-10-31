import mongoose from 'mongoose';
import { QueueEntry } from '../models/QueueEntry.js';
import { Booking } from '../models/Booking.js';
import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { Settings } from '../models/Settings.js';
import { calculateQueueWaitTimes } from '../utils/queue.js';
import { getKolkataCurrentDateAndMinutes, minutesToTimeStr } from '../utils/slots.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  findOrCreateCustomer,
  recalculateCustomerStats,
} from '../services/customerService.js';

/**
 * Finds a document by either custom id string or MongoDB ObjectId
 */
async function findByIdOrCustom(model, id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await model.findById(id);
    if (doc) return doc;
  }
  return model.findOne({ id });
}

/**
 * Helper to get queue calculation context
 */
async function getQueueCalculationContext(dateStr) {
  const [barbers, services, settings, bookings, queueEntries] = await Promise.all([
    Barber.find({ isActive: true }).lean(),
    Service.find({ isActive: true }).lean(),
    Settings.findOne().lean(),
    Booking.find({
      date: dateStr,
      status: { $in: ['confirmed', 'pending'] },
    }).lean(),
    QueueEntry.find({
      date: dateStr,
      status: { $in: ['waiting', 'called', 'in_service'] },
    })
      .sort({ tokenNumber: 1 })
      .lean(),
  ]);

  const resolvedSettings = settings || {
    queueSettings: {
      walkInsEnabled: true,
      maxQueueLength: 20,
      publicQueueEnabled: true,
      bufferMinutes: 5,
      stopAcceptingBeforeClosingMinutes: 45,
    },
    holidays: [],
  };

  return {
    barbers,
    services,
    settings: resolvedSettings,
    bookings,
    queueEntries,
  };
}

/**
 * GET /api/admin/queue?date=YYYY-MM-DD
 * Get all queue entries for a given date along with wait calculations
 */
export async function getAdminQueue(req, res, next) {
  try {
    const { dateStr: todayKolkata } = getKolkataCurrentDateAndMinutes();
    const targetDate = req.query.date || todayKolkata;

    const { barbers, services, settings, bookings } =
      await getQueueCalculationContext(targetDate);

    // Fetch all entries for this date
    const allEntries = await QueueEntry.find({ date: targetDate })
      .sort({ tokenNumber: 1 })
      .lean();

    // Calculate wait times for waiting entries and next walk-in prospect
    const calculation = calculateQueueWaitTimes({
      barbers,
      services,
      queueEntries: allEntries,
      confirmedBookings: bookings,
      settings,
      dateStr: targetDate,
    });

    // Merge calculated dynamic estimates into the entries
    const enrichedEntries = allEntries.map((entry) => {
      const entryId = entry._id?.toString() || entry.id;
      const est = calculation.entryEstimations?.get
        ? calculation.entryEstimations.get(entryId)
        : null;
      if (est) {
        return {
          ...entry,
          estimatedWaitMinutes: est.estimatedWaitMinutes,
          estimatedStart: est.estimatedStart || est.estimatedStartTime,
          assignedBarberId: est.assignedBarberId,
          assignedBarberName: est.assignedBarberName,
          canBeServedBeforeClosing: est.canBeServedBeforeClosing,
        };
      }
      return entry;
    });

    return sendSuccess(res, {
      date: targetDate,
      workingBarbersCount: calculation.workingBarbersCount,
      totalWaiting: calculation.totalWaiting,
      inServiceCount: calculation.inServiceCount,
      prospectEstimation: calculation.prospectEstimation,
      entries: enrichedEntries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/queue
 * Add a walk-in to the queue
 */
export async function addWalkIn(req, res, next) {
  try {
    const { customerName, phone, serviceId, barberId, notes, source } = req.body;
    const { dateStr: todayKolkata } = getKolkataCurrentDateAndMinutes();

    const { barbers, services, settings, bookings, queueEntries } =
      await getQueueCalculationContext(todayKolkata);

    const qSettings = settings.queueSettings || {
      walkInsEnabled: true,
      maxQueueLength: 20,
    };

    if (qSettings.walkInsEnabled === false) {
      return sendError(res, 400, 'Walk-ins are currently disabled', 'WALK_INS_DISABLED');
    }

    // Check max queue length
    const activeCount = queueEntries.length;
    if (activeCount >= (qSettings.maxQueueLength || 20)) {
      return sendError(
        res,
        400,
        `Queue is currently full (maximum ${qSettings.maxQueueLength} customers)`,
        'QUEUE_FULL'
      );
    }

    // Determine next sequential token number for today (resets daily)
    const latestTokenEntry = await QueueEntry.findOne({ date: todayKolkata })
      .sort({ tokenNumber: -1 })
      .select('tokenNumber')
      .lean();

    const nextTokenNumber = (latestTokenEntry?.tokenNumber || 0) + 1;

    // Verify service
    const service = await findByIdOrCustom(Service, serviceId);
    if (!service) {
      return sendError(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    // Initial wait calculation
    const initialCalc = calculateQueueWaitTimes({
      barbers,
      services,
      queueEntries,
      confirmedBookings: bookings,
      settings,
      dateStr: todayKolkata,
      targetDuration: service.durationMinutes || 30,
      targetBarberId: barberId || null,
    });

    const newEntry = await QueueEntry.create({
      tokenNumber: nextTokenNumber,
      customerName: customerName.trim(),
      phone: phone ? phone.trim() : '',
      serviceId: service.id || service._id.toString(),
      barberId: barberId || '',
      status: 'waiting',
      joinedAt: new Date(),
      estimatedStart: initialCalc.prospectEstimation?.estimatedStartTime || '',
      estimatedWaitMinutes: initialCalc.prospectEstimation?.estimatedWaitMinutes || 0,
      source: source || 'admin',
      notes: notes || '',
      date: todayKolkata,
    });

    return sendSuccess(res, newEntry, 201, 'Walk-in added to queue successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/queue/:id
 * Update status, reassign barber, or reorder
 */
export async function updateQueueStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, barberId, notes, reorder } = req.body;

    const entry = await findByIdOrCustom(QueueEntry, id);
    if (!entry) {
      return sendError(res, 404, 'Queue entry not found', 'QUEUE_ENTRY_NOT_FOUND');
    }

    if (barberId !== undefined) {
      entry.barberId = barberId;
    }
    if (notes !== undefined) {
      entry.notes = notes;
    }

    if (status && status !== entry.status) {
      entry.status = status;

      if (status === 'called') {
        entry.calledAt = new Date();
      } else if (status === 'in_service') {
        entry.startedAt = new Date();
      } else if (status === 'done') {
        entry.completedAt = new Date();

        // Requirement 5: Completing a queue entry creates a completed booking record of type walk_in
        // Link to customer by phone when provided, reusing customerService findOrCreateCustomer
        try {
          const service = await findByIdOrCustom(Service, entry.serviceId);
          const price = service?.price || 0;
          const duration = service?.durationMinutes || 30;

          let customer = null;
          if (entry.phone && entry.phone.trim().length >= 10) {
            customer = await findOrCreateCustomer({
              phone: entry.phone,
              name: entry.customerName,
              preferredServiceId: entry.serviceId,
              preferredBarberId: entry.barberId || null,
            });
          }

          const { currentTimeMinutes } = getKolkataCurrentDateAndMinutes();
          const startMin = Math.max(0, currentTimeMinutes - duration);
          const startTimeStr = minutesToTimeStr(startMin);
          const endTimeStr = minutesToTimeStr(currentTimeMinutes);

          const booking = await Booking.create({
            customerName: entry.customerName,
            phone: entry.phone || '0000000000',
            email: '',
            customerId: customer ? customer._id : null,
            priceAtBooking: price,
            serviceId: entry.serviceId,
            barberId: entry.barberId || '',
            date: entry.date,
            startTime: startTimeStr,
            endTime: endTimeStr,
            status: 'completed',
            source: 'walk_in',
            notes: entry.notes || 'Walk-in Queue',
            whatsappConsent: false,
          });

          entry.bookingId = booking._id;

          if (customer) {
            await recalculateCustomerStats(customer._id);
          }
        } catch (bookingErr) {
          console.error('Error creating completed booking from queue entry:', bookingErr);
        }
      }
    }

    // Reorder support if requested
    if (reorder) {
      const waitingList = await QueueEntry.find({
        date: entry.date,
        status: 'waiting',
      }).sort({ tokenNumber: 1 });

      const currentIndex = waitingList.findIndex(
        (e) => e._id.toString() === entry._id.toString() || e.id === entry.id
      );

      if (currentIndex !== -1) {
        let swapTargetIndex = -1;
        if (reorder === 'up' && currentIndex > 0) {
          swapTargetIndex = currentIndex - 1;
        } else if (reorder === 'down' && currentIndex < waitingList.length - 1) {
          swapTargetIndex = currentIndex + 1;
        }

        if (swapTargetIndex !== -1) {
          const targetItem = waitingList[swapTargetIndex];
          const tempToken = entry.tokenNumber;
          entry.tokenNumber = targetItem.tokenNumber;
          targetItem.tokenNumber = tempToken;
          await targetItem.save();
        }
      }
    }

    await entry.save();
    return sendSuccess(res, entry, 200, 'Queue entry updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/queue/status
 * Public endpoint: returns strictly anonymous queue status with NO PII (no names, phones)
 */
export async function getPublicQueueStatus(req, res, next) {
  try {
    const { dateStr: todayKolkata } = getKolkataCurrentDateAndMinutes();
    const { barbers, services, settings, bookings, queueEntries } =
      await getQueueCalculationContext(todayKolkata);

    const qSettings = settings.queueSettings || {
      walkInsEnabled: true,
      maxQueueLength: 20,
      publicQueueEnabled: true,
    };

    const calculation = calculateQueueWaitTimes({
      barbers,
      services,
      queueEntries,
      confirmedBookings: bookings,
      settings,
      dateStr: todayKolkata,
    });

    const isShopOpen = calculation.workingBarbersCount > 0;
    const isOpenForWalkIns =
      qSettings.walkInsEnabled !== false &&
      isShopOpen &&
      calculation.prospectEstimation.canBeServedBeforeClosing;

    return sendSuccess(res, {
      isOpen: isOpenForWalkIns,
      walkInsEnabled: qSettings.walkInsEnabled !== false,
      publicQueueEnabled: qSettings.publicQueueEnabled !== false,
      peopleWaiting: calculation.totalWaiting,
      inServiceCount: calculation.inServiceCount,
      estimatedWaitMinutes: calculation.prospectEstimation.estimatedWaitMinutes || 0,
      nextAvailableTime: calculation.prospectEstimation.estimatedStartTime || null,
      canBeServedBeforeClosing: calculation.prospectEstimation.canBeServedBeforeClosing,
      reason: calculation.prospectEstimation.reason,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/queue/join
 * Public endpoint for joining the walk-in queue online when enabled
 */
export async function joinPublicQueue(req, res, next) {
  try {
    const { customerName, phone, serviceId, barberId, notes, hp_field } = req.body;

    // Honeypot check
    if (hp_field) {
      return sendError(res, 400, 'Invalid submission', 'SPAM_DETECTED');
    }

    const { dateStr: todayKolkata } = getKolkataCurrentDateAndMinutes();
    const { barbers, services, settings, bookings, queueEntries } =
      await getQueueCalculationContext(todayKolkata);

    const qSettings = settings.queueSettings || {
      walkInsEnabled: true,
      publicQueueEnabled: true,
      maxQueueLength: 20,
    };

    if (qSettings.walkInsEnabled === false || qSettings.publicQueueEnabled === false) {
      return sendError(
        res,
        400,
        'Online walk-in registration is currently disabled',
        'ONLINE_QUEUE_DISABLED'
      );
    }

    if (queueEntries.length >= (qSettings.maxQueueLength || 20)) {
      return sendError(res, 400, 'The walk-in queue is currently full', 'QUEUE_FULL');
    }

    const service = await findByIdOrCustom(Service, serviceId);
    if (!service) {
      return sendError(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    // Sequential token
    const latestTokenEntry = await QueueEntry.findOne({ date: todayKolkata })
      .sort({ tokenNumber: -1 })
      .select('tokenNumber')
      .lean();

    const nextTokenNumber = (latestTokenEntry?.tokenNumber || 0) + 1;

    // Wait calculation
    const calc = calculateQueueWaitTimes({
      barbers,
      services,
      queueEntries,
      confirmedBookings: bookings,
      settings,
      dateStr: todayKolkata,
      targetDuration: service.durationMinutes || 30,
      targetBarberId: barberId || null,
    });

    if (!calc.prospectEstimation.canBeServedBeforeClosing) {
      return sendError(
        res,
        400,
        calc.prospectEstimation.reason || 'Cannot be served before closing today',
        'CANNOT_SERVE_BEFORE_CLOSING'
      );
    }

    const newEntry = await QueueEntry.create({
      tokenNumber: nextTokenNumber,
      customerName: customerName.trim(),
      phone: phone ? phone.trim() : '',
      serviceId: service.id || service._id.toString(),
      barberId: barberId || '',
      status: 'waiting',
      joinedAt: new Date(),
      estimatedStart: calc.prospectEstimation.estimatedStartTime || '',
      estimatedWaitMinutes: calc.prospectEstimation.estimatedWaitMinutes || 0,
      source: 'public',
      notes: notes || '',
      date: todayKolkata,
    });

    return sendSuccess(
      res,
      {
        id: newEntry.id,
        tokenNumber: newEntry.tokenNumber,
        customerName: newEntry.customerName,
        estimatedWaitMinutes: newEntry.estimatedWaitMinutes,
        estimatedStart: newEntry.estimatedStart,
        status: newEntry.status,
      },
      201,
      'You have joined the live queue'
    );
  } catch (error) {
    next(error);
  }
}
