# Sovereign Barbershop — Master Platform (Phase 1 Complete)

> A luxury barbershop web platform featuring a high-end customer booking flow, responsive editorial storefront, and real-time management console.

---

## 1. Overview & Architecture

Sovereign Barbershop is built as a production-grade monorepo containing:
- **`client/`**: Luxury customer-facing storefront and admin dashboard built with React 18, Tailwind CSS, Redux Toolkit, and RTK Query.
- **`server/`**: Robust Node.js 20+ Express REST API with MongoDB (Mongoose), Zod schema validation, JWT in `httpOnly` cookies, deterministic appointment slot engine, and role-based access control.

```
BarberShop/

├── client/                     # React 18 Frontend
│   ├── public/                 # Static assets, robots.txt, sitemap.xml, favicon
│   ├── src/
│   │   ├── app/                # Redux store & router setup
│   │   ├── assets/             # Curated barbershop photography & assets
│   │   ├── components/         # Shared UI, layout & common components
│   │   ├── config/             # Centralized shop config (site.js)
│   │   ├── features/           # Feature slices, APIs, and components
│   │   ├── mocks/              # Mock Service Worker (zero-dependency testing)
│   │   ├── pages/              # Public & Admin route components
│   │   └── styles/             # tokens.css & globals.css
│   └── vite.config.js          # Vite config with manual chunking
├── server/                     # Express & MongoDB Backend
│   ├── src/
│   │   ├── config/             # Zod-validated environment config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, RBAC & error handlers
│   │   ├── models/             # Mongoose schemas with compound unique index
│   │   ├── routes/             # Public, Admin & Auth endpoints
│   │   ├── seed/               # Database seeder script
│   │   └── utils/              # Deterministic slot engine
│   └── test/                   # Vitest unit & integration tests
├── e2e/                        # Playwright E2E test suite
├── .github/workflows/ci.yml    # GitHub Actions automated CI pipeline
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container orchestration (Web + MongoDB)
└── package.json                # Monorepo workspaces & scripts
```

---

## 2. Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Redux Toolkit, RTK Query, React Hook Form, Zod, Embla Carousel, Leaflet, Lucide React, Helmet Async, MSW |
| **Backend** | Node.js 20+, Express 5, MongoDB 7, Mongoose 8, Zod, JWT (`httpOnly` cookies), Helmet, CORS, Morgan |
| **Testing** | Vitest, Testing Library, Supertest, Playwright (E2E) |
| **Deployment** | Docker multi-stage build, Docker Compose, GitHub Actions CI |

---

## 3. Quick Start Guide

### Prerequisites
- Node.js 20+ installed
- npm 10+ installed
- MongoDB installed locally (optional if running in Mock Mode)

### Step 1: Install Dependencies
```bash
npm install
```

---

### Option A: Zero-Dependency Mode (Frontend with MSW Mocks)
The application includes Mock Service Worker (MSW) by default for immediate preview and testing without spinning up MongoDB:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. All booking flows, slot reservations, and admin portal capabilities function automatically with in-memory persistence.

---

### Option B: Full-Stack Mode (Express + MongoDB)

1. **Configure Environment**:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
   Set `VITE_USE_MOCKS=false` in `client/.env` to connect directly to the Express backend.

2. **Seed the Database**:
   ```bash
   npm run seed
   ```

3. **Start Backend & Frontend Servers**:
   ```bash
   # Terminal 1: Backend API
   npm run dev:server

   # Terminal 2: Frontend Client
   npm run dev:client
   ```

---

## 4. Default Seed Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Shop Owner** | `owner@barbershop.com` | `Admin@123456` | Full business control: bookings, services, team, gallery, reviews, shop hours |
| **Master Barber** | `barber@barbershop.com` | `Admin@123456` | Stylist desk: view personal bookings roster, toggle status |

---

## 5. Application Routes

