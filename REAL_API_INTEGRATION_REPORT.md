# Real API Integration & End-to-End Verification

**Audit date:** 2026-11-17

## Executive summary

This phase verified the frontend's real API transport using a temporary Vite instance with MSW explicitly disabled. The browser reached the real backend through the Vite `/api` proxy and received the expected health response. The unauthenticated admin guard also made real requests and redirected to sign-in.

The backend runs with `NODE_ENV=development`, but the configured MongoDB target is **not loopback**. Its locality/isolation could not be established without inspecting or disclosing connection details. No database-backed read or write was made in this phase. No test credentials were supplied, and creating an account could have changed the non-loopback database. Therefore, authenticated CRUD, role permissions, and frontend feature data flows are **BLOCKED**, not passed.

The previous audit's 139-route inventory remains in [API_TESTING_REPORT.md](./API_TESTING_REPORT.md); this report focuses on real transport, MSW coverage, and phase-two blockers.

| Metric | Phase-two result |
|---|---:|
| Backend routes previously identified | 139 (4 app-level + 5 auth + 34 public + 96 admin) |
| Routes exercised with valid credentials | 0 |
| Routes functionally verified against an isolated database | 0 |
| Browser-to-backend health transport verified | 1 |
| No-cookie auth-denial paths exercised in the browser | 2 |
| Backend API method/path pairs covered by MSW handlers | 125 / 135 |
| Backend API method/path pairs without a matching MSW handler | 10 / 135 |

### Status definitions

- **PASSED** — the tested behavior and response contract were verified, not merely an HTTP status.
- **FAILED** — evidence demonstrates incorrect behavior or configuration.
- **BLOCKED** — a safety/environment prerequisite prevented testing.
- **NOT TESTED** — no phase-two request or UI action was performed for that behavior.

## Real frontend-to-backend transport

A temporary Vite server was started on port `5188` with the process environment set to `VITE_USE_MOCKS=false`; it was stopped after testing. No source files or environment files were edited.

| Check | Status | Evidence |
|---|---|---|
| Browser request through Vite `/api` proxy | **PASSED — transport/health contract only** | Browser `GET /api/health` returned HTTP 200 and JSON identifying `barbershop-server` in development. This health route does not report database readiness. |
| MSW disabled on the temporary Vite origin | **PASSED** | `navigator.serviceWorker.controller` was `null`; the health response came through the configured proxy to `127.0.0.1:5000`. |
| Guest access to `/admin` | **PASSED — denial/redirect flow only** | The application emitted two 401 responses and redirected to `/admin/login?returnTo=%2Fadmin`. This does not verify authenticated admin access. |
| Auth error response shapes | **PASSED — negative path observed** | Without cookies, `GET /api/auth/me` returned `401` with `{success:false,error:{code:"UNAUTHORIZED",message:...}}`; `POST /api/auth/refresh` returned `401` with code `REFRESH_TOKEN_REQUIRED`. |
| Login, token issuance, successful refresh, role access | **BLOCKED** | No dedicated test account or safe local database was available. No production credentials were used or inspected. |

The health route and no-cookie auth checks do not prove that database-backed routes or authenticated controller operations work. No success status alone is treated as an endpoint pass.

## Mock versus real API usage

### MSW setup and purpose

- `client/src/mocks/browser.js` registers `handlers.js` with `setupWorker`.
- `client/src/mocks/handlers.js` uses fixture data from `client/src/mocks/data.js` and mutable in-memory arrays. Simulated mutations are not persisted to MongoDB and reset when the worker/module is restarted.
- `client/src/main.jsx` starts the worker when `VITE_USE_MOCKS === 'true'`, or by default in development unless explicitly set to `false`. Unmatched requests use `onUnhandledRequest: 'bypass'`, so they pass through to the real backend.
- The current workspace `client/.env` has `VITE_USE_MOCKS=true` and `VITE_API_URL=/api`. The browser on the existing Vite origin was controlled by `mockServiceWorker.js`.
- The existing MSW handlers include simulated auth, catalog, booking, contact, queue, reporting, offers, FAQ, payment, wallet, staff, and management flows. Thus, these features can appear operational without backend/database behavior being exercised.

### Handler coverage

Static matching of handler method/path patterns against the backend route inventory found:

| Backend group | Matching MSW route/method pairs | Total |
|---|---:|---:|
| Auth | 5 | 5 |
| Public | 30 | 34 |
| Admin | 90 | 96 |
| **Total API routes** | **125** | **135** |

