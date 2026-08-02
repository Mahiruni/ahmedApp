import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const reset = params.reset === "1";
  return (
    <AuthShell
      eyebrow="Check your inbox"
      title={reset ? "Reset link sent" : "Confirm your email"}
      description={
        reset
          ? `A password reset link was sent to ${params.email ?? "your email"}.`
          : `A confirmation link was sent to ${params.email ?? "your email"}. Open it to activate your BILOO account.`
      }
    >
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
        The link may take a minute to arrive. Check your spam folder before
        requesting another email.
      </div>
      <Link
        className="mt-6 block h-12 rounded-2xl bg-[#082640] px-5 py-3 text-center text-sm font-black text-white"
        href="/auth/login"
      >
        Return to sign in
      </Link>
    </AuthShell>
  );
}
