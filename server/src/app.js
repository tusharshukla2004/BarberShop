import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { redirectMiddleware } from './middleware/redirectMiddleware.js';
import { prerenderMiddleware } from './middleware/prerenderMiddleware.js';
import { getSitemapXml, getRobotsTxt } from './controllers/seoController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

export const app = express();

// Security headers
app.use(helmet());

// Allowed origins parser (supports single origin or comma-separated list)
const allowedOrigins = (env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// CORS configuration supporting dynamic frontend origins (Vercel, custom domain & local dev)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.replace(/\/+$/, '');

      if (
        allowedOrigins.includes(normalized) ||
        allowedOrigins.includes('*') ||
        (env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(normalized)) ||
        /^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(normalized)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-csrf-protection',
    ],
    optionsSuccessStatus: 204,
  })
);

// Body and Cookie parsers
app.use(cookieParser());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// HTTP logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Redirects and 410 Gone middleware (intercepts legacy URLs & changed slugs)
app.use(redirectMiddleware);

// Root technical SEO assets
app.get('/sitemap.xml', getSitemapXml);
app.get('/robots.txt', getRobotsTxt);

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

// Prerendering middleware for search engine crawlers and social link scrapers
app.use(prerenderMiddleware);

// Production static assets and SPA fallback for client build
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// 404 catch-all handler for unhandled API routes
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
