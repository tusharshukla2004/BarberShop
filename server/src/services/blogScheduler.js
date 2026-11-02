import mongoose from 'mongoose';
import Post from '../models/Post.js';

let intervalId = null;

/**
 * Checks and transitions scheduled blog posts whose publish time has arrived
 * @returns {Promise<{ publishedCount: number, postIds: string[] }>}
 */
export async function publishScheduledPosts() {
  if (mongoose.connection?.readyState !== 1 && process.env.NODE_ENV !== 'test') {
    return { publishedCount: 0, postIds: [] };
  }

  const now = new Date();
  const scheduledPosts = await Post.find({
    status: 'scheduled',
    publishedAt: { $lte: now },
  });

  if (!scheduledPosts || scheduledPosts.length === 0) {
    return { publishedCount: 0, postIds: [] };
  }

  const updatedIds = [];
  for (const post of scheduledPosts) {
    post.status = 'published';
    await post.save();
    updatedIds.push(post.id || post._id.toString());
  }

  return {
    publishedCount: updatedIds.length,
    postIds: updatedIds,
  };
}

/**
 * Starts the periodic scheduled post publishing cleaner
 * @param {number} intervalMs - Poll interval in milliseconds (default: 5 minutes)
 */
export function startBlogScheduler(intervalMs = 300000) {
  if (intervalId) return;

  // Run initial check
  publishScheduledPosts().catch((err) => {
    console.error('Initial blog scheduler run error:', err.message);
  });

  intervalId = setInterval(() => {
    publishScheduledPosts().catch((err) => {
      console.error('Blog scheduler cycle error:', err.message);
    });
  }, intervalMs);
  if (intervalId && typeof intervalId.unref === 'function') {
    intervalId.unref();
  }
}

/**
 * Stops the blog scheduler
 */
export function stopBlogScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
