import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Package } from '../src/models/Package.js';
import { MembershipPlan } from '../src/models/MembershipPlan.js';
import { CustomerPackage } from '../src/models/CustomerPackage.js';
import { CustomerMembership } from '../src/models/CustomerMembership.js';
import { LoyaltyAccount } from '../src/models/LoyaltyAccount.js';
import { Customer } from '../src/models/Customer.js';
import { Settings } from '../src/models/Settings.js';

describe('Prompt 19: Packages, Memberships & Loyalty Test Suite', () => {
  const ownerToken = jwt.sign(
    { id: 'admin-1', role: 'owner', email: 'owner@barbershop.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const ownerCookie = `${env.COOKIE_NAME}=${ownerToken}`;

  const barberToken = jwt.sign(
    { id: 'barber-1', role: 'barber', email: 'barber@barbershop.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const barberCookie = `${env.COOKIE_NAME}=${barberToken}`;

  const mockCustomer = {
    _id: '60d5ec49f1b2c8b1f8e4e1a1',
    id: '60d5ec49f1b2c8b1f8e4e1a1',
    name: 'Sameer Verma',
    phone: '919999888877',
    email: 'sameer@example.com',
    notes: 'Private customer note: prefers hot towel',
    walletToken: 'mock-unguessable-token-1234567890',
    isDeleted: false,
    stats: { totalSpent: 1200, completedVisits: 3 },
    save: vi.fn().mockResolvedValue(true),
  };

  const mockPackage = {
    _id: '60d5ec49f1b2c8b1f8e4e1b1',
    id: '60d5ec49f1b2c8b1f8e4e1b1',
    name: { en: '5x Grooming Pack', hi: '5x ग्रूमिंग पैक' },
    sessions: 5,
    price: 3500,
    validityDays: 90,
    serviceIds: ['srv-1'],
    isActive: true,
  };

  const mockPlan = {
    _id: '60d5ec49f1b2c8b1f8e4e1c1',
    id: '60d5ec49f1b2c8b1f8e4e1c1',
    name: { en: 'VIP Monthly', hi: 'वीआईपी मंथली' },
    price: 999,
    durationDays: 30,
    benefits: [{ type: 'discount_percent', value: 20, serviceIds: [] }],
    isActive: true,
  };

  const validCustPkgId = '60d5ec49f1b2c8b1f8e4e1d1';
  const validBookingId = '60d5ec49f1b2c8b1f8e4e1e1';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('RBAC & Package Management', () => {
    it('allows owner to create a package', async () => {
      vi.spyOn(Package, 'create').mockResolvedValue({
        id: 'pkg-new',
        name: { en: 'Haircut Bundle', hi: 'हेयरकट बंडल' },
        price: 2000,
        sessions: 5,
        validityDays: 60,
      });

      const res = await request(app)
        .post('/api/admin/packages')
        .set('Cookie', [ownerCookie])
        .send({
          name: { en: 'Haircut Bundle', hi: 'हेयरकट बंडल' },
          price: 2000,
          sessions: 5,
          validityDays: 60,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(2000);
    });

    it('rejects barber role from creating or modifying packages (Owner only)', async () => {
      const res = await request(app)
        .post('/api/admin/packages')
        .set('Cookie', [barberCookie])
        .send({
          name: { en: 'Barber Pack', hi: 'पैक' },
          price: 1500,
          sessions: 3,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Selling Packages & Memberships', () => {
    it('sells a package to customer and logs payment method', async () => {
      vi.spyOn(Package, 'findById').mockResolvedValue(mockPackage);
      vi.spyOn(Customer, 'findById').mockResolvedValue({ ...mockCustomer });
      vi.spyOn(CustomerPackage, 'create').mockResolvedValue({
        id: validCustPkgId,
        customerId: mockCustomer.id,
        packageId: mockPackage.id,
        sessionsTotal: 5,
        sessionsUsed: 0,
        pricePaid: 3500,
        paymentMethod: 'upi',
        status: 'active',
      });

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/packages`)
        .set('Cookie', [ownerCookie])
        .send({
          packageId: mockPackage.id,
          paymentMethod: 'upi',
          amountPaid: 3500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe('upi');
    });

    it('sells a membership plan and sets endsAt accordingly', async () => {
      vi.spyOn(MembershipPlan, 'findById').mockResolvedValue(mockPlan);
      vi.spyOn(Customer, 'findById').mockResolvedValue({ ...mockCustomer });
      vi.spyOn(CustomerMembership, 'updateMany').mockResolvedValue({ modifiedCount: 0 });
      vi.spyOn(CustomerMembership, 'create').mockResolvedValue({
        id: '60d5ec49f1b2c8b1f8e4e1f1',
        customerId: mockCustomer.id,
        planId: mockPlan.id,
        pricePaid: 999,
        paymentMethod: 'card',
        status: 'active',
      });

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/memberships`)
        .set('Cookie', [ownerCookie])
        .send({
          planId: mockPlan.id,
          paymentMethod: 'card',
          amountPaid: 999,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('active');
    });
  });

  describe('Atomic Session Consumption & Concurrency Guard', () => {
    it('atomically consumes a session using findOneAndUpdate', async () => {
      const mockUpdated = {
        _id: validCustPkgId,
        sessionsTotal: 5,
        sessionsUsed: 3,
        status: 'active',
        save: vi.fn(),
      };

      vi.spyOn(CustomerPackage, 'findOneAndUpdate').mockResolvedValue(mockUpdated);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/consume-session`)
        .set('Cookie', [ownerCookie])
        .send({
          customerPackageId: validCustPkgId,
          bookingId: validBookingId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(CustomerPackage.findOneAndUpdate).toHaveBeenCalled();
    });

    it('rejects session consumption when all sessions are exhausted', async () => {
      vi.spyOn(CustomerPackage, 'findOneAndUpdate').mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/consume-session`)
        .set('Cookie', [ownerCookie])
        .send({
          customerPackageId: validCustPkgId,
        });

      expect(res.status).toBe(500);
      expect(res.body.error?.message || res.body.message).toMatch(/no available sessions/i);
    });
  });

  describe('Owner Reversals with Audit Log', () => {
    it('allows owner to reverse an consumed package session with reason', async () => {
      const mockPkgDoc = {
        _id: validCustPkgId,
        sessionsTotal: 5,
        sessionsUsed: 2,
        status: 'active',
        usageLog: [
          {
            bookingId: validBookingId,
            reversed: false,
          },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(CustomerPackage, 'findById').mockResolvedValue(mockPkgDoc);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/reverse-session`)
        .set('Cookie', [ownerCookie])
        .send({
          customerPackageId: validCustPkgId,
          bookingId: validBookingId,
          reason: 'Client did not receive service due to power cut',
        });

      expect(res.status).toBe(200);
      expect(mockPkgDoc.usageLog[0].reversed).toBe(true);
      expect(mockPkgDoc.usageLog[0].reversalReason).toBe(
        'Client did not receive service due to power cut'
      );
      expect(mockPkgDoc.sessionsUsed).toBe(1);
    });

    it('blocks non-owner from reversing a package session', async () => {
      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/reverse-session`)
        .set('Cookie', [barberCookie])
        .send({
          customerPackageId: validCustPkgId,
          reason: 'Attempted by barber',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Loyalty Stamps & Reward Redemption', () => {
    it('earns stamps and updates balance', async () => {
      const mockLoyaltyDoc = {
        customerId: mockCustomer.id,
        balance: 5,
        totalEarned: 5,
        history: [],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(LoyaltyAccount, 'findOne').mockResolvedValue(mockLoyaltyDoc);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/loyalty/adjust`)
        .set('Cookie', [ownerCookie])
        .send({
          type: 'earn',
          amount: 2,
          notes: 'Bonus visit stamp',
        });

      expect(res.status).toBe(200);
      expect(mockLoyaltyDoc.balance).toBe(7);
      expect(mockLoyaltyDoc.totalEarned).toBe(7);
    });

    it('redeems loyalty reward when threshold is met', async () => {
      const mockLoyaltyDoc = {
        customerId: mockCustomer.id,
        balance: 10,
        totalEarned: 10,
        totalRedeemed: 0,
        history: [],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(LoyaltyAccount, 'findOne').mockResolvedValue(mockLoyaltyDoc);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/loyalty/redeem`)
        .set('Cookie', [ownerCookie])
        .send({
          stampsToRedeem: 10,
          notes: 'Free Haircut Redeemed',
        });

      expect(res.status).toBe(200);
      expect(mockLoyaltyDoc.balance).toBe(0);
      expect(mockLoyaltyDoc.totalRedeemed).toBe(10);
    });

    it('rejects redemption when balance is below required threshold', async () => {
      const mockLoyaltyDoc = {
        customerId: mockCustomer.id,
        balance: 4, // needs 10
        totalEarned: 4,
        totalRedeemed: 0,
        history: [],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(LoyaltyAccount, 'findOne').mockResolvedValue(mockLoyaltyDoc);

      const res = await request(app)
        .post(`/api/admin/customers/${mockCustomer.id}/loyalty/redeem`)
        .set('Cookie', [ownerCookie])
        .send({
          stampsToRedeem: 10,
        });

      expect(res.status).toBe(500);
      expect(res.body.error?.message || res.body.message).toMatch(
        /insufficient loyalty balance/i
      );
    });
  });

  describe('Unguessable Wallet Token Security', () => {
    it('returns sanitized public customer wallet pass and excludes phone/private notes', async () => {
      vi.spyOn(Customer, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: mockCustomer.id,
          name: 'Sameer Verma',
          phone: '919999888877', // Private customer phone: Must NOT be in response!
          notes: 'Secret vip VIP client', // Must NOT be in response!
          walletToken: 'valid-token-xyz',
          isDeleted: false,
        }),
      });

      vi.spyOn(CustomerPackage, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });
      vi.spyOn(CustomerMembership, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });
      vi.spyOn(LoyaltyAccount, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ balance: 8 }),
      });
      vi.spyOn(Settings, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          loyaltySettings: { loyaltyEnabled: true, stampsForReward: 10 },
        }),
      });

      const res = await request(app).get('/api/wallet/valid-token-xyz');

      expect(res.status).toBe(200);
      expect(res.body.data.customerName).toBe('Sameer Verma');
      expect(res.body.data.loyalty.balance).toBe(8);

      // Security check: customer phone number and private customer notes must never leak
      expect(res.body.data.phone).toBeUndefined();
      expect(res.body.data.notes).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('919999888877');
      expect(JSON.stringify(res.body)).not.toContain('Secret vip');
    });

    it('returns 404 for an invalid or revoked wallet token', async () => {
      vi.spyOn(Customer, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app).get('/api/wallet/non-existent-token');
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('WALLET_NOT_FOUND');
    });
  });

  describe('Wallet Reports Integration', () => {
    it('calculates package sales, liability, and rewards metrics', async () => {
      vi.spyOn(CustomerPackage, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            pricePaid: 3000,
            sessionsTotal: 5,
            sessionsUsed: 2,
            status: 'active',
            expiresAt: new Date(Date.now() + 86400000),
          },
        ]),
      });

      vi.spyOn(CustomerMembership, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            pricePaid: 1500,
          },
        ]),
      });

      vi.spyOn(LoyaltyAccount, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            history: [{ type: 'redeem', reversed: false }],
          },
        ]),
      });

      const res = await request(app)
        .get('/api/admin/reports/wallet?from=2026-01-01&to=2026-12-31')
        .set('Cookie', [ownerCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.packageSalesRevenue).toBe(3000);
      expect(res.body.data.membershipSalesRevenue).toBe(1500);
      expect(res.body.data.sessionRedemptionsCount).toBe(2);
      expect(res.body.data.loyaltyRewardsGiven).toBe(1);
      // Outstanding liability: 3 remaining * (3000/5) = 1800
      expect(res.body.data.outstandingSessionLiability).toBe(1800);
    });
  });
});
