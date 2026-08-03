# BILOO Phase 2.2 — Role Activation and Verification

Phase 2.2 turns driver and vendor onboarding into a complete production workflow.
It extends the Phase 2 Supabase foundation with structured application data,
transactional onboarding, an administrator review center, and atomic operational
activation.

## Delivered

- Role-aware onboarding for customers, drivers, and vendor owners.
- Driver applications capture vehicle type and plate number.
- Vendor applications capture legal name, storefront name, and service vertical.
- Applicant details are stored in `biloo_role_applications.application_data`.
- Profile completion and role application creation run in one guarded Postgres
  transaction through `complete_biloo_onboarding`.
- A production admin verification center is available at
  `/admin/role-applications` and `/admin` redirects to it.
- Admins can filter pending, approved, rejected, and all applications.
- Review actions use the guarded `review_biloo_role_application` RPC.
- Approved driver applications create or update a verified
  `biloo_driver_profiles` row.
- Approved vendor applications create or update a verified `biloo_vendors` row.
- Approval updates the user's role, creates the operational record, notifies the
  applicant, and writes an audit event atomically.
- Reviewed applications cannot be processed twice.

## Security model

- Only authenticated users can execute `complete_biloo_onboarding`.
- The onboarding function derives the user from `auth.uid()` and never accepts a
  user ID from the browser.
- Only users whose database role is `admin` can approve or reject applications.
- Authorization is based on `biloo_profiles.role`, not user-editable Auth
  metadata.
- The private functions use `SECURITY DEFINER`, an empty `search_path`, explicit
  authentication and authorization checks, and no direct client grants.
- Public wrapper functions expose only the required authenticated operations.
- Applicant data must be a JSON object and is validated for the requested role.
- Vendor service types are restricted to food, supermarket, construction, and
  car parts. Taxi activation remains part of the driver workflow.

## Database migrations

- `20260803120000_phase2_2_role_activation.sql`
- `20260803121000_phase2_2_onboarding_transaction.sql`

Both migrations have been applied to the connected `Biloo App` Supabase project.

## Verification checklist

- Customer onboarding completes without creating a role application.
- Driver onboarding rejects missing vehicle or plate information.
- Vendor onboarding rejects missing business information or an unsupported
  service type.
- Profile completion and application creation either both succeed or both roll
  back.
- Non-admin users cannot load other applicants under RLS.
- Non-admin users cannot execute a role review successfully.
- Driver approval creates a verified driver profile with submitted vehicle data.
- Vendor approval creates a verified vendor record with submitted business data.
- A reviewed application cannot be approved or rejected again.
- Approval and rejection each create a notification and audit event.

## Next Phase 2 work

- Persist driver queue, active assignment stages, availability, and earnings.
- Persist vendor order management, branch availability, products, and inventory.
- Add document upload and storage policies for license and identity verification.
- Add automated SQL tests for RLS, onboarding, activation, and order transitions.
