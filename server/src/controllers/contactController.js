import { ContactMessage } from '../models/ContactMessage.js';
import { sendSuccess } from '../utils/response.js';

export async function createContactMessage(req, res, next) {
  try {
    const { name, phone, email, message } = req.body;

    const contact = await ContactMessage.create({
      name,
      phone,
      email: email || '',
      message,
    });

    return sendSuccess(
      res,
      contact,
      201,
      'Thank you for reaching out. Our concierge will get back to you shortly.'
    );
  } catch (error) {
    return next(error);
  }
}
