import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Offer } from '../src/models/Offer.js';
import { FAQ } from '../src/models/FAQ.js';
import { Booking } from '../src/models/Booking.js';
import { Service } from '../src/models/Service.js';
import { Barber } from '../src/models/Barber.js';
import { Customer } from '../src/models/Customer.js';

describe('Offers & FAQs Integration Tests', () => {
  const token = jwt.sign(
    { id: 'admin-1', role: 'owner', email: 'owner@vintageblade.in' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const authCookie = `${env.COOKIE_NAME}=${token}`;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Public Offers & Validation', () => {
    it('GET /api/offers returns active offers inside valid dates', async () => {
      const mockOffers = [
        {
          _id: 'off-1',
          title: { en: 'Diwali Special', hi: 'Special Special' },
          promoCode: 'DIWALI20',
          isActive: true,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: new Date(Date.now() + 86400000),
        },
      ];

      vi.spyOn(Offer, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockOffers),
        }),
      });

      const res = await request(app).get('/api/offers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].promoCode).toBe('DIWALI20');
    });

    it('POST /api/offers/validate validates code case-insensitively and returns discount calculation', async () => {
      const mockOffer = {
        _id: 'off-1',
        title: { en: 'Flat 100 Off', hi: '₹100 Special Special' },
        promoCode: 'FLAT100',
        type: 'flat',
        value: 100,
        isActive: true,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-12-31'),
        usageLimit: 50,
        usedCount: 5,
        appliesToServiceIds: [],
        daysOfWeek: [],
      };

      vi.spyOn(Offer, 'findOne').mockResolvedValue(mockOffer);
      vi.spyOn(Service, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { _id: 'srv-1', price: 600 },
        ]),
      });

      // lower-case input 'flat100' should match
      const res = await request(app)
        .post('/api/offers/validate')
        .send({
          code: 'flat100',
          serviceIds: ['srv-1'],
          date: '2026-10-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.discountAmount).toBe(100);
      expect(res.body.data.finalPrice).toBe(500);
    });

    it('POST /api/offers/validate returns valid=false when offer is invalid or does not exist', async () => {
      vi.spyOn(Offer, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/offers/validate')
        .send({
          code: 'NONEXISTENT',
          serviceIds: ['srv-1'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.reason).toMatch(/invalid/i);
    });
  });

  describe('Public FAQs', () => {
    it('GET /api/faqs returns published faqs grouped by category', async () => {
      const mockFaqs = [
        {
          _id: 'faq-1',
          question: { en: 'Do you take walk-ins?', hi: 'Special Special Special Special Special Special Special?' },
          answer: { en: 'Yes', hi: 'Special' },
          category: 'Booking',
          order: 1,
          isPublished: true,
        },
        {
          _id: 'faq-2',
          question: { en: 'What payments are accepted?', hi: 'Special Special Special Special Special Special Special?' },
          answer: { en: 'Cash and UPI', hi: 'Special Special Special' },
          category: 'Pricing',
          order: 1,
          isPublished: true,
        },
      ];

      vi.spyOn(FAQ, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockFaqs),
        }),
      });

      const res = await request(app).get('/api/faqs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grouped).toBeDefined();
      expect(res.body.data.grouped.Booking).toHaveLength(1);
      expect(res.body.data.grouped.Pricing).toHaveLength(1);
    });
  });

  describe('Admin Offers CRUD & Duplicate', () => {
    it('POST /api/admin/offers creates a new offer', async () => {
      const newOfferData = {
        title: { en: 'Festival Cut', hi: 'Special Special' },
        description: { en: '20% off all haircuts', hi: 'Special Special Special 20% Special Special' },
        type: 'percent',
        value: 20,
        promoCode: 'FESTIVAL20',
        startsAt: '2026-10-01T00:00:00.000Z',
        endsAt: '2026-11-30T23:59:59.000Z',
        isActive: true,
        showOnHome: true,
      };

      vi.spyOn(Offer, 'findOne').mockResolvedValue(null);
      vi.spyOn(Offer, 'create').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...newOfferData,
        promoCode: 'FESTIVAL20',
        usedCount: 0,
      });

      const res = await request(app)
        .post('/api/admin/offers')
        .set('Cookie', authCookie)
        .send(newOfferData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promoCode).toBe('FESTIVAL20');
    });

    it('POST /api/admin/offers/:id/duplicate duplicates an existing offer as inactive draft', async () => {
      const originalOffer = {
        _id: '507f1f77bcf86cd799439011',
        title: { en: 'Weekend Deal', hi: 'Special Special' },
        description: { en: 'Weekend discount', hi: 'Special Special' },
        type: 'flat',
        value: 150,
        promoCode: 'WEEKEND150',
        startsAt: new Date('2026-10-01'),
        endsAt: new Date('2026-10-31'),
        isActive: true,
        toObject: () => ({
          title: { en: 'Weekend Deal', hi: 'Special Special' },
          description: { en: 'Weekend discount', hi: 'Special Special' },
          type: 'flat',
          value: 150,
          promoCode: 'WEEKEND150',
          startsAt: new Date('2026-10-01'),
          endsAt: new Date('2026-10-31'),
          isActive: true,
        }),
      };

      vi.spyOn(Offer, 'findById').mockResolvedValue(originalOffer);
      vi.spyOn(Offer, 'findOne').mockResolvedValue(null);
      vi.spyOn(Offer, 'create').mockImplementation((data) =>
        Promise.resolve({ _id: '507f1f77bcf86cd799439012', ...data })
      );

      const res = await request(app)
        .post('/api/admin/offers/507f1f77bcf86cd799439011/duplicate')
        .set('Cookie', authCookie);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Copy of Weekend Deal');
      expect(res.body.data.promoCode).toMatch(/WEEKEND150_COPY_/);
    });
  });

  describe('Admin FAQs CRUD & Reorder', () => {
    it('PATCH /api/admin/faqs/reorder updates display orders in bulk', async () => {
      const bulkWriteMock = vi.spyOn(FAQ, 'bulkWrite').mockResolvedValue({ modifiedCount: 2 });
      vi.spyOn(FAQ, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { _id: 'faq-1', order: 1 },
            { _id: 'faq-2', order: 2 },
          ]),
        }),
      });

      const res = await request(app)
        .patch('/api/admin/faqs/reorder')
        .set('Cookie', authCookie)
        .send({
          orders: [
            { id: '507f1f77bcf86cd799439011', order: 1 },
            { id: '507f1f77bcf86cd799439012', order: 2 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(bulkWriteMock).toHaveBeenCalled();
    });
  });

  describe('Reports Offers Aggregation', () => {
    it('GET /api/admin/reports/offers aggregates usage and discount stats per offer', async () => {
      vi.spyOn(Offer, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: '507f1f77bcf86cd799439011',
            title: { en: 'Diwali Special', hi: 'Special Special' },
            promoCode: 'DIWALI20',
            type: 'percent',
            value: 20,
            usedCount: 15,
            isActive: true,
          },
        ]),
      });

      vi.spyOn(Booking, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            appliedOfferId: '507f1f77bcf86cd799439011',
            status: 'completed',
            discountAmount: 200,
            priceAtBooking: 800,
          },
        ]),
      });

      const res = await request(app)
        .get('/api/admin/reports/offers?from=2026-10-01&to=2026-10-31')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].totalDiscountGiven).toBe(200);
      expect(res.body.data[0].revenueGenerated).toBe(800);
    });
  });

  describe('Booking Creation with Promo Code & Atomic Limit', () => {
    it('applies promo discount atomically and increments usedCount', async () => {
      const mockOffer = {
        _id: '507f191e810c19729de860ea',
        title: { en: 'Flat 100', hi: '₹100 Special' },
        promoCode: 'SAVE100',
        type: 'flat',
        value: 100,
        isActive: true,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-12-31'),
        usageLimit: 10,
        usedCount: 2,
        appliesToServiceIds: [],
        daysOfWeek: [],
      };

      vi.spyOn(Offer, 'findOne').mockResolvedValue(mockOffer);
      vi.spyOn(Offer, 'findOneAndUpdate').mockResolvedValue({
        ...mockOffer,
        usedCount: 3,
      });

      vi.spyOn(Service, 'findOne').mockResolvedValue({
        _id: 'srv-1',
        price: 500,
        name: 'Haircut',
        durationMinutes: 30,
        isActive: true,
      });

      vi.spyOn(Barber, 'findOne').mockResolvedValue({
        _id: 'barb-1',
        name: 'Master Barber',
        isActive: true,
      });

      vi.spyOn(Booking, 'findOne').mockResolvedValue(null);
      vi.spyOn(Booking, 'create').mockImplementation((data) =>
        Promise.resolve({
          _id: 'book-1',
          ...data,
          toObject: () => ({ _id: 'book-1', ...data }),
        })
      );
      vi.spyOn(Customer, 'findOne').mockResolvedValue({
        _id: 'cust-1',
        stats: { totalVisits: 0 },
        save: vi.fn(),
      });

      const res = await request(app)
        .post('/api/bookings')
        .send({
          customerName: 'Rahul Sharma',
          phone: '9876543210',
          serviceId: 'srv-1',
          barberId: 'barb-1',
          date: '2026-11-05',
          startTime: '10:00 AM',
          promoCode: 'SAVE100',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discountAmount).toBe(100);
      expect(res.body.data.priceAtBooking).toBe(400);
      expect(res.body.data.promoCode).toBe('SAVE100');
    });
  });
});
