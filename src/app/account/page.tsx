import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { BrandMark, Icon } from "@/components/biloo/ui";
import { requireViewer } from "@/lib/biloo/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await requireViewer();
  return (
    <main className="biloo-account-page">
      <header className="biloo-account-topbar">
        <BrandMark />
        <Link className="biloo-button biloo-button-soft" href="/biloo">
          <Icon className="size-[16px] rotate-180" name="arrow" />
          Back to app
        </Link>
      </header>

      <section className="biloo-account-shell">
        <div className="biloo-account-profile">
          <div className="biloo-account-avatar">{viewer.initials}</div>
          <div className="biloo-account-profile-copy">
            <span>BILOO account</span>
            <h1>{viewer.displayName}</h1>
            <p>{viewer.email}</p>
          </div>
          <span className="biloo-account-status"><i /> Connected</span>
        </div>

        <div className="biloo-account-grid">
          <article className="biloo-account-card">
            <span><Icon name="customer" /></span>
            <div><small>Active role</small><strong>{viewer.databaseRole.replaceAll("_", " ")}</strong><p>Your current operational access.</p></div>
          </article>
          <article className="biloo-account-card">
            <span><Icon name="shield" /></span>
            <div><small>Security</small><strong>Session protected</strong><p>Supabase authentication is active.</p></div>
          </article>
          <article className="biloo-account-card">
            <span><Icon name="bell" /></span>
            <div><small>Updates</small><strong>Notifications enabled</strong><p>Order and workspace changes appear in BILOO.</p></div>
          </article>
          <article className="biloo-account-card">
            <span><Icon name="location" /></span>
            <div><small>Primary city</small><strong>Addis Ababa</strong><p>Location-aware services and operations.</p></div>
          </article>
        </div>

        <section className="biloo-account-security">
          <div>
            <span>Account session</span>
            <h2>Securely signed in</h2>
            <p>Sign out only when you are finished using this device.</p>
          </div>
          <form action={signOutAction}>
            <button className="biloo-button biloo-button-danger-soft" type="submit">
              <Icon className="size-[17px]" name="close" />
              Sign out of BILOO
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
