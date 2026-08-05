import type { Metadata } from "next";
import Link from "next/link";

import { signInWithGoogleAction } from "@/app/auth/actions";
import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { AuthGoogleButton } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a secure BILOO customer account for rides, delivery and shopping.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="JOIN BILOO"
      title="Create your BILOO account"
      description="One secure profile for taxi rides, food, groceries, construction materials and car parts."
      footer={
        <p className="biloo-auth-switch-copy">
          Already registered? <Link href="/auth/login">Sign in</Link>
        </p>
      }
    >
      <div className="biloo-signup-intro">
        <span>
          <strong>Customer account</strong>
          <small>Driver and vendor access can be requested after registration.</small>
        </span>
        <span className="biloo-signup-intro-status">Secure signup</span>
      </div>

      <AuthError message={params.error} />

      <form action={signInWithGoogleAction}>
        <input name="next" type="hidden" value="/onboarding" />
        <AuthGoogleButton label="Continue with Google" />
      </form>

      <div className="biloo-auth-divider" aria-hidden="true">
        <span />
        <b>or create with email</b>
        <span />
      </div>

      <SignUpForm />
    </AuthShell>
  );
}
