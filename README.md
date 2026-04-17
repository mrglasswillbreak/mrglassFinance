# MrGlassFinance

MrGlassFinance is a multi-tenant personal finance SaaS built with Next.js App Router and Prisma.  
It supports account management, transaction tracking, budgeting, insights, notifications, and JWT-based authentication.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma 7
- **Database:** PostgreSQL
- **Auth:** JWT + HttpOnly cookies
- **State/Data:** React Query + Zustand
- **UI:** Tailwind CSS + custom UI components

## Core Features

- Multi-tenant user and membership model
- Secure registration/login/refresh/logout flow
- Accounts, categories, and transaction CRUD APIs
- Budget creation and status tracking
- Dashboard KPIs and spending insights
- User profile/preferences and notification APIs

## Project Structure

```text
src/
  app/                  # App Router pages and API route handlers
  components/           # Reusable UI/layout components
  lib/                  # Auth, Prisma, validation, API helpers
  providers/            # React providers (query client, etc.)
  store/                # Client state (Zustand)
prisma/
  schema.prisma         # Data model
```

## Required Environment Variables

Create a `.env` file in the project root (or configure in Vercel project settings):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mrglassfinance?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
```

### Variable Reference

- `DATABASE_URL` (**required**)  
  PostgreSQL connection string used by Prisma at runtime and during build steps that execute server logic.

- `JWT_SECRET` (**required**)  
  Secret used to sign and verify JWT access tokens. Use a long, random value in production.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (`.env`).
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start local development server
- `npm run build` — generate Prisma client and build Next.js app
- `npm run start` — run production server
- `npm run lint` — run ESLint
- `npm test` — run unit tests (Jest)
- `npm run test:e2e` — run Playwright end-to-end tests
- `npm run prisma:generate` — regenerate Prisma client
- `npm run prisma:migrate` — run Prisma migrations

## Deployment (Vercel)

1. Add `DATABASE_URL` and `JWT_SECRET` in your Vercel project environment variables.
2. Ensure variables are available to the environments you deploy from (Preview/Production).
3. Deploy normally; the build command runs:
   ```bash
   prisma generate && next build
   ```

## Quality Checks

Use the standard validation flow before shipping changes:

```bash
npm run lint && npm test && npm run build
```
