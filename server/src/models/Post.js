import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      en: {
        type: String,
        required: [true, 'English post title is required'],
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    slug: {
      type: String,
      required: [true, 'Post slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      en: {
        type: String,
        required: [true, 'English excerpt is required'],
        trim: true,
      },
      hi: {
        type: String,
        default: '',
        trim: true,
      },
    },
    content: {
      en: {
        type: String,
        required: [true, 'English markdown content is required'],
      },
      hi: {
        type: String,
        default: '',
      },
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      trim: true,
    },
    tags: {
      type: [String],
      default: ['grooming', 'haircut'],
      index: true,
    },
    category: {
      type: String,
      enum: ['haircut', 'beard', 'styling', 'grooming', 'trends', 'news'],
      default: 'grooming',
      index: true,
    },
    author: {
      name: { type: String, default: 'Master Barber Ravi' },
      role: { type: String, default: 'Senior Grooming Expert' },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 3,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      default: '',
      trim: true,
    },
    seoDescription: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index on titles, excerpts, and tags
postSchema.index({
  'title.en': 'text',
  'title.hi': 'text',
  'excerpt.en': 'text',
  tags: 'text',
});

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;

