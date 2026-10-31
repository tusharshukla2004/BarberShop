import mongoose from 'mongoose';
import { Package } from '../models/Package.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { CustomerPackage } from '../models/CustomerPackage.js';
import { CustomerMembership } from '../models/CustomerMembership.js';
import { LoyaltyAccount } from '../models/LoyaltyAccount.js';
import { Customer } from '../models/Customer.js';
import { Settings } from '../models/Settings.js';
import { sendSuccess, sendError } from '../utils/response.js';
import * as walletService from '../services/walletService.js';
import * as walletExpiryService from '../services/walletExpiryService.js';

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

export async function getPublicPackages(req, res, next) {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 }).lean();
    return sendSuccess(res, packages);
  } catch (error) {
    return next(error);
  }
}

export async function getPublicMemberships(req, res, next) {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ price: 1 }).lean();
    return sendSuccess(res, plans);
  } catch (error) {
    return next(error);
  }
}

export async function getPublicWalletByToken(req, res, next) {
  try {
    const { token } = req.params;
    const wallet = await walletService.getPublicWalletData(token);

    if (!wallet) {
      return sendError(
        res,
        404,
        'Wallet pass not found or link has expired/been revoked.',
        'WALLET_NOT_FOUND'
      );
    }

    return sendSuccess(res, wallet);
  } catch (error) {
    return next(error);
  }
}

// ==========================================
// ADMIN PACKAGES & PLANS CRUD
// ==========================================

export async function listPackages(req, res, next) {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, packages);
  } catch (error) {
    return next(error);
  }
}

export async function createPackage(req, res, next) {
  try {
    const pkg = await Package.create(req.body);
    return sendSuccess(res, pkg, 201, 'Package created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updatePackage(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) {
      return sendError(res, 404, 'Package not found', 'NOT_FOUND');
    }
    return sendSuccess(res, pkg, 200, 'Package updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deletePackage(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) {
      return sendError(res, 404, 'Package not found', 'NOT_FOUND');
    }
    return sendSuccess(res, null, 200, 'Package deleted successfully');
  } catch (error) {
    return next(error);
  }
}

export async function listMembershipPlans(req, res, next) {
  try {
    const plans = await MembershipPlan.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, plans);
  } catch (error) {
    return next(error);
  }
}

export async function createMembershipPlan(req, res, next) {
  try {
    const plan = await MembershipPlan.create(req.body);
    return sendSuccess(res, plan, 201, 'Membership plan created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateMembershipPlan(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return sendError(res, 404, 'Membership plan not found', 'NOT_FOUND');
    }
    return sendSuccess(res, plan, 200, 'Membership plan updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteMembershipPlan(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndDelete(id);
    if (!plan) {
      return sendError(res, 404, 'Membership plan not found', 'NOT_FOUND');
    }
    return sendSuccess(res, null, 200, 'Membership plan deleted successfully');
  } catch (error) {
    return next(error);
  }
}

// ==========================================
// CUSTOMER WALLET ACTIONS
// ==========================================

export async function getCustomerWallet(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).lean();
    if (!customer || customer.isDeleted) {
      return sendError(res, 404, 'Customer not found', 'NOT_FOUND');
    }

    const [packages, activeMembership, loyaltyAccount, settings] = await Promise.all([
      CustomerPackage.find({ customerId: id }).sort({ createdAt: -1 }).lean(),
      CustomerMembership.findOne({ customerId: id, status: 'active' }).lean(),
      walletService.getOrCreateLoyaltyAccount(id),
      Settings.findOne().lean(),
    ]);

    const loyaltySettings = settings?.loyaltySettings || {};

    return sendSuccess(res, {
      walletToken: customer.walletToken,
      birthday: customer.birthday,
      packages: packages.map((p) => ({
        ...p,
        id: p._id.toString(),
        sessionsRemaining: Math.max(0, (p.sessionsTotal || 0) - (p.sessionsUsed || 0)),
      })),
      membership: activeMembership
        ? {
            ...activeMembership,
            id: activeMembership._id.toString(),
          }
        : null,
      loyalty: {
        balance: loyaltyAccount.balance,
        totalEarned: loyaltyAccount.totalEarned,
        totalRedeemed: loyaltyAccount.totalRedeemed,
        history: loyaltyAccount.history,
        stampsForReward: loyaltySettings.stampsForReward || 10,
        isRewardReady: (loyaltyAccount.balance || 0) >= (loyaltySettings.stampsForReward || 10),
        rewardDefinition: loyaltySettings.rewardDefinition || {
          type: 'free_service',
          value: 0,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function sellPackageToCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { packageId, paymentMethod, amountPaid } = req.body;

    const customerPackage = await walletService.sellPackage({
      customerId: id,
      packageId,
      paymentMethod,
      amountPaid,
    });

    return sendSuccess(res, customerPackage, 201, 'Package sold to customer successfully');
  } catch (error) {
    return next(error);
  }
}

export async function sellMembershipToCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { planId, paymentMethod, amountPaid } = req.body;

    const customerMembership = await walletService.sellMembership({
      customerId: id,
      planId,
      paymentMethod,
      amountPaid,
    });

    return sendSuccess(res, customerMembership, 201, 'Membership sold to customer successfully');
  } catch (error) {
    return next(error);
  }
}

export async function consumePackageSession(req, res, next) {
  try {
    const { id } = req.params;
    const { customerPackageId, bookingId, serviceId } = req.body;

    const updated = await walletService.consumePackageSession({
      customerId: id,
      customerPackageId,
      bookingId,
      serviceId,
      actor: req.user?.email || 'staff',
    });

    return sendSuccess(res, updated, 200, 'Package session consumed successfully');
  } catch (error) {
    return next(error);
  }
}

export async function reversePackageSession(req, res, next) {
  try {
    const { customerPackageId, bookingId, reason } = req.body;

    const updated = await walletService.reversePackageSession({
      customerPackageId,
      bookingId,
      reason,
      actor: req.user?.email || 'owner',
    });

    return sendSuccess(res, updated, 200, 'Package session consumption reversed');
  } catch (error) {
    return next(error);
  }
}

export async function reverseMembershipBenefit(req, res, next) {
  try {
    const { customerMembershipId, bookingId, reason } = req.body;

    const updated = await walletService.reverseMembershipBenefit({
      customerMembershipId,
      bookingId,
      reason,
      actor: req.user?.email || 'owner',
    });

    return sendSuccess(res, updated, 200, 'Membership benefit reversed');
  } catch (error) {
    return next(error);
  }
}

export async function adjustLoyaltyStamps(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, notes, bookingId } = req.body;

    const account = await walletService.addLoyaltyStamps({
      customerId: id,
      bookingId,
      stampsCount: amount,
      notes,
      actor: req.user?.email || 'staff',
    });

    return sendSuccess(res, account, 200, 'Loyalty balance updated');
  } catch (error) {
    return next(error);
  }
}

