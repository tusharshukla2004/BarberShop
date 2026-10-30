import { Settings } from '../models/Settings.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return sendSuccess(res, settings);
  } catch (error) {
    return next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return sendSuccess(res, settings, 200, 'Settings updated successfully');
  } catch (error) {
    return next(error);
  }
}