The 10 backend route/method pairs **without** an MSW handler are:

```text
POST   /api/reviews
POST   /api/payments/webhook
GET    /api/sitemap.xml
GET    /api/robots.txt
GET    /api/admin/offers/:id
POST   /api/admin/customers/:id/reverse-session
POST   /api/admin/customers/:id/reverse-membership
POST   /api/admin/customers/:id/loyalty/reverse
POST   /api/admin/customers/:id/wallet-token
DELETE /api/admin/customers/:id/wallet-token
```

If called while MSW is running, these unmatched requests bypass the worker and reach the backend. They were not invoked because the database target could not be confirmed as local/test-only.

Two MSW patterns do not correspond to a registered backend route: `POST */api/auth/register` (a mock 404 stub) and the catch-all `*/api/customer/*`. No matching client feature call was found for either pattern.

### Development and production configuration

- **Development:** MSW is enabled by default unless `VITE_USE_MOCKS=false`. The checked-in `client/.env.example` also sets the flag to `true`; the active workspace `.env` does as well.
- **Production:** `main.jsx` still enables MSW whenever the flag is explicitly `true`, even when `import.meta.env.DEV` is false. A production build made with the current workspace value would therefore start mock handlers. The deployment build environment/artifact was not inspected, so deployed behavior is **NOT TESTED**.
- The mock login handler in `client/src/mocks/handlers.js` checks for a matching active fixture account but does **not** compare the submitted password. It returns an in-memory user instead of a backend-issued session. If mock mode is included in a production build, this can make the mock admin UI appear authenticated and serve mock CRUD data. This is a mock-mode defect, not evidence that backend authentication is bypassed.

## API configuration and endpoint behavior

`client/src/app/baseApi.js` uses RTK Query `fetchBaseQuery`, not Axios. It includes cookies and an `X-Requested-With` header. Its `getBaseUrl()` accepts `VITE_API_URL` only when it is an absolute `http...` URL; the current relative `/api` value falls through to the current origin plus `/api`. The browser-to-Vite proxy was verified for `/api/health`.

`client/vite.config.js` proxies `/api` to `http://127.0.0.1:5000`. For production, the client uses the deployed origin's `/api` path unless configured with an absolute API URL; the corresponding deployment proxy/API host was not exercised.

### Route testing disposition

| Route group | Count | Phase-two result |
|---|---:|---|
| App-level | 4 | `GET /api/health` passed the real browser/proxy/response-contract check. `/`, `/sitemap.xml`, and `/robots.txt` were **NOT TESTED** in this phase. |
| Authentication | 5 | `GET /api/auth/me` and `POST /api/auth/refresh` were exercised without cookies and returned the expected denial envelopes. Successful login, refresh, logout with a session, and password-change behavior are **BLOCKED**. |
| Public API | 34 | Database-backed reads and valid write flows are **BLOCKED** because the MongoDB target is not confirmed local/test-only. No valid contact, review, booking, queue, offer, payment, or wallet operation was sent. |
| Admin API | 96 | All authenticated route behavior is **BLOCKED**: no dedicated test owner/barber account and no confirmed isolated local database. No valid role-bearing token was used. |

The 139 routes are inventoried in [API_TESTING_REPORT.md](./API_TESTING_REPORT.md). This phase did not repeat the prior unauthenticated 96-route sweep.

## Authentication and authorization

- **PASSED — guest denial/redirect only:** the browser's `/admin` guard reached the real auth endpoints without cookies, received two 401 responses, and navigated to the sign-in page.
- **BLOCKED — successful login and access/refresh token issuance:** no test account was supplied or created. The configured database target is non-loopback and could not be proven isolated.
- **BLOCKED — all 96 authenticated admin routes:** no real owner/barber credentials or safe local account were available. The phase-one 401 sweep is not evidence of authenticated route correctness.
- **NOT TESTED:** invalid/expired signed tokens, account deactivation/revocation, CSRF with authenticated cookies, owner-only versus barber-scoped permissions, and refresh-cookie rotation.
- The MSW auth handler is not suitable for these tests: it stores a fake user in memory, does not verify the submitted password, and does not issue the backend's cookies/tokens.

## Database CRUD verification

**BLOCKED — no database CRUD was performed.** The server is in development mode, but its configured MongoDB host is non-loopback. That alone does not establish whether the database is a local container, a shared development service, or a remote environment. To honor the local-database-only and preserve-data requirements, no data-bearing API request or write was sent, and no account was created.

