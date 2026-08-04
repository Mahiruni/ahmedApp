import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppEntryGoogleButton } from "@/components/auth/app-entry-actions";
import { getViewer } from "@/lib/biloo/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { signInWithGoogleAction } from "./auth/actions";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const viewer = await getViewer();
    if (viewer) {
      redirect(viewer.onboardingComplete ? "/biloo" : "/onboarding");
    }
  }

  const params = await searchParams;

  return (
    <main className="biloo-entry-page">
      <div aria-hidden="true" className="biloo-entry-orbit biloo-entry-orbit-one" />
      <div aria-hidden="true" className="biloo-entry-orbit biloo-entry-orbit-two" />

      <section className="biloo-entry-shell" aria-labelledby="biloo-entry-title">
        <header className="biloo-entry-brand">
          <Image
            alt=""
            height={48}
            priority
            src="/icons/biloo-mark.svg"
            width={48}
          />
          <span>
            <strong>BILOO</strong>
            <small>One app. Every move.</small>
          </span>
        </header>

        <div className="biloo-entry-hero">
          <p className="biloo-entry-eyebrow">ETHIOPIA&apos;S CONNECTED SUPER APP</p>
          <h1 id="biloo-entry-title">
            <strong>Move.</strong> Order.
            <br />
            <strong>Live.</strong> BILOO.
          </h1>
          <p className="biloo-entry-description">
            Rides, food, groceries, construction materials and car parts—one
            trusted account for every everyday move.
          </p>
        </div>

        <div className="biloo-entry-signature" aria-label="BILOO services">
          <Image
            alt="BILOO"
            height={112}
            priority
            src="/icons/biloo-mark.svg"
            width={112}
          />
          <div>
            <strong>BILOO</strong>
            <span>Ride · Deliver · Shop</span>
          </div>
        </div>

        <div className="biloo-entry-proof">
          <span aria-hidden="true">✓</span>
          <p>
            <strong>Built for daily life in Ethiopia</strong>
            <small>Secure accounts, local services and real-time progress.</small>
          </p>
        </div>

        <div className="biloo-entry-actions">
          {params.error ? (
            <div className="biloo-entry-error" role="alert">
              {params.error}
            </div>
          ) : null}

          <Link className="biloo-entry-primary" href="/auth/sign-up">
            Create account
          </Link>
          <Link className="biloo-entry-secondary" href="/auth/login?next=/biloo">
            I have an account
          </Link>

          <div className="biloo-entry-divider" aria-hidden="true">
            <span />
            <b>or</b>
            <span />
          </div>

          {configured ? (
            <form action={signInWithGoogleAction}>
              <input name="next" type="hidden" value="/biloo" />
              <AppEntryGoogleButton />
            </form>
          ) : (
            <button className="biloo-entry-google" disabled type="button">
              <span>Google sign-in unavailable in preview</span>
            </button>
          )}

          <p className="biloo-entry-legal">
            By continuing, you agree to BILOO&apos;s Terms and Privacy Notice.
          </p>
        </div>
      </section>
    </main>
  );
}
