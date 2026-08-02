import Link from "next/link";

import {
  AuthError,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/auth-shell";
import { signInAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to BILOO"
      description="Access your orders, rides, saved addresses and role workspace."
      footer={
        <p className="text-center text-sm font-semibold text-slate-500">
          New to BILOO?{" "}
          <Link className="font-black text-[#9b6500]" href="/auth/sign-up">
            Create an account
          </Link>
        </p>
      }
    >
      <AuthError message={params.error} />
      <form action={signInAction}>
        <input name="next" type="hidden" value={params.next ?? "/biloo"} />
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
        <label className="mt-5 block text-sm font-black text-[#10243a]">
          Password
          <input
            autoComplete="current-password"
            className={authInputClass}
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </label>
        <div className="mt-4 text-right">
          <Link
            className="text-xs font-black text-[#9b6500]"
            href="/auth/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <button className={authButtonClass} type="submit">
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
