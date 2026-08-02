# BILOO Phase 2 — Production Foundation

Phase 2 replaces the Phase 1 browser-only prototype with a secure, shared data
foundation based on Supabase Auth, Postgres Row Level Security, transactional
RPCs, and Realtime subscriptions.

## Included

- Cookie-based Supabase Auth for Next.js 16 using `@supabase/ssr`.
- Next.js `proxy.ts` session refresh and optimistic route protection.
- Email/password sign-up, sign-in, sign-out, recovery, callback, and password
  update flows.
- Profile onboarding with customer activation and controlled driver/vendor
  applications.
- A production-oriented Postgres migration with explicit Data API grants and
  RLS on every exposed table.
- Server-validated, atomic product ordering through `place_biloo_order`.
- Server-validated taxi requests through `request_biloo_ride`.
- Customer-scoped Realtime subscriptions for orders and notifications.
- Live account, order, and notification loading in the BILOO application.
- A demo fallback when Supabase environment variables are intentionally absent.

## Security model

- Every new Auth user is created as a `customer`; user metadata is never used
  for authorization.
- Driver and vendor requests are stored as pending role applications.
- Only an admin can approve a role through the guarded
  `review_biloo_role_application` RPC.
- Public clients use only the Supabase publishable key. No service-role or
  secret key is required in the browser.
- Product prices, fees, ride fares, vendor identity, stock checks, and order
  totals are computed in Postgres rather than accepted from the client.
- Security-definer RPCs explicitly validate `auth.uid()`, use an empty
  `search_path`, revoke default PUBLIC execution, and grant only the required
  authenticated access.
- Order status changes are checked by a transition trigger in addition to RLS.

## Setup

1. Create or select a dedicated Supabase project for BILOO.
2. Apply `supabase/migrations/20260802214600_phase2_production_foundation.sql`.
3. Run Supabase Security and Performance Advisors and resolve all findings.
4. Set these deployment variables:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

5. Configure the Auth Site URL and redirect URLs for:
   - `/auth/callback`
   - `/onboarding`
   - `/auth/update-password`
6. Configure custom SMTP before production email sign-up. Supabase's default
   email provider is not intended for unrestricted production delivery.
7. Install dependencies and commit the generated package lockfile before
   deployment.

## Verification checklist

- Sign-up creates exactly one `biloo_profiles` row with role `customer`.
- Unauthenticated requests to `/biloo`, `/account`, and `/onboarding` redirect
  to `/auth/login`.
- A user cannot update `biloo_profiles.role` through the Data API.
- Mixed-vendor carts are rejected before or during order creation.
- Product prices and totals match the database, not client-submitted values.
- An order is visible only to its customer, owning vendor, assigned driver, or
  authorized operations role.
- Realtime updates are received only for rows the subscriber can select under
  RLS.
- Security and Performance Advisors return no unresolved high-severity issue.

## Remaining Phase 2 work after project connection

- Apply and verify the migration against the dedicated BILOO Supabase project.
- Generate canonical TypeScript types from that project and replace the checked
  in bootstrap types.
- Add admin UI for role review, vendor setup, and driver document verification.
- Persist vendor and driver operational dashboards against their authorized
  tables.
- Add automated database tests for RLS and status transitions.
