# BILOO Super App

BILOO is a multi-service platform for food delivery, taxi booking, supermarket
shopping, construction materials, and car parts.

## Current build

The repository contains:

- Responsive customer, driver, vendor, and admin workspaces.
- Supabase SSR authentication and account recovery.
- Role-based onboarding with structured driver and vendor application details.
- A live admin verification center at `/admin/role-applications`.
- Atomic approval that activates a verified driver profile or vendor business.
- Postgres schema, explicit grants, RLS policies, transactional RPCs, and
  Realtime publications.
- Database-backed customer orders and notifications when Supabase is configured.
- A local demo fallback for interface development without credentials.
- GitHub Actions validation for TypeScript, ESLint, and the production build.

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

Apply the migrations in `supabase/migrations` in timestamp order.

Production foundation:

- `20260802214600_phase2_production_foundation.sql`

Phase 2.2 role activation:

- `20260803120000_phase2_2_role_activation.sql`
- `20260803121000_phase2_2_onboarding_transaction.sql`
- `20260803122000_phase2_2_application_index_cleanup.sql`

Read these implementation notes before connecting or changing production:

- `docs/PHASE_2_PRODUCTION_FOUNDATION.md`
- `docs/PHASE_2_2_ROLE_ACTIVATION.md`
