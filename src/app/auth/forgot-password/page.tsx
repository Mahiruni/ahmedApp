import Link from "next/link";

import {
  AuthError,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/auth-shell";
import { requestPasswordResetAction } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="We will email you a secure link to choose a new password."
      footer={
        <Link
          className="block text-center text-sm font-black text-[#9b6500]"
          href="/auth/login"
        >
          Return to sign in
        </Link>
      }
    >
      <AuthError message={params.error} />
      <form action={requestPasswordResetAction}>
        <label className="block text-sm font-black text-[#10243a]">
          Email address
          <input
            autoComplete="email"
            className={authInputClass}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <button className={authButtonClass} type="submit">
          Send reset link
        </button>
      </form>
    </AuthShell>
  );
}
