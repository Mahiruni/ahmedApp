import type { Metadata } from "next";
import Link from "next/link";

import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in securely to your BILOO account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to BILOO"
      description="Continue to your rides, orders, saved addresses and BILOO workspace."
      footer={
        <p className="biloo-auth-switch">
          New to BILOO? <Link href="/auth/sign-up">Create your account</Link>
        </p>
      }
    >
      <AuthError message={params.error} />
      <LoginForm next={params.next ?? "/biloo"} />
    </AuthShell>
  );
}
