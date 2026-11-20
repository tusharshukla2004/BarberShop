import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { env, validateEnvOnStartup } from '../src/config/env.js';
import { Admin } from '../src/models/Admin.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { Booking } from '../src/models/Booking.js';

describe('Staff-Only Authentication & Security Hardening', () => {
  const samplePassword = 'StrongPassword123!';
  let passwordHash;

  beforeEach(async () => {
    vi.restoreAllMocks();
    passwordHash = await bcrypt.hash(samplePassword, 12);
  });

  describe('Step 1: Removed Customer Auth & Deprecated Routes', () => {
    it('POST /api/auth/register returns 404 NOT_FOUND', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Guest Customer',
        email: 'guest@example.com',
        password: 'Password123!',
      });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/customer/my-bookings returns 404 NOT_FOUND', async () => {
      const res = await request(app).get('/api/customer/my-bookings');
      expect(res.status).toBe(404);
    });

    it('GET /api/customer/my-account returns 404 NOT_FOUND', async () => {
      const res = await request(app).get('/api/customer/my-account');
      expect(res.status).toBe(404);
    });
  });

  describe('Step 2: Staff Login Hardening', () => {
    it('successfully logs in active staff, sets httpOnly cookies, and returns user without tokens in JSON', async () => {
      const mockAdmin = {
        _id: '60c72b2f9b1d8b2bad123450',
        id: '60c72b2f9b1d8b2bad123450',
        name: 'Owner Admin',
        email: 'owner@modernmane.com',
        role: 'owner',
        passwordHash,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        tokenVersion: 1,
        isLocked: vi.fn().mockReturnValue(false),
        comparePassword: vi.fn().mockResolvedValue(true),
        recordSuccessfulLogin: vi.fn().mockResolvedValue(true),
        recordFailedLogin: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);
      vi.spyOn(RefreshToken, 'create').mockResolvedValue({
        _id: 'token-1',
        tokenHash: 'hash',
        family: 'fam-1',
      });
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@modernmane.com',
          password: samplePassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Owner Admin');
      expect(res.body.data.user.role).toBe('owner');

      // Tokens MUST NOT be returned in JSON body
      expect(res.body.data.token).toBeUndefined();
      expect(res.body.data.accessToken).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();

      // Cookies must be set with httpOnly
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.includes('modernmane_access_token') && c.includes('HttpOnly'))).toBe(true);
      expect(cookies.some((c) => c.includes('modernmane_refresh_token') && c.includes('HttpOnly'))).toBe(true);
      expect(cookies.some((c) => c.includes('Path=/api/auth/refresh'))).toBe(true);
    });

    it('returns generic "Invalid email or password" on wrong password', async () => {
      const mockAdmin = {
        _id: '60c72b2f9b1d8b2bad123450',
        email: 'owner@modernmane.com',
        passwordHash,
        isActive: true,
        failedLoginAttempts: 0,
        isLocked: vi.fn().mockReturnValue(false),
        comparePassword: vi.fn().mockResolvedValue(false),
        recordFailedLogin: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@modernmane.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
      expect(mockAdmin.recordFailedLogin).toHaveBeenCalled();
    });

    it('returns identical generic error for unknown email (constant-time dummy check)', async () => {
      vi.spyOn(Admin, 'findOne').mockResolvedValue(null);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown-staff@modernmane.com',
          password: 'AnyPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('locks account and returns lockout error after 5 failed attempts', async () => {
      const lockDate = new Date(Date.now() + 15 * 60 * 1000);
      const mockAdmin = {
        _id: '60c72b2f9b1d8b2bad123450',
        email: 'owner@modernmane.com',
        passwordHash,
        isActive: true,
        failedLoginAttempts: 5,
        lockUntil: lockDate,
        isLocked: vi.fn().mockReturnValue(true),
        recordFailedLogin: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@modernmane.com',
          password: samplePassword,
        });

      expect(res.status).toBe(423);
      expect(res.body.error.message).toMatch(/Account is temporarily locked/i);
    });

    it('blocks inactive staff accounts with deactivated error', async () => {
      const mockAdmin = {
        _id: '60c72b2f9b1d8b2bad123450',
        email: 'inactive@modernmane.com',
        passwordHash,
        isActive: false,
        failedLoginAttempts: 0,
        isLocked: vi.fn().mockReturnValue(false),
        recordFailedLogin: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Admin, 'findOne').mockResolvedValue(mockAdmin);
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@modernmane.com',
          password: samplePassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/Account has been deactivated/i);
    });
  });

  describe('Step 3: Refresh Token Rotation & Replay Revocation', () => {
    it('revokes the entire token family when a used refresh token is replayed', async () => {
      const rawRefreshToken = 'mock_raw_refresh_token_string_40_chars_minimum!';

      // Stored token is already marked as revoked
      vi.spyOn(RefreshToken, 'findOne').mockResolvedValue({
        tokenHash: 'somehash',
        family: 'fam-replay-123',
        userId: '60c72b2f9b1d8b2bad123450',
        isRevoked: true, // TRIGGER REPLAY
      });

      const updateManySpy = vi.spyOn(RefreshToken, 'updateMany').mockResolvedValue({ modifiedCount: 2 });
      vi.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`modernmane_refresh_token=${rawRefreshToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_REPLAY_DETECTED');
      // Must revoke the whole family
      expect(updateManySpy).toHaveBeenCalledWith(
        { family: 'fam-replay-123' },
        { isRevoked: true }
      );
    });
  });

  describe('Step 4: CSRF & Access Scoping', () => {
    it('rejects state-changing staff request when CSRF header is missing', async () => {
      const accessSecret = env.JWT_ACCESS_SECRET || env.JWT_SECRET;
      const token = jwt.sign({ id: '60c72b2f9b1d8b2bad123450', role: 'owner', tokenVersion: 1 }, accessSecret);

      vi.spyOn(Admin, 'findById').mockResolvedValue({
        _id: '60c72b2f9b1d8b2bad123450',
        id: '60c72b2f9b1d8b2bad123450',
        role: 'owner',
        isActive: true,
        tokenVersion: 1,
      });

      const res = await request(app)
        .post('/api/admin/users')
        .set('Cookie', [`modernmane_access_token=${token}`])
        // Missing X-Requested-With header
        .send({ name: 'Barber Test', email: 'barber@test.com', role: 'barber', temporaryPassword: 'Pass123456!' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_DETECTED');
    });

    it('barber cannot access owner routes (/api/admin/users)', async () => {
      const accessSecret = env.JWT_ACCESS_SECRET || env.JWT_SECRET;
      const token = jwt.sign({ id: 'barber-1', role: 'barber', barberId: 'b-1', tokenVersion: 1 }, accessSecret);

      vi.spyOn(Admin, 'findById').mockResolvedValue({
        _id: 'barber-1',
        id: 'barber-1',
        role: 'barber',
        barberId: 'b-1',
        isActive: true,
        tokenVersion: 1,
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', [`modernmane_access_token=${token}`])
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('scopes barber queries to only their own bookings', async () => {
      const accessSecret = env.JWT_ACCESS_SECRET || env.JWT_SECRET;
      const token = jwt.sign({ id: 'barber-1', role: 'barber', barberId: 'target-barber-id', tokenVersion: 1 }, accessSecret);

      vi.spyOn(Admin, 'findById').mockResolvedValue({
        _id: 'barber-1',
        id: 'barber-1',
        role: 'barber',
        barberId: 'target-barber-id',
        isActive: true,
        tokenVersion: 1,
      });

      vi.spyOn(Booking, 'countDocuments').mockResolvedValue(0);

      const chainMock = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      };
      const findSpy = vi.spyOn(Booking, 'find').mockReturnValue(chainMock);

      const res = await request(app)
        .get('/api/admin/bookings?barberId=other-barber-id')
        .set('Cookie', [`modernmane_access_token=${token}`]);

      expect(res.status).toBe(200);
      // The query passed to Booking.find MUST have barberId overridden to 'target-barber-id'
      expect(findSpy.mock.calls[0][0].barberId).toBe('target-barber-id');
    });
  });

  describe('Step 5: Production Secret Safety', () => {
    it('validateEnvOnStartup throws in production if secrets are too short or default', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.JWT_ACCESS_SECRET;

      try {
        process.env.NODE_ENV = 'production';
        process.env.JWT_ACCESS_SECRET = 'short';
        expect(() => validateEnvOnStartup()).toThrow();
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.JWT_ACCESS_SECRET = originalSecret;
      }
    });
  });

  describe('Step 6: Account Lockout Logic & Expiration', () => {
    it('resets failedLoginAttempts to 1 and clears lockUntil when previous lock has expired', async () => {
      const adminDoc = new Admin({
        name: 'Test Admin',
        email: 'lockout-test@barbershop.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        role: 'owner',
        failedLoginAttempts: 5,
        lockUntil: new Date(Date.now() - 60 * 1000), // 1 minute in the past
      });
      adminDoc.save = vi.fn().mockResolvedValue(adminDoc);

      expect(adminDoc.isLocked()).toBe(false);

      await adminDoc.recordFailedLogin();

      expect(adminDoc.failedLoginAttempts).toBe(1);
      expect(adminDoc.lockUntil).toBeNull();
      expect(adminDoc.isLocked()).toBe(false);
      expect(adminDoc.save).toHaveBeenCalled();
    });

    it('locks account for 15 minutes when failedLoginAttempts reaches 5', async () => {
      const adminDoc = new Admin({
        name: 'Test Admin',
        email: 'lockout-test2@barbershop.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        role: 'owner',
        failedLoginAttempts: 4,
        lockUntil: null,
      });
      adminDoc.save = vi.fn().mockResolvedValue(adminDoc);

      await adminDoc.recordFailedLogin();

      expect(adminDoc.failedLoginAttempts).toBe(5);
      expect(adminDoc.lockUntil).toBeInstanceOf(Date);
      expect(adminDoc.lockUntil.getTime()).toBeGreaterThan(Date.now());
      expect(adminDoc.isLocked()).toBe(true);
    });

    it('resets failedLoginAttempts and lockUntil on successful login', async () => {
      const adminDoc = new Admin({
        name: 'Test Admin',
        email: 'lockout-test3@barbershop.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        role: 'owner',
        failedLoginAttempts: 3,
        lockUntil: null,
      });
      adminDoc.save = vi.fn().mockResolvedValue(adminDoc);

      await adminDoc.recordSuccessfulLogin();

      expect(adminDoc.failedLoginAttempts).toBe(0);
      expect(adminDoc.lockUntil).toBeNull();
      expect(adminDoc.lastLoginAt).toBeInstanceOf(Date);
    });
  });
});
