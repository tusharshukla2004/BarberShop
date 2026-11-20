import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { Admin } from './models/Admin.js';
import { startSlotHoldCleaner, stopSlotHoldCleaner } from './services/slotHoldService.js';
import { startWalletExpiryCleaner, stopWalletExpiryCleaner } from './services/walletExpiryService.js';
import { startBlogScheduler, stopBlogScheduler } from './services/blogScheduler.js';

let server;

async function ensureInitialAdmin() {
  try {
    const adminEmail = (env.ADMIN_EMAIL || env.OWNER_EMAIL || 'owner@barbershop.com').toLowerCase();
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminPassword = env.ADMIN_PASSWORD || env.OWNER_PASSWORD || 'Admin@123456';
      const passwordHash = await Admin.hashPassword(adminPassword);
      await Admin.create({
        name: env.OWNER_NAME || 'Owner Admin',
        email: adminEmail,
        passwordHash,
        role: 'owner',
        isActive: true,
        mustChangePassword: false,
      });
      // eslint-disable-next-line no-console
      console.log(`👤 Initial Owner Admin auto-provisioned: ${adminEmail}`);
    } else if (process.env.RESET_OWNER_ON_BOOT === 'true') {
      const adminPassword = env.ADMIN_PASSWORD || env.OWNER_PASSWORD || 'Admin@123456';
      existingAdmin.passwordHash = await Admin.hashPassword(adminPassword);
      existingAdmin.failedLoginAttempts = 0;
      existingAdmin.lockUntil = null;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      // eslint-disable-next-line no-console
      console.log(`🔑 Owner Admin credentials synchronized for: ${adminEmail}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Auto-admin initialization skipped:', err.message);
  }
}

async function bootstrap() {
  try {
    await connectDB();
    await ensureInitialAdmin();
    startSlotHoldCleaner();
    startWalletExpiryCleaner();
    startBlogScheduler();

    server = app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Barbershop API server running at http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Fatal server start error:', error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  stopSlotHoldCleaner();
  stopWalletExpiryCleaner();
  stopBlogScheduler();
  if (server) {
    server.close(async () => {
      await disconnectDB();
      // eslint-disable-next-line no-console
      console.log('Server process terminated gracefully.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap();
