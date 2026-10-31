# Barbershop Express API Backend

Production-ready RESTful backend API for the luxury Barbershop platform built with Node.js 20+, Express, Mongoose, and Zod.

## Features

- **Architecture**: ES Modules, Express 5, Mongoose 8, Zod schema validation.
- **Database**: MongoDB with compound unique indexes (`barberId + date + startTime`) and partial filter expressions for zero-race-condition double-booking prevention.
- **Authentication**: JWT stored in secure `httpOnly` cookies with `SameSite` protection and RBAC guards (`owner` vs `barber`).
- **Slot Engine**: Deterministic appointment slot calculation supporting dynamic barber working hours, holidays, leave days, service durations, break intervals, and `Asia/Kolkata` past time filtering.
- **Security**: `helmet`, `cors` credentials whitelisting, `cookie-parser`, rate limiting via `express-rate-limit`, password hashing with `bcryptjs`.
- **Response Format**: Predictable envelopes (`{ success: true, data: ... }` / `{ success: false, error: { code, message, details } }`).

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API server listen port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `CLIENT_ORIGIN` | Whitelisted frontend CORS origin | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection connection string | `mongodb://localhost:27017/barbershop` |
| `JWT_SECRET` | Secret key for JWT signing (min 16 chars) | _Required_ |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `COOKIE_NAME` | Auth cookie key | `barbershop_auth_token` |
| `OWNER_NAME` | Initial seeded owner name | `Barbershop Master` |
| `OWNER_EMAIL` | Initial seeded owner email | `owner@barbershop.com` |
| `OWNER_PASSWORD` | Initial seeded owner password | `Admin@123456` |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Pre-populates owner admin, master barbers, luxury services, gallery portfolio, reviews, and store operating hours:
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Test Suite
Runs unit tests (slots calculation, edge cases) and integration tests (auth, concurrency, validation):
```bash
npm test
```

---

## API Endpoints

### 1. Public Endpoints

#### Health Check
- **`GET /api/health`**
  ```json
  {
    "status": "ok",
    "service": "barbershop-server",
    "env": "development",
    "timestamp": "2026-10-30T10:45:00.000Z"
  }
  ```

#### Services
- **`GET /api/services`**: Returns list of all active grooming services.

#### Barbers
- **`GET /api/barbers`**: Returns list of all active master craftsmen and schedules.

#### Gallery
- **`GET /api/gallery`**: Returns curated photography items sorted by display order.

#### Reviews
- **`GET /api/reviews`**: Returns approved client reviews.
- **`POST /api/reviews`**: Submit a new client review.

#### Settings & Hours
- **`GET /api/settings`**: Returns store opening hours, holidays, and policies.

#### Available Appointment Slots
- **`GET /api/slots?date=YYYY-MM-DD&barberId=ID&serviceId=ID`**
- _Also accessible via `GET /api/bookings/slots`_
  ```json
  {
    "success": true,
    "data": [
      { "startTime": "09:00 AM", "endTime": "09:45 AM", "isAvailable": true },
      { "startTime": "09:30 AM", "endTime": "10:15 AM", "isAvailable": false },
      { "startTime": "10:00 AM", "endTime": "10:45 AM", "isAvailable": true }
    ]
  }
  ```

#### Bookings
- **`POST /api/bookings`**: Create a confirmed appointment.
  ```json
  // Request
  {
    "customerName": "Rahul Verma",
    "phone": "+919876543210",
    "email": "rahul@example.com",
    "serviceId": "67222384a...",
    "barberId": "67222384b...",
    "date": "2026-11-01",
    "startTime": "10:00 AM",
    "endTime": "10:45 AM",
    "notes": "Low fade trim"
  }
  ```
  _Enforces 409 Conflict if slot is already occupied._

- **`POST /api/bookings/request`**: Quick appointment request from the Hero card.
  ```json
  {
    "name": "Aman Gupta",
    "phone": "9876543210",
    "dateTime": "2026-11-02T14:30:00",
    "notes": "First time visit"
  }
  ```

---

### 2. Authentication Endpoints

- **`POST /api/auth/login`**: Sign in with email and password. Sets `httpOnly` session cookie and returns token.
  ```json
  // Request
  {
    "email": "owner@barbershop.com",
    "password": "Admin@123456"
  }
  ```
- **`POST /api/auth/logout`**: Clears authentication cookie.
- **`GET /api/auth/me`**: Returns current authenticated user profile (`id`, `name`, `email`, `role`).

---

