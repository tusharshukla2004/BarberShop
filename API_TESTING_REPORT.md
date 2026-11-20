# API Testing & Integration Audit

## Executive summary

The audit identified **139 backend route/method registrations**: 4 application-level routes, 5 authentication routes, 34 public API routes, and 96 admin API routes. Each received at least one safe HTTP probe. The client has **127 RTK Query endpoint definitions in 17 API modules**.

Both existing automated suites passed: **164 server tests across 18 files** and **122 client tests across 24 files**. These results establish that the current test suites pass; they do not prove successful live database writes or full production integrations.

**No application source code was changed.** This report is the only audit deliverable. Existing worktree edits were left untouched.

| Area | Result |
|---|---:|
| Backend route/method registrations identified | 139 |
| Route/methods receiving at least one safe probe | 139 / 139 |
| Client RTK Query endpoint definitions | 127 / 17 modules |
| Automated tests | 286 passed |
| Successful state-changing operations verified against a database | 0 |

### How to interpret the HTTP coverage

- The local API was reachable at `http://127.0.0.1:5000`; health routes returned 200 and the server identified itself as development.
- 27 safe GET probes covered the 23 public GET routes and 4 app-level GET routes. Nineteen returned 200; eight were deliberate missing-resource/not-found probes.
- All 11 public POST routes and all 5 auth routes received validation, missing-token, or otherwise non-mutating probes. No valid booking, contact, payment, webhook, or other write payload was submitted.
- All 96 admin routes returned 401 when called without credentials. This validates the unauthenticated access barrier, **not** their authenticated controller behavior, role permissions, or CRUD/database results.
- No disposable test database was available/verified. No successful live database mutation was attempted.

## Findings and recommendations

### Medium — Standard API errors are normalized to an object, not a string

**Files:** `client/src/app/baseApi.js` (`normalizeError`, near line 9); `client/src/pages/admin/AdminLoginPage.jsx` (error rendering and login catch); `server/src/utils/response.js`.

The server's `sendError` helper returns `error: { code, message }`. The client normalizer currently selects `response.data.error` as the error `message`, so a standard server error becomes an object. The login page uses `err.message` as text and renders it directly; other toast consumers also expect a string. This can break user-facing error handling when a live API request fails. The application was not submitted invalid real credentials to avoid triggering account lockout behavior; the mismatch is established by the response/helper and client code shapes.

**Recommendation:** normalize the nested server envelope to `response.data.error.message` and preserve `code`/`details` separately; add a focused test using the server's `{ success: false, error: { code, message } }` shape.

### Medium — Development UI is currently intercepted by MSW

**Files:** `client/src/main.jsx` (near lines 7–20); `client/.env.example`.

The Vite browser page at `http://localhost:5173/admin/login` was controlled by `mockServiceWorker.js`. In development, `main.jsx` enables MSW unless `VITE_USE_MOCKS=false`; the checked-in example environment sets `VITE_USE_MOCKS=true`. Therefore, current browser behavior is not evidence that the UI is using the local API, and mock handlers can mask integration failures.

**Recommendation:** use `VITE_USE_MOCKS=false` for an API integration run and verify the browser's network requests reach the Vite `/api` proxy. Keep mock mode explicit for development/test workflows.

### Medium — RTK Query cache tags do not match declared tag types

**Files:** `client/src/app/baseApi.js` (declared `tagTypes`, near line 86); `client/src/features/payments/paymentsApi.js` (near lines 24, 68, 78); `client/src/features/booking/bookingApi.js` (near lines 144, 155–170).

`baseApi.tagTypes` declares `Reports` but payment mutations use `Report`. It does not declare `ManagedBooking`, which is used by booking management queries and mutations. These names do not match the API's declared tags, so the intended cache invalidations/refetches are not reliable and RTK Query can warn about undeclared tag types.

**Recommendation:** align the tag names with `tagTypes` and add a focused cache invalidation test for payment changes and managed-booking changes.

### Low — Several error paths bypass the standard API error envelope

**Files:** `server/src/controllers/seoController.js` (`getAreaBySlug`, near line 168; `getPostBySlug`, near line 279); `server/src/controllers/paymentController.js` (near line 356).

The live missing-area and missing-post probes returned 404 with `success: false` and an `error.message`, but no `error.code`. The unsigned-webhook probe returned `{ error: "Invalid webhook signature" }` without the standard `success` and nested error fields. These paths construct responses directly instead of using the shared `sendError` helper. Other tested not-found handlers returned a code.

**Recommendation:** use the shared error helper (or preserve its `success`, `error.code`, and `error.message` shape) so API error envelopes are consistent.

### Low / environment-dependent — Auth skips database account checks when disconnected outside production

**File:** `server/src/middleware/auth.js` (`requireAuth`, near lines 70–89).

When the database is disconnected, non-production environments accept the claims of a valid signed access token without loading the staff record. In that branch, active-account and token-version checks cannot be performed. Production explicitly rejects this condition. This was identified by code inspection and was not reproduced with a signed token.

