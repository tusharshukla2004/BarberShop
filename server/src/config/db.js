import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn.connection;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  // eslint-disable-next-line no-console
  console.log('🔌 MongoDB Disconnected');
}