### 3. Admin & Staff Endpoints (`/api/admin`)
_Requires `httpOnly` cookie or `Authorization: Bearer <token>` with `owner` or `barber` role._

- **`GET /api/admin/bookings`**: List bookings with optional filters (`?date=YYYY-MM-DD&barberId=ID&status=confirmed&page=1&limit=50`).
- **`PATCH /api/admin/bookings/:id`**: Update booking status or reschedule time slot (prevents conflicting reschedules with 409 Conflict).
- **`DELETE /api/admin/bookings/:id`**: Cancel an appointment.
- **`POST /api/admin/services`**: Create a service.
- **`PUT /api/admin/services/:id`**: Update service details.
- **`DELETE /api/admin/services/:id`**: Remove a service.
- **`POST /api/admin/barbers`**: Add a new barber.
- **`PUT /api/admin/barbers/:id`**: Update barber profile or schedule.
- **`DELETE /api/admin/barbers/:id`**: Remove barber.
- **`POST /api/admin/gallery`**: Add gallery portfolio item.
- **`PUT /api/admin/gallery/:id`**: Update gallery item or order.
- **`DELETE /api/admin/gallery/:id`**: Delete gallery item.
- **`PUT /api/admin/reviews/:id`**: Moderate/approve review.
- **`DELETE /api/admin/reviews/:id`**: Delete review.
- **`GET /api/admin/settings`**: Get shop configuration.
- **`PUT /api/admin/settings`**: Update shop hours, holidays, policies, `whatsappNumber`, `googleReviewLink`, and `messageTemplates`.
- **`GET /api/admin/reminders?hours=3&day=today|tomorrow`**: List confirmed bookings in window for 1-tap reminders.
- **`PATCH /api/admin/bookings/:id/notifications`**: Log notification sent event (`type`, `channel: 'whatsapp_link'`).

---

## Notification Service Architecture & Extending Channels

Customer communications are abstracted via a channel registry pattern located in `server/src/services/notifications/index.js`. This allows the current free click-to-chat `wa.me` links to be complemented or replaced by automated providers in the future without changing business logic or controllers.

### Unified Invocation
```javascript
import { notify } from './services/notifications/index.js';

// Sends via specified or default channel ('whatsapp_link')
const result = await notify(booking, 'reminder', {
  channel: 'whatsapp_link',
  actorId: req.user._id,
  actorName: req.user.name,
  settings
});
```

### Supported Channels
- **`whatsapp_link`** (Implemented): Normalizes Indian phone numbers, renders template tokens, produces valid `wa.me/<phone>?text=...` deep links, and logs delivery history to `booking.notifications`.
- **`whatsapp_cloud`** (Stub): Throws `NotImplementedError`. Ready for Meta WhatsApp Business Cloud API.
- **`email`** (Stub): Throws `NotImplementedError`. Ready for Nodemailer / SendGrid / AWS SES.

### How to Add a New Automated Channel

1. Open `server/src/services/notifications/index.js`.
2. Define your channel handler adhering to the standard contract:
   ```javascript
   const myNewChannel = async (booking, type, context = {}) => {
     // 1. Format payload / template
     const template = context.settings?.messageTemplates?.[type];
     // 2. Call external provider SDK / HTTP API
     const response = await externalProvider.send({
       to: booking.customerPhone,
       message: template
     });
     // 3. Return receipt metadata
     return {
       channel: 'my_channel',
       type,
       success: true,
       providerMessageId: response.id
     };
   };
   ```
3. Register the channel in `NOTIFICATION_CHANNELS`:
   ```javascript
   export const NOTIFICATION_CHANNELS = {
     whatsapp_link: sendWhatsAppLink,
     whatsapp_cloud: sendWhatsAppCloud,
     email: sendEmailNotification,
     my_channel: myNewChannel,
   };
   ```
4. Configure environment variables in `.env` and `.env.example`.

---

## Double-Booking Protection Mechanism

1. **Pre-Insert Validation**: Checks active bookings in the same slot before saving.
2. **Database Unique Compound Index**:
   ```javascript
   bookingSchema.index(
     { barberId: 1, date: 1, startTime: 1 },
     {
       unique: true,
       partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }
     }
   );
   ```
3. **Graceful Error Translation**: MongoDB duplicate key error code `11000` is caught by the central error handler and translated to `HTTP 409 Conflict`:
   ```json
   {
     "success": false,
     "error": {
       "code": "CONFLICT",
       "message": "This slot is already booked. Please choose an alternate slot or barber."
     }
   }
   ```
