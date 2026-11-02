import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from server/.env first, then fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const DEFAULT_ACCESS_SECRET = 'dev_jwt_access_secret_super_secure_32chars_min';
const DEFAULT_REFRESH_SECRET = 'dev_jwt_refresh_secret_super_secure_32chars_min';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/barbershop'),
  JWT_SECRET: z.string().default(DEFAULT_ACCESS_SECRET),
  JWT_ACCESS_SECRET: z.string().default(process.env.JWT_SECRET || DEFAULT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: z.string().default(DEFAULT_REFRESH_SECRET),
  ACCESS_COOKIE_NAME: z.string().default('modernmane_access_token'),
  REFRESH_COOKIE_NAME: z.string().default('modernmane_refresh_token'),
  COOKIE_NAME: z.string().default('modernmane_access_token'), // backward-compat alias
  ADMIN_EMAIL: z
    .string()
    .email()
    .default(process.env.OWNER_EMAIL || 'owner@barbershop.com'),
  ADMIN_PASSWORD: z
    .string()
    .min(10, 'ADMIN_PASSWORD must be at least 10 characters long')
    .default(process.env.OWNER_PASSWORD || 'Master@Barber2026'),
  OWNER_NAME: z.string().default('Barbershop Master'),
  OWNER_EMAIL: z.string().email().default('owner@barbershop.com'),
  OWNER_PASSWORD: z.string().default('Master@Barber2026'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_placeholder_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_placeholder_secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

// Production security guard: reject weak or default secrets
if (env.NODE_ENV === 'production') {
  const weakSecrets = [
    DEFAULT_ACCESS_SECRET,
    DEFAULT_REFRESH_SECRET,
    'secret',
    'password',
    'changeme',
    'admin123456',
  ];

  if (
    !env.JWT_ACCESS_SECRET ||
    env.JWT_ACCESS_SECRET.length < 32 ||
    weakSecrets.includes(env.JWT_ACCESS_SECRET)
  ) {
    throw new Error(
      'PRODUCTION STARTUP REJECTED: JWT_ACCESS_SECRET must be set, at least 32 characters, and not a default value.'
    );
  }

  if (
    !env.JWT_REFRESH_SECRET ||
    env.JWT_REFRESH_SECRET.length < 32 ||
    weakSecrets.includes(env.JWT_REFRESH_SECRET)
  ) {
    throw new Error(
      'PRODUCTION STARTUP REJECTED: JWT_REFRESH_SECRET must be set, at least 32 characters, and not a default value.'
    );
  }

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error(
      'PRODUCTION STARTUP REJECTED: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be distinct keys.'
    );
  }
}
