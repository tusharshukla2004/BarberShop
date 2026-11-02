import mongoose from 'mongoose';
import Redirect from '../models/Redirect.js';

/**
 * Express middleware to handle redirects and 410 Gone responses from the admin redirects table
 */
export async function redirectMiddleware(req, res, next) {
  // Only intercept GET / HEAD requests, ignore internal APIs, statics, and healthchecks
  if (
    (req.method !== 'GET' && req.method !== 'HEAD') ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/assets') ||
    req.path.startsWith('/@') ||
    req.path.includes('.')
  ) {
    return next();
  }

  if (mongoose.connection?.readyState !== 1 && process.env.NODE_ENV !== 'test') {
    return next();
  }

  try {
    const rawPath = req.path.toLowerCase().replace(/\/+$/, '') || '/';
    const redirect = await Redirect.findOne({ fromPath: rawPath, isActive: true });

    if (!redirect) {
      return next();
    }

    // Record hit asynchronously
    Redirect.findByIdAndUpdate(redirect._id, {
      $inc: { hitCount: 1 },
      lastHitAt: new Date(),
    }).catch(() => {});

    if (redirect.statusCode === 410) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>410 Gone | Modern Mane</title>
            <meta name="robots" content="noindex, nofollow" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0a09; color: #f5f5f4; text-align: center; padding: 100px 20px; }
              h1 { font-size: 48px; color: #d4af37; margin-bottom: 8px; }
              p { color: #a8a29e; font-size: 16px; max-width: 480px; margin: 0 auto 24px; }
              a { display: inline-block; background: #d4af37; color: #0c0a09; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <h1>410 Gone</h1>
            <p>This page has been permanently removed and is no longer available.</p>
            <a href="/">Return to Modern Mane Home</a>
          </body>
        </html>
      `);
    }

    return res.redirect(redirect.statusCode || 301, redirect.toPath);
  } catch (err) {
    // Fail open so middleware never breaks the site
    return next();
  }
}

export default redirectMiddleware;
