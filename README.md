# 🦷 DentaCare Client

Angular 20 frontend for the DentaCare clinic management platform. The client supports public visitors, patients, reception staff, dentists, and administrators and integrates with the separate DentaCare Node.js REST API.

## Core flows

### Public
- Browse clinic home, services, about, and contact pages
- Register and sign in
- Request password-reset OTP and reset password
- Book an appointment with branch, service, dentist, date, time, duration, contact details, reason, and notes

### Patient
- Role-protected patient portal
- View, search, filter, sort, and page through appointments
- View appointment details and audit information
- Reschedule active appointments
- Cancel active appointments
- Patient details are prefilled when booking while signed in

### Staff
- Role-protected bookings workspace for receptionists, dentists, and admins
- Search/filter/sort clinic bookings
- View appointment detail and audit trail
- Edit/reschedule and cancel bookings
- Create appointments through the protected staff API route
- Set appointment status and internal notes

### Admin
- Dashboard
- User management
- Create staff accounts
- Filter/sort users
- Activate or deactivate accounts

## Tech stack

- Angular 20
- Angular Material
- TypeScript
- RxJS + Angular Signals
- Reactive Forms
- Playwright end-to-end testing
- GitHub Actions CI

## Local development

```bash
npm install
npm start
```

The client runs at `http://localhost:4200` and automatically uses `http://localhost:3000/api` for local API requests.

## Runtime API configuration

The same Angular build can be used in different environments. `public/runtime-config.js` is loaded before Angular starts.

For deployment builds, set:

```env
DENTACARE_API_BASE_URL=https://your-api-host.example/api
```

Then run:

```bash
npm run build:deploy
```

The build script writes the runtime API URL into `public/runtime-config.js`. If the variable is omitted in a hosted environment, the client falls back to same-origin `/api`.

A `netlify.toml` is included with the Angular publish directory, Node 20, the deploy build command, and SPA routing fallback.

## Playwright

First-time local setup:

```bash
npm run e2e:setup
```

Run the suite:

```bash
npm run e2e
```

Run headed:

```bash
npm run e2e:headed
```

GitHub Actions installs Chromium and runs the production Angular build plus the full Playwright suite on pull requests and pushes to `main`.

Automated flows currently cover:
- home-to-booking navigation
- booking validation
- complete public appointment submission and API payload
- successful and failed login
- patient portal routing
- admin login and user management
- receptionist/staff bookings routing
- patient protection from admin routes
- protected staff appointment creation
- staff patient fields remaining empty instead of being prefilled with staff identity

## API

Backend repository: https://github.com/oboikanyego/dentacare-api

The backend provides authentication, appointments, users, master data, dentists, email notifications, Swagger documentation, health checks, and API CI tests.

## Author

BK Oboikanyego Radipabe
