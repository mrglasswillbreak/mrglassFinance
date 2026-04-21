# mrGlassFinance

Personal Finance / Budgeting SaaS built with Next.js, Prisma, PostgreSQL, TanStack Query, Zustand, and Tailwind CSS.

## Features

- Authentication with access + refresh token flow
- Onboarding flow (profile and finance preferences)
- Dashboard KPIs and charts
- Transactions CRUD with filters and pagination
- Monthly budgets and status tracking
- Multi-account support
- Categories management
- Notifications and settings
- Responsive dashboard shell
- PWA manifest support

## Stack

- Next.js App Router (React + TypeScript)
- Prisma + PostgreSQL (`@prisma/adapter-pg`)
- TanStack Query for server state
- Zustand for UI state
- Recharts for analytics visualizations
- React Hook Form + Zod validation

## Development

```bash
npm install
npm run lint
npm test
npm run build
npm run dev
```

## Environment

Set these environment variables in `.env`:

- `DATABASE_URL`
- `JWT_SECRET`

## Database

```bash
npm run prisma:generate
npm run prisma:migrate
```
