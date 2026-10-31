import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startSlotHoldCleaner, stopSlotHoldCleaner } from './services/slotHoldService.js';
import { startWalletExpiryCleaner, stopWalletExpiryCleaner } from './services/walletExpiryService.js';

let server;

async function bootstrap() {
  try {
    await connectDB();
    startSlotHoldCleaner();
    startWalletExpiryCleaner();

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