### Public Pages
- `/` — Editorial Home Page with Hero Appointment Request Form, Live Walk-in Queue Status Card, Service/Map showcase, Works Slider, Testimonial Carousel, Team grid, and Closing CTA.
- `/queue` — Live Walk-in Queue registration portal allowing customers to join remotely from their phones and receive instant digital queue tokens.
- `/services` — Services & Pricing breakdown grouped by category.
- `/gallery` — Portfolio gallery with category filters and keyboard-accessible fullscreen Lightbox.
- `/barbers` — Master craftsmen profiles with direct booking links.
- `/offers` — Promotional offers and seasonal campaigns with coupon copy-to-clipboard, validity windows, and 1-click booking integration with auto-applied discounts.
- `/faq` — Accessible accordion FAQ organized by topic (Booking, Pricing, Services, Policies, Other) with real-time keyword search and WhatsApp direct help.
- `/book` — Complete 4-step booking wizard with real-time slot selection, promo code validation, discount breakdown line items, 409 conflict detection, and `.ics` calendar generation.
- `/about` — Shop heritage story, brand values, client policies, and accessible FAQ accordion.
- `/contact` — Studio location details, interactive tinted map, opening hours, WhatsApp chat, and message form.

### Protected Admin Portal
- `/admin/login` — Secure admin sign-in.
- `/admin` — Executive overview dashboard (KPI counts, today's bookings timeline, next appointments, barber status).
- `/admin/bookings` — Filterable roster, date picker, status dropdown with optimistic updates, reschedule dialog, detail slide-over, and WhatsApp action menu with consent badges.
- `/admin/reminders` — Today's and Tomorrow's 1-tap WhatsApp reminders with 60s auto-refresh polling, status tracking ("Not sent" vs "Sent at HH:mm by Staff"), and sent-row sinking.
- `/admin/customers` — Client directory with search, repeat no-show flags, visit counters, lifetime spend, and manual customer creation.
- `/admin/customers/:id` — Individual customer dossier with editable barber notes, tags, preferred barber, visit history timeline, and WhatsApp quick actions (message, rebooking nudge).
- `/admin/reports` — Executive analytics & business intelligence: date presets (Today, 7d, 30d, This/Last Month, Custom), barber filter, period-over-period delta KPI cards, Recharts bookings/revenue timeline with screen-reader table fallback, services breakdown, barber productivity, peak-hours heatmap, offers campaign performance, no-shows log, acquisition sources, and Excel-compatible UTF-8 BOM CSV exports.
- `/admin/offers` — Bilingual promotional offers CRUD with validity dates, discount models (percent, flat, combo, free add-on), promo codes, atomic usage limit enforcement, status badges (Live, Scheduled, Expired, Inactive), live customer preview, and 1-click duplicate action.
- `/admin/faqs` — Customer help questions and answers with bilingual English/Hindi inputs, topic categorization, and bulk drag/reorder sequencing.
- `/admin/services` — Full CRUD for grooming treatments and prices.
- `/admin/barbers` — Barber profile and weekly schedule management.
- `/admin/gallery` — Portfolio image management.
- `/admin/reviews` — Customer review moderation and approvals.
- `/admin/settings` — Shop operating hours, holidays, policies, shop WhatsApp number, Google Review link, and live Hinglish message template previews.

---

## 6. Testing & Quality Verification

Run all test suites and linting with single commands:

```bash
# Run both Client & Server Vitest suites (158 total tests)
npm test

# Run Client Vitest suite individually (87 tests)
npm run test:client

# Run Server Vitest suite individually (71 tests)
npm run test:server

# Run ESLint quality checks (0 warnings, 0 errors)
npm run lint

# Run Playwright End-to-End tests (Headless Chrome)
npm run test:e2e

# Run production client build & bundle check
npm run build
```

---

## 7. Docker & Production Deployment

### Single-Command Production Run via Docker Compose:
```bash
docker-compose up --build
```
Access the application at **[http://localhost:5000](http://localhost:5000)**.
- Express serves both the REST API under `/api` and the client SPA production build from `/`.

---

## 9. Authentication Model & Security

### Overview: Staff-Only Authentication & Frictionless Guest Booking
1. **Staff-Only Login (`/admin/login`)**:
   - Authentication exists **strictly** for shop staff: `owner` (full business control) and `barber` (scoped to their own chair and appointments).
   - **Zero customer accounts or customer passwords**: Public customers never register, never log in, and never store passwords.
   - Any legacy customer registration or login routes return `404 Not Found`.

2. **Customer Self-Service via Secret Tokenized Manage Link**:
   - Every appointment is assigned a human-friendly unique booking reference (e.g., `#MM-A3B9C2`).
   - On booking confirmation, a high-entropy 32-byte cryptographic token (`crypto.randomBytes(32).toString('base64url')`) is generated.
   - The raw token is returned **only once** upon creation and sent via WhatsApp/SMS in the `{manageLink}` placeholder (`/booking/manage?ref=...&token=...`).
   - The server stores only the timing-safe SHA-256 hash (`manageTokenHash`) with an automatic TTL expiring 24 hours after the appointment end time.
   - Customers can view masked appointment details (`91******3210`), cancel with notice policy checks, or reschedule up to a maximum of 2 times without logging in.

3. **Server Security & Session Hardening**:
   - **Tokens in `httpOnly` Cookies**: Short-lived Access JWT (15 minutes) and Refresh Token (7 days) are issued strictly via `httpOnly`, `SameSite=Lax/Strict` cookies. The refresh cookie is path-scoped to `/api/auth/refresh`. Tokens are **never** returned in JSON response bodies or stored in `localStorage`/`sessionStorage`.
   - **Refresh Token Rotation & Family Revocation**: Refresh tokens are stored hashed in MongoDB. Each refresh operation revokes the old token and issues a new one. If a previously-used token is replayed, the entire token family is immediately revoked, terminating all descendant sessions.
   - **Anti-Enumeration Protection**: All authentication failures return the identical generic error message: *"Invalid email or password"*. When an unknown email is supplied, the server performs a constant-time bcrypt comparison against a dummy cost-12 hash to prevent timing attacks.
   - **Account Lockout & Brute-Force Defense**: Staff accounts are locked for 15 minutes after 5 consecutive failed login attempts.
   - **CSRF Defense**: Dual defense combining `SameSite` cookie policies and mandatory custom request headers (`X-Requested-With`) on all state-changing endpoints.
   - **Immutable Security Audit Log**: All logins, failed attempts, account lockouts, token replay detections, password changes, and staff administration events are recorded in `AuditLog` collection, accessible to the owner.

### Environment Variables
| Variable | Description | Production Requirement |
| :--- | :--- | :--- |
| `JWT_ACCESS_SECRET` | Secret key used to sign 15-minute access JWTs | Required, $\ge 32$ characters, non-default |
| `JWT_REFRESH_SECRET` | Secret key used to sign 7-day refresh tokens | Required, $\ge 32$ characters, non-default |
| `ADMIN_EMAIL` | Initial shop owner email address | Required (e.g. `owner@modernmane.com`) |
| `ADMIN_PASSWORD` | Initial shop owner password for database seeder | Required, $\ge 10$ characters |
| `CLIENT_ORIGIN` | Allowed client URL for CORS and credentials | Required (e.g. `https://modernmane.com`) |

### How to Reset an Owner Password
1. **Via Admin Console (Active Owner)**:
   - Navigate to `/admin/staff`.
   - Click **Reset** next to any staff member, or navigate to `/admin/change-password` to update your own credential.
2. **Via Emergency CLI Script**:
   - If locked out of the only owner account, run the database seed script with updated environment variables:
   ```bash
   ADMIN_EMAIL="owner@modernmane.com" ADMIN_PASSWORD="NewSecurePassword123!" npm run seed
   ```
   Or execute via MongoDB shell / Node repl:
   ```bash
   node -e "
     import('bcryptjs').then(async (bcrypt) => {
       const hash = await bcrypt.hash('NewEmergencyPassword123!', 12);
       console.log('Use this bcrypt hash for Admin collection:', hash);
     });
   "
   ```

### Manual Security Checklist
- [x] **No Customer Login**: Verify `/login`, `/signup`, `/register`, `/account` return 404 or redirect away.
- [x] **No Browser Storage Tokens**: Verify `localStorage` and `sessionStorage` have 0 authentication tokens.
- [x] **Cookie Security**: Verify `modernmane_access_token` and `modernmane_refresh_token` have `HttpOnly` and `SameSite` flags.
- [x] **Account Enumeration Check**: Try logging in with a non-existent email; verify error message and response timing match valid user with wrong password.
- [x] **Brute-Force Lockout**: Attempt 5 invalid logins; verify account is locked with a 15-minute cooldown.
- [x] **CSRF Header Enforcement**: Send a state-changing POST/PATCH request without `X-Requested-With` header; verify 403 `CSRF_DETECTED`.
- [x] **Barber Scoping**: Log in as a barber and verify `/api/admin/users`, `/api/admin/audit-logs`, and other barbers' bookings cannot be accessed.
- [x] **Manage Token Timing Safety**: Confirm manage token hashes are compared in constant time (`crypto.timingSafeEqual`).

