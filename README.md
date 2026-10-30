# Barbershop Website (Phase 1 MVP)

Full-stack barbershop web application built with a modern React frontend and Node/Express backend.

## Tech Stack
- **Frontend**: Vite, React 18, Plain JavaScript, Tailwind CSS, React Router v6, Redux Toolkit + RTK Query, React Hook Form + Zod, Embla Carousel, Leaflet, Lucide React, Helmet Async, MSW.
- **Backend**: Node.js, Express (ES modules), MongoDB + Mongoose, Zod, JWT.
- **Design System**: Strict CSS variable tokens in `src/styles/tokens.css` mapped to Tailwind classes.

## Project Structure
```
BarberShop/
├── client/                 # React 18 frontend
│   ├── src/
│   │   ├── app/            # Redux store & root setup
│   │   ├── assets/         # Static assets and placeholders
│   │   ├── components/
│   │   │   ├── ui/         # Reusable design primitives (Button, Card, Section...)
│   │   │   ├── layout/     # Navbar, Footer, Layout wrappers
│   │   │   └── common/     # Shared non-primitive components
│   │   ├── config/         # Centralized configuration (site.js)
│   │   ├── features/       # Feature modules (booking, services, etc.)
│   │   ├── lib/            # Utilities (cn, helpers)
│   │   ├── mocks/          # MSW handlers & browser worker
│   │   ├── pages/          # Route pages (Home, Services, etc. + /design-system)
│   │   ├── styles/         # tokens.css & globals.css
│   │   └── types/          # JSDoc type definitions
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # Node / Express backend
│   └── package.json
├── PROJECT_RULES.md        # Master engineering rules
└── package.json            # Monorepo workspaces
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the client dev server
```bash
npm run dev
# or: cd client && npm run dev
```
Open [http://localhost:5173/design-system](http://localhost:5173/design-system) to view the Design System and primitive component verification page.

### 3. Verification & Code Quality
```bash
# Run linting across JavaScript & JSX
npm run lint

# Run production build
npm run build

# Run unit tests
npm test
```
