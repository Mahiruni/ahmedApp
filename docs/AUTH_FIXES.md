# Authentication repair

Login and signup now return recoverable action state rather than discarding the form on an authentication error. Passwords are passed exactly as entered, and login accepts passwords for existing accounts without imposing the signup length policy.

Signup validates the visible step before continuing. The final submit validates all steps and moves to the first invalid field, so hidden required controls cannot silently block account creation. Inactive steps are inert. Form values, selected region, phone, passwords, and consent survive a failed server action. The artificial saving delay and persistent saving overlay were removed; loading follows the actual action. A signup that already returns a session goes to onboarding immediately; email-confirmed accounts go to the confirmation page.

Session refresh cookies are copied onto proxy redirects. Missing account profiles show a recoverable login error instead of creating a login/workspace redirect loop. Callbacks use the public request host, preserve local return destinations, accept both PKCE codes and email token hashes, and expose useful expired-link errors. `/auth/confirm` supports standard token-hash email templates.

Google sign-in checks the provider's public settings before navigation. A disabled provider shows an in-app message while retaining the email signup form. The Google OAuth flow remains available when the provider is enabled.

## Verification

- `npm run test:auth`: redirect safety and auth-error regression tests.
- `npm run build`: production build and TypeScript compilation.
- `npm run lint`: no errors; six existing unrelated warnings.
- Chromium with an isolated Supabase protocol fixture: failed login retains fields; successful login establishes a session; passwords retain whitespace; refresh cookies survive redirect; missing profiles do not loop; empty signup steps and missing consent are blocked; server errors retain fields and permit retry; signup submits complete normalized metadata and reaches confirmation; disabled Google stays in the application; enabled Google starts PKCE; OAuth and email-token callbacks establish sessions; expired links show recoverable errors.

These browser checks exercise the real Next.js actions, proxy, cookie adapter, and Supabase SDK against a controlled HTTP auth service. They do not prove production credentials or email delivery work.

## Production configuration still needed

The configured project's public auth settings report email signup enabled with confirmation required and Google disabled. A live invalid-credential login returns an auth error through the application. Both connected Supabase accounts were denied access to administer the configured project, so its Google provider, OAuth credentials, redirect allowlist, email delivery, and database profile trigger could not be updated or fully verified in this session. The project's configuration and user data were preserved.

Enable Google in the Supabase project that owns the configured authentication URL using its Google OAuth client ID and secret. Allow the production site's `/auth/callback` redirect and use the Supabase project callback URL in Google Cloud. For email-token templates, use `/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/onboarding`; existing PKCE email links continue to use `/auth/callback`. Verify production SMTP delivery and the profile migration before claiming the full live signup flow is healthy.
