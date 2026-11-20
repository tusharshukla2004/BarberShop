import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['owner', 'barber'],
      default: 'owner',
      index: true,
    },
    barberId: {
      type: String,
      default: null,
      validate: {
        validator: function (val) {
          if (this.role === 'barber') return Boolean(val);
          return true;
        },
        message: 'barberId is required when role is barber',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

adminSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

adminSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

adminSchema.methods.recordFailedLogin = async function () {
  // If previously locked and the lockout duration has expired, reset counter to 1
  if (this.lockUntil && this.lockUntil.getTime() <= Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
    return this.save();
  }

  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  if (this.failedLoginAttempts >= 5) {
    // Lock for 15 minutes
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  return this.save();
};

adminSchema.methods.recordSuccessfulLogin = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  this.lastLoginAt = new Date();
  return this.save();
};

adminSchema.statics.hashPassword = async function (password) {
  // bcrypt cost 12
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

adminSchema.statics.migrateStaffDefaults = async function () {
  await this.updateMany(
    {
      $or: [
        { isActive: { $exists: false } },
        { mustChangePassword: { $exists: false } },
        { failedLoginAttempts: { $exists: false } },
        { tokenVersion: { $exists: false } },
      ],
    },
    {
      $set: {
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        tokenVersion: 0,
      },
    }
  );
};

export const Admin = mongoose.model('Admin', adminSchema);