Consequently, no create/fetch/update/delete round trip, pagination/filter result against real records, persistence-after-reload, transaction/side-effect behavior, or safe test-record cleanup was verified. The health endpoint is process liveness only and does not establish MongoDB readiness.

## Integration, cache, and error findings

### High — Mock sign-in does not verify passwords; production mock activation is possible

**Files:** `client/src/main.jsx` (MSW activation condition); `client/src/mocks/handlers.js` (fixture user and login handler, near lines 20–60 and 125–155); workspace `client/.env`.

The current workspace sets `VITE_USE_MOCKS=true`. The source condition permits that value to activate MSW in production mode. The mock login handler selects an active fixture user by email and never compares the submitted password. Many admin routes are also served by in-memory mock handlers. A local production build that inherits this environment could present a mock-authenticated dashboard with non-persistent data. This is conditional; the deployment build was not inspected.

**Recommendation:** prevent MSW startup in production builds and require an explicit development/test-only opt-in. Confirm the deployment environment uses the real API before release.

### Medium — Real nested errors become object-valued messages in the client

**Files:** `client/src/app/baseApi.js` (`normalizeError`, near lines 9–18); `client/src/pages/admin/AdminLoginPage.jsx` (error rendering); `server/src/utils/response.js`.

The live no-cookie auth response uses the standard nested `error: { code, message }` envelope. `normalizeError` selects `response.data.error` as `message`, producing an object rather than a string. The login page and toast UI render the message as text. MSW error handlers commonly use a top-level `message` string instead, so mock-mode testing can hide this mismatch.

**Recommendation:** normalize the nested message and preserve code/details as separate fields; add an integration test using the live server envelope.

### Medium — RTK Query cache-tag names are inconsistent

**Files:** `client/src/app/baseApi.js` (`tagTypes`, near line 86); `client/src/features/payments/paymentsApi.js` (near lines 24, 68, 78); `client/src/features/booking/bookingApi.js` (near lines 144, 155–170).

`baseApi` declares `Reports`, while payment mutations invalidate `Report`; `ManagedBooking` is used by booking endpoints but is not declared. Intended invalidation/refetch behavior is therefore unreliable. Runtime mutation/refetch behavior could not be tested because authenticated mutations were blocked.

**Recommendation:** align every provided/invalidated tag with `tagTypes` and add cache invalidation tests for payment and managed-booking mutations.

### Low — Error response envelope is not uniform

**Files:** `server/src/controllers/seoController.js` (public area/post not-found handlers); `server/src/controllers/paymentController.js` (webhook signature failure).

Phase-one safe probes found SEO 404 responses without `error.code` and an unsigned webhook response with a raw `{error: ...}` body. These do not match `sendError`'s standard envelope. They were not re-probed in phase two.

**Recommendation:** use the shared response helper for consistent `success`, `error.code`, and `error.message` fields.

## Results by requested status

| Status | Results |
|---|---|
| **PASSED** | Real browser-to-Vite-to-backend `/api/health` transport and response contract; MSW-disabled browser origin; guest admin denial/redirect flow. |
| **FAILED** | Mock-mode auth fidelity (mock login does not check the password); current workspace config explicitly enables mocks, and source permits that flag in production. No live backend feature endpoint was classified as failed because data-backed endpoints were not safely run. |
| **BLOCKED** | Valid-credential auth, all authenticated admin routes, public data-backed integration, and all database CRUD because the MongoDB target is not confirmed local/test-only and no dedicated test account is available. |
| **NOT TESTED** | Production deployment artifact/config, successful auth flows, real CRUD/data refresh, UI loading/empty/success states against MongoDB, payment provider sandbox, file uploads, and the 10 MSW-bypass endpoints. |

## Recommended next steps

1. Provide or provision an isolated loopback/local test database and dedicated owner/barber test accounts; do not point this suite at a shared or production database.
2. Set `VITE_USE_MOCKS=false` for the real integration run and verify the browser has no MSW controller; keep mock tests in a separate run.
3. Guard against MSW activation in production and correct the mock login's password behavior before relying on mock auth for UI verification.
4. Fix and test the nested error normalization and undeclared RTK Query cache tags.
5. Once isolation and credentials are confirmed, run a small representative CRUD round trip using uniquely named test records, verify persistence, and clean up only those created test records.