**Recommendation:** keep this fallback confined to a clearly identified test environment, or fail closed where non-production environments use real staff credentials.

## Backend API inventory

Routes are listed with their mounted paths. The admin router applies `requireAuth`, `requireRole('owner', 'barber')`, and CSRF middleware globally; some admin operations additionally require the owner role.

### Application-level routes — 4

| Method | Path |
|---|---|
| GET | `/` |
| GET | `/api/health` |
| GET | `/sitemap.xml` |
| GET | `/robots.txt` |

### Authentication routes — 5 (`/api/auth`)

| Method | Path |
|---|---|
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |
| POST | `/api/auth/change-password` |

### Public routes — 34 (`/api`)

**GET (23):** `/api/services`, `/api/barbers`, `/api/gallery`, `/api/reviews`, `/api/settings`, `/api/products`, `/api/products/:id`, `/api/slots`, `/api/bookings/slots`, `/api/bookings/manage`, `/api/queue/status`, `/api/offers`, `/api/faqs`, `/api/packages`, `/api/memberships`, `/api/wallet/:token`, `/api/sitemap.xml`, `/api/robots.txt`, `/api/areas`, `/api/locations/:areaSlug`, `/api/locations/:areaSlug/:serviceSlug`, `/api/posts`, `/api/posts/:slug`.

**POST (11):** `/api/reviews`, `/api/contact`, `/api/bookings`, `/api/bookings/request`, `/api/bookings/manage/cancel`, `/api/bookings/manage/reschedule`, `/api/queue/join`, `/api/offers/validate`, `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`.

### Admin routes — 96 (`/api/admin`)

| Resource | Methods and paths |
|---|---|
| Bookings | `GET /bookings`; `PATCH /bookings/:id`; `PATCH /bookings/:id/status`; `PATCH /bookings/:id/notifications`; `DELETE /bookings/:id`; `PATCH /bookings/:id/mark-paid` |
| Reminders | `GET /reminders` |
| Customers | `GET /customers`; `GET /customers/:id`; `POST /customers`; `PATCH /customers/:id`; `DELETE /customers/:id`; `GET /customers/due-for-visit`; `GET /customers/upcoming-birthdays`; `GET /customers/:id/wallet` |
| Customer packages/memberships | `POST /customers/:id/packages`; `POST /customers/:id/memberships`; `POST /customers/:id/consume-session`; `POST /customers/:id/reverse-session`; `POST /customers/:id/reverse-membership` |
| Customer loyalty/wallet token | `POST /customers/:id/loyalty/adjust`; `POST /customers/:id/loyalty/redeem`; `POST /customers/:id/loyalty/reverse`; `POST /customers/:id/wallet-token`; `DELETE /customers/:id/wallet-token` |
| Wallet | `GET /wallet/expiring` |
| Queue | `GET /queue`; `POST /queue`; `PATCH /queue/:id` |
| Reports | `GET /reports/summary`; `GET /reports/bookings-over-time`; `GET /reports/services`; `GET /reports/barbers`; `GET /reports/peak-hours`; `GET /reports/customers`; `GET /reports/no-shows`; `GET /reports/sources`; `GET /reports/offers`; `GET /reports/wallet` |
| Offers | `GET /offers`; `POST /offers`; `GET /offers/:id`; `PUT /offers/:id`; `DELETE /offers/:id`; `POST /offers/:id/duplicate` |
| FAQs | `GET /faqs`; `POST /faqs`; `PUT /faqs/:id`; `DELETE /faqs/:id`; `PATCH /faqs/reorder` |
| Services | `POST /services`; `PUT /services/:id`; `DELETE /services/:id` |
| Barbers | `POST /barbers`; `PUT /barbers/:id`; `DELETE /barbers/:id` |
| Gallery | `POST /gallery`; `PUT /gallery/:id`; `DELETE /gallery/:id` |
| Reviews | `PUT /reviews/:id`; `DELETE /reviews/:id` |
| Products | `POST /products`; `PUT /products/:id`; `DELETE /products/:id` |
| Settings | `GET /settings`; `PUT /settings` |
| Payments | `GET /payments`; `GET /payments/reconciliation`; `POST /payments/:id/refund` |
| Packages | `GET /packages`; `POST /packages`; `PUT /packages/:id`; `DELETE /packages/:id` |
| Memberships | `GET /memberships`; `POST /memberships`; `PUT /memberships/:id`; `DELETE /memberships/:id` |
| Local SEO areas | `GET /areas`; `POST /areas`; `PUT /areas/:id`; `DELETE /areas/:id` |
| Blog posts | `GET /posts`; `POST /posts`; `PUT /posts/:id`; `DELETE /posts/:id` |
| Redirects | `GET /redirects`; `POST /redirects`; `PUT /redirects/:id`; `DELETE /redirects/:id` |
| SEO | `GET /seo/health`; `GET /seo/gbp` |
| Staff users | `GET /users`; `POST /users`; `PATCH /users/:id`; `POST /users/:id/reset-password` |
| Audit logs | `GET /audit-logs` |

