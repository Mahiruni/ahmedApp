import type { Metadata } from "next";
import Link from "next/link";

import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a secure BILOO customer account for rides, delivery and shopping.",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="CREATE YOUR BILOO IDENTITY"
      title="One account for every BILOO service"
      description="Register with your Ethiopian name, mobile number and local address. Your customer account is protected by Supabase authentication."
      wide
      footer={
        <p className="biloo-auth-switch">
          Already registered? <Link href="/auth/login">Sign in securely</Link>
        </p>
      }
    >
      <div className="biloo-signup-intro">
        <div>
          <span className="biloo-signup-intro-icon">✓</span>
          <span>
            <strong>Customer access starts here</strong>
            <small>Driver and vendor access can be requested during onboarding.</small>
          </span>
        </div>
        <span className="biloo-signup-intro-status">Secure registration</span>
      </div>
      <AuthError message={params.error} />
      <SignUpForm />
    </AuthShell>
  );
}
