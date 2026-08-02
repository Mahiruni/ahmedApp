import {
  AuthError,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/auth-shell";
import { updatePasswordAction } from "../actions";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      eyebrow="Security"
      title="Choose a new password"
      description="Use at least eight characters and avoid passwords used on other sites."
    >
      <AuthError message={params.error} />
      <form action={updatePasswordAction}>
        <label className="block text-sm font-black text-[#10243a]">
          New password
          <input
            autoComplete="new-password"
            className={authInputClass}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <button className={authButtonClass} type="submit">
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
