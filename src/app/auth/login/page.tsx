import type { Metadata } from "next";
import Link from "next/link";

import { signInWithGoogleAction } from "@/app/auth/actions";
import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { AuthGoogleButton, LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in securely to your BILOO account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/biloo";

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to BILOO"
      description="Access your rides, orders and BILOO workspace."
      footer={
        <p className="biloo-auth-switch-copy">
          New to BILOO? <Link href="/auth/sign-up">Create an account</Link>
        </p>
      }
    >
      <AuthError message={params.error} />

      <form action={signInWithGoogleAction}>
        <input name="next" type="hidden" value={next} />
        <AuthGoogleButton label="Continue with Google" />
      </form>

      <div className="biloo-auth-divider" aria-hidden="true">
        <span />
        <b>or use email</b>
        <span />
      </div>

      <LoginForm next={next} />

      <p className="biloo-auth-legal-copy">
        By continuing, you agree to the BILOO <Link href="/terms">Terms</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}
