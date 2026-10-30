# Barbershop Website Project Rules & Master Context

## Master Context
You are a senior full-stack engineer building a barbershop website for a real client. The frontend is React + JavaScript, the backend is Node/Express/MongoDB, also in JavaScript (ES modules).

### PROJECT
- **Design**: Transparent navbar over a full-width hero photo; hero with an appointment form card and a large right-aligned headline; location/service section on dark brown; works gallery slider plus testimonial card and price list on cream; team section on white; footer.
- **Scope**: Phase 1 (MVP): pages Home, Services, Gallery, Barbers, Book Appointment, About, Contact; an admin panel; a booking API.

### STACK
- **Client**: Vite, React 18, JavaScript, Tailwind CSS, React Router v6, Redux Toolkit + RTK Query, React Hook Form + Zod, Embla Carousel, react-leaflet, lucide-react, react-helmet-async, MSW for mocks.
- **Server**: Node, Express, JavaScript, Mongoose, Zod, JWT in an httpOnly cookie.

### ENGINEERING RULES
1. **Design tokens only**: Colors, fonts, radius and spacing come from `src/styles/tokens.css` and the Tailwind theme. Never hardcode hex values or arbitrary pixel values inside components.
2. **Shop data centralized**: All shop-specific data (name, address, phone, hours, currency, social links, nav links) comes from `src/config/site.js`. Never hardcode it in components.
3. **Folder structure**: Feature code lives in `src/features/<feature>`. Shared UI lives in `src/components/ui`.
4. **Component conventions**: Components are small, reusable function components in `.jsx` files and accept a `className` prop. Document props and shared data shapes with JSDoc. Plain JavaScript only: use `.js`/`.jsx` files; do not add tsconfig files or type annotations.
5. **State management**: Server data only through RTK Query; shared client state through Redux slices (`booking draft`, `ui`, `auth`); everything else stays local.
6. **Validation**: Validate all external data (forms, API bodies, environment variables) at runtime with Zod. Forms use React Hook Form + Zod, show inline errors, and disable submit while pending.
7. **Accessibility (WCAG AA)**: Semantic landmarks, a label for every input, visible focus states, `aria-label` on icon-only buttons, keyboard-operable carousels, AA contrast.
8. **Responsive**: Mobile-first with breakpoints `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. Verify at 360px width.
9. **Performance**: Lazy-load routes and below-the-fold images, use WebP, avoid layout shift (set aspect-ratio or width/height).
10. **Code quality**: ESLint (react, react-hooks, jsx-a11y plugins) and Prettier clean, no unused code, no console.log, meaningful names, comments only where the reason is not obvious.
11. **Prompt completion format**: At the end of every prompt, list:
    - Files created or changed
    - How to run and verify the result (`npm run lint`, `npm run build`, desktop & 360px mobile check)
    - Anything unsure about
    - Do not start the next prompt on your own.
