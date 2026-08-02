# BILOO Super App

BILOO is a multi-service platform for food delivery, taxi booking, supermarket
shopping, construction materials, and car parts.

## Current build

The repository contains:

- Responsive customer, driver, vendor, and admin workspaces.
- Supabase SSR authentication and account recovery.
- Role-based onboarding and guarded driver/vendor applications.
- Postgres schema, explicit grants, RLS policies, transactional order RPCs, and
  Realtime publications.
- Database-backed customer orders and notifications when Supabase is configured.
- A local demo fallback for interface development without credentials.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Without Supabase variables the interface runs in
demo mode. With valid Supabase variables it requires authentication and uses
shared production data.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## Database

Apply the migration in:

`supabase/migrations/20260802214600_phase2_production_foundation.sql`

Read `docs/PHASE_2_PRODUCTION_FOUNDATION.md` before connecting a production
project.
