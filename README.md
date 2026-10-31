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
| **Shop Owner** | `owner@barbershop.com` | `Secret123!` | Full business control: bookings, services, team, gallery, reviews, shop hours |
| **Master Barber** | `barber@barbershop.com` | `Secret123!` | Stylist desk: view personal bookings roster, toggle status |

---

## 5. Application Routes

### Public Pages
- `/` — Editorial Home Page with Hero Appointment Request Form, Service/Map showcase, Works Slider, Testimonial Carousel, Team grid, and Closing CTA.
- `/services` — Services & Pricing breakdown grouped by category.
- `/gallery` — Portfolio gallery with category filters and keyboard-accessible fullscreen Lightbox.
- `/barbers` — Master craftsmen profiles with direct booking links.
- `/book` — Complete 4-step booking wizard with real-time slot selection, 409 conflict detection, and `.ics` calendar generation.
- `/about` — Shop heritage story, brand values, client policies, and accessible FAQ accordion.
- `/contact` — Studio location details, interactive tinted map, opening hours, WhatsApp chat, and message form.

### Protected Admin Portal
- `/admin/login` — Secure admin sign-in.
- `/admin` — Executive overview dashboard (KPI counts, today's bookings timeline, next appointments, barber status).
- `/admin/bookings` — Filterable roster, date picker, status dropdown with optimistic updates, reschedule dialog, detail slide-over, and WhatsApp action menu with consent badges.
- `/admin/reminders` — Today's and Tomorrow's 1-tap WhatsApp reminders with 60s auto-refresh polling, status tracking ("Not sent" vs "Sent at HH:mm by Staff"), and sent-row sinking.
- `/admin/services` — Full CRUD for grooming treatments and prices.
- `/admin/barbers` — Barber profile and weekly schedule management.
- `/admin/gallery` — Portfolio image management.
- `/admin/reviews` — Customer review moderation and approvals.
- `/admin/settings` — Shop operating hours, holidays, policies, shop WhatsApp number, Google Review link, and live Hinglish message template previews.

---

## 6. Testing & Quality Verification

Run all test suites and linting with single commands:

```bash
# Run both Client & Server Vitest suites (84 total tests)
npm test

# Run Client Vitest suite individually (62 tests)
npm run test:client

# Run Server Vitest suite individually (22 tests)
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

## 8. Design System & Accessibility

- **Design Tokens**: All typography, colors (`ink`, `brown`, `cream`, `white`, `accent`), and border radiuses are centralized in [`client/src/styles/tokens.css`](file:///c:/Users/Veerendra/OneDrive/Desktop/BarberShop/client/src/styles/tokens.css).
- **Accessibility**:
  - Full keyboard navigation and visible focus rings (`:focus-visible`).
  - Active focus trapping in mobile menu, lightbox, and modal dialogs.
  - Exactly one `<h1>` landmark per page.
  - Automatic `prefers-reduced-motion` compliance.
  - WCAG AA compliant color contrast ratios.
