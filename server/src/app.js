import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Security headers
app.use(helmet());

// CORS configuration matching frontend client
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body and Cookie parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'barbershop-server',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/', healthHandler);

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 404 catch-all handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized error handling
app.use(errorHandler);
