import Link from "next/link";

import {
  AuthError,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/auth-shell";
import { signUpAction } from "../actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      eyebrow="Addis Ababa pilot"
      title="Create your account"
      description="Start as a customer. Driver and vendor access are activated after verification."
      footer={
        <p className="text-center text-sm font-semibold text-slate-500">
          Already registered?{" "}
          <Link className="font-black text-[#9b6500]" href="/auth/login">
            Sign in
          </Link>
        </p>
      }
    >
      <AuthError message={params.error} />
      <form action={signUpAction}>
        <label className="block text-sm font-black text-[#10243a]">
          Full name
          <input
            autoComplete="name"
            className={authInputClass}
            name="displayName"
            placeholder="Your full name"
            required
          />
        </label>
        <label className="mt-5 block text-sm font-black text-[#10243a]">
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
            autoComplete="new-password"
            className={authInputClass}
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </label>
        <button className={authButtonClass} type="submit">
          Create secure account
        </button>
      </form>
    </AuthShell>
  );
}
