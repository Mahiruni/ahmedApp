import Link from "next/link";

import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Customer registration"
      title="Create your BILOO account"
      description="Complete your customer profile using your Ethiopian name, mobile number, username and local address."
      footer={
        <p className="text-center text-sm font-semibold text-slate-500">
          Already registered?{" "}
          <Link className="font-black text-[#5146e5]" href="/auth/login">
            Sign in
          </Link>
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
      <SignUpForm />
    </AuthShell>
  );
}