All paths in this table are prefixed with `/api/admin`.

## Frontend API clients and integration configuration

The client uses RTK Query from `client/src/app/baseApi.js`; no additional Axios configuration or direct application `fetch()` integration was found. The base query includes credentials, the `X-Requested-With` header, and one refresh attempt after a 401. Vite proxies `/api` to the backend in `client/vite.config.js`.

| API module | Endpoint definitions |
|---|---:|
| `features/auth/authApi.js` | 10 |
| `features/barbers/barbersApi.js` | 4 |
| `features/booking/bookingApi.js` | 12 |
| `features/contact/contactApi.js` | 1 |
| `features/customers/customersApi.js` | 5 |
| `features/faqs/faqsApi.js` | 6 |
| `features/gallery/galleryApi.js` | 4 |
| `features/offers/offersApi.js` | 8 |
| `features/payments/paymentsApi.js` | 6 |
| `features/queue/queueApi.js` | 5 |
| `features/reports/reportsApi.js` | 8 |
| `features/reviews/reviewsApi.js` | 4 |
| `features/seo/seoApi.js` | 18 |
| `features/services/servicesApi.js` | 4 |
| `features/settings/settingsApi.js` | 2 |
| `features/shop/productsApi.js` | 5 |
| `features/wallet/walletApi.js` | 25 |
| **Total** | **127** |

Static inspection found no confirmed URL/method mismatch in the mapped client endpoints. Dynamic query construction for payment and SEO endpoints was manually checked. This is not equivalent to observing live browser calls: the active browser was controlled by the MSW worker.

## Authentication and authorization results

- Missing credentials on all 96 admin route/method registrations returned 401. The unauthenticated access barrier was therefore exercised across the full admin router.
- Auth and validation probes confirmed expected 400 responses for tested empty/invalid requests, 401 responses for missing-session protected calls, and a 200 response for logout without an active session.
- Safe booking-management probes without a token returned 404/400; an unsigned payment webhook returned 400 before payment processing.
- A valid staff login, token refresh with a real refresh cookie, expired-token behavior, authenticated owner/barber permission matrix, CSRF rejection with cookie auth, password reset, and authorized admin CRUD were **not** end-to-end verified.
- Do not interpret the 401 sweep as proof that owner-only and barber-scoped authorization rules behave correctly after authentication; those branches require test credentials and a controlled environment.

## Database and model inventory

The server contains 24 Mongoose models: `Admin`, `Area`, `AuditLog`, `Barber`, `Booking`, `ContactMessage`, `Customer`, `CustomerMembership`, `CustomerPackage`, `FAQ`, `GalleryItem`, `LoyaltyAccount`, `MembershipPlan`, `Offer`, `Package`, `Payment`, `Post`, `Product`, `QueueEntry`, `Redirect`, `RefreshToken`, `Review`, `Service`, and `Settings`.

Inspected relationships include:

- `Booking` references `Customer`, `Offer`, `CustomerPackage`, and `CustomerMembership`.
- `Payment` and `QueueEntry` reference `Booking`.
- `CustomerPackage`, `CustomerMembership`, and `LoyaltyAccount` reference `Customer` and their related plan/package/booking records.
- `AuditLog` and `RefreshToken` reference `Admin`.

No valid write request or before/after database assertion was made. Therefore duplicate-record behavior, atomicity, side effects, refund behavior, transactional consistency, database failure handling, and actual CRUD persistence remain unverified.

## Automated tests and limitations

| Suite | Result |
|---|---|
| Server (`npm test` in `server`) | 164 passed, 18 test files |
| Client (`npm test` in `client`) | 122 passed, 24 test files |

The suites passed with existing non-blocking warnings. Server tests use mocked model methods in many API cases. In `server/test/customer.test.js`, database-dependent cases return early when Mongoose is disconnected; those cases can be reported as passed without exercising database behavior. The test run did not verify live writes.

## Priority summary

| Priority | Finding |
|---|---|
| Critical | None confirmed |
| High | None confirmed |
| Medium | Nested API errors are treated as message objects; dev browser runs with MSW by default; RTK Query tags are undeclared/mismatched |
| Low | SEO 404 responses omit error codes; non-production auth fallback bypasses staff-document checks during DB disconnection |

## Recommended next validation

1. Run the frontend with `VITE_USE_MOCKS=false`, then verify API calls in the browser against the local backend.
2. Apply the focused error-envelope and tag-name fixes in a separate implementation task, with regression tests.
3. Use a disposable database and dedicated test staff accounts to exercise valid login/refresh, owner/barber permissions, and representative CRUD paths.
4. Test booking, payment, refund, and webhook success paths only with sandbox payment credentials and isolated test records.
5. Add database-backed integration coverage for the customer tests that currently return early when disconnected.