export async function redeemLoyaltyReward(req, res, next) {
  try {
    const { id } = req.params;
    const { stampsToRedeem, bookingId, notes } = req.body;

    const account = await walletService.redeemLoyaltyReward({
      customerId: id,
      bookingId,
      stampsToRedeem,
      notes,
      actor: req.user?.email || 'staff',
    });

    return sendSuccess(res, account, 200, 'Loyalty reward redeemed');
  } catch (error) {
    return next(error);
  }
}

export async function reverseLoyaltyHistory(req, res, next) {
  try {
    const { id } = req.params;
    const { historyId, reason } = req.body;

    const account = await walletService.reverseLoyaltyEntry({
      customerId: id,
      historyId,
      reason,
      actor: req.user?.email || 'owner',
    });

    return sendSuccess(res, account, 200, 'Loyalty entry reversed');
  } catch (error) {
    return next(error);
  }
}

export async function generateWalletToken(req, res, next) {
  try {
    const { id } = req.params;
    const token = await walletService.generateWalletToken(id);
    return sendSuccess(res, { token }, 200, 'Wallet token generated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function revokeWalletToken(req, res, next) {
  try {
    const { id } = req.params;
    await walletService.revokeWalletToken(id);
    return sendSuccess(res, null, 200, 'Wallet token revoked');
  } catch (error) {
    return next(error);
  }
}

export async function getExpiringWalletItemsList(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await walletExpiryService.getExpiringWalletItems(days);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

// ==========================================
// REBOOKING NUDGES & UPCOMING BIRTHDAYS
// ==========================================

export async function getDueForVisitCustomers(req, res, next) {
  try {
    const settings = await Settings.findOne().lean();
    const defaultDays = settings?.rebookingSettings?.rebookingNudgeDays || 28;
    const days = parseInt(req.query.days, 10) || defaultDays;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const customers = await Customer.find({
      isDeleted: false,
      isFlagged: false,
      'stats.completedVisits': { $gt: 0 },
      'stats.lastVisitAt': { $ne: null, $lt: cutoffDate },
    })
      .sort({ 'stats.lastVisitAt': 1 })
      .limit(50)
      .lean();

    const formatted = customers.map((c) => {
      const lastVisit = new Date(c.stats.lastVisitAt);
      const diffDays = Math.floor((Date.now() - lastVisit.getTime()) / (24 * 60 * 60 * 1000));
      const weeksAgo = Math.floor(diffDays / 7);
      const lastVisitAgo =
        weeksAgo > 1 ? `${weeksAgo} weeks ago` : `${diffDays} days ago`;

      return {
        ...c,
        id: c._id.toString(),
        lastVisitAgo,
        daysSinceVisit: diffDays,
      };
    });

    return sendSuccess(res, {
      thresholdDays: days,
      customers: formatted,
      total: formatted.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUpcomingBirthdays(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const currentYear = new Date().getFullYear();

    // Find customers with birthday set and whatsappConsent
    const customers = await Customer.find({
      isDeleted: false,
      whatsappConsent: true,
      birthday: { $ne: null },
    }).lean();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const upcoming = [];

    customers.forEach((c) => {
      if (!c.birthday) return;
      const bday = new Date(c.birthday);
      const bMonth = bday.getMonth();
      const bDay = bday.getDate();

      // Check if within next `days` days
      const thisYearBday = new Date(currentYear, bMonth, bDay);
      const diffMs = thisYearBday.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

      if (diffDays >= 0 && diffDays <= days) {
        upcoming.push({
          ...c,
          id: c._id.toString(),
          birthdayFormatted: bday.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          }),
          daysUntilBirthday: diffDays,
          alreadySentThisYear: c.birthdayGreetingSentYear === currentYear,
        });
      }
    });

    upcoming.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

    return sendSuccess(res, {
      upcomingBirthdays: upcoming,
      total: upcoming.length,
    });
  } catch (error) {
    return next(error);
  }
}

