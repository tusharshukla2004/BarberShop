import { Admin } from '../models/Admin.js';
import { AuditLog } from '../models/AuditLog.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function listStaffUsers(req, res, next) {
  try {
    const users = await Admin.find().sort({ role: 1, name: 1 }).lean();
    return sendSuccess(res, users);
  } catch (error) {
    return next(error);
  }
}

export async function createStaffUser(req, res, next) {
  try {
    const { name, email, role, barberId, temporaryPassword } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return sendError(res, 400, 'A staff account with this email already exists.', 'EMAIL_IN_USE');
    }

    const passwordHash = await Admin.hashPassword(temporaryPassword);

    const newUser = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      barberId: role === 'barber' ? barberId : null,
      isActive: true,
      mustChangePassword: true,
      tokenVersion: 0,
    });

    await AuditLog.create({
      action: 'staff_created',
      actorId: req.user.id,
      actorEmail: req.user.email,
      targetId: newUser._id,
      targetEmail: newUser.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
      details: { role: newUser.role, barberId: newUser.barberId },
    });

    return sendSuccess(res, newUser, 201, 'Staff account created successfully');
  } catch (error) {
    return next(error);
  }
}

export async function updateStaffUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, barberId, isActive } = req.body;

    const user = await Admin.findById(id);
    if (!user) {
      return sendError(res, 404, 'Staff account not found', 'NOT_FOUND');
    }

    // Safety check: Cannot deactivate the last active owner
    if (typeof isActive === 'boolean' && !isActive && user.role === 'owner') {
      const activeOwnersCount = await Admin.countDocuments({
        role: 'owner',
        isActive: true,
      });
      if (activeOwnersCount <= 1) {
        return sendError(
          res,
          400,
          'Cannot deactivate the last active owner account.',
          'CANNOT_DEACTIVATE_LAST_OWNER'
        );
      }
    }

    if (name) user.name = name.trim();
    if (barberId !== undefined) user.barberId = barberId;
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
      if (!isActive) {
        // Invalidate sessions when deactivated
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
      }
    }

    await user.save();

    await AuditLog.create({
      action: typeof isActive === 'boolean' ? (isActive ? 'staff_reactivated' : 'staff_deactivated') : 'staff_updated',
      actorId: req.user.id,
      actorEmail: req.user.email,
      targetId: user._id,
      targetEmail: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
      details: { isActive: user.isActive, role: user.role },
    });

    return sendSuccess(res, user, 200, 'Staff account updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function resetStaffPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { temporaryPassword } = req.body;

    const user = await Admin.findById(id);
    if (!user) {
      return sendError(res, 404, 'Staff account not found', 'NOT_FOUND');
    }

    const passwordHash = await Admin.hashPassword(temporaryPassword);
    user.passwordHash = passwordHash;
    user.mustChangePassword = true;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Revoke all existing sessions for this user
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    await AuditLog.create({
      action: 'password_reset_by_admin',
      actorId: req.user.id,
      actorEmail: req.user.email,
      targetId: user._id,
      targetEmail: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    return sendSuccess(res, null, 200, 'Staff password reset successfully. User must change password upon next login.');
  } catch (error) {
    return next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);

    return sendSuccess(res, {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

