import { signOutAction } from "@/app/auth/actions";
import { AccountSettingsClient } from "@/components/account/account-settings-client";
import { requireViewer } from "@/lib/biloo/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await requireViewer();

  return (
    <>
      <AccountSettingsClient viewer={viewer} />
      <section className="biloo-settings-danger-footer">
        <div>
          <span>
            <strong>Sign out of this device</strong>
            <p>Your BILOO account and saved activity will remain available when you return.</p>
          </span>
          <form action={signOutAction}>
            <button type="submit">Sign out of BILOO</button>
          </form>
        </div>
      </section>
    </>
  );
}
