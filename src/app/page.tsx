import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppEntryGoogleButton } from "@/components/auth/app-entry-actions";
import { getViewer } from "@/lib/biloo/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { signInWithGoogleAction } from "./auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "BILOO" },
  description:
    "BILOO is Ethiopia's connected super app for taxi booking, food delivery, supermarket shopping, construction materials and car parts.",
  applicationName: "BILOO",
  robots: { index: true, follow: true },
};

const services = [
  "Taxi booking",
  "Food delivery",
  "Supermarket shopping",
  "Construction materials",
  "Car parts",
];

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
            alt="BILOO app logo"
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
          <h1 id="biloo-entry-title">BILOO</h1>
          <p className="biloo-entry-description">
            BILOO helps people in Ethiopia book taxi rides, order food and
            groceries, buy construction materials and find car parts through one
            secure customer account.
          </p>
          <p className="biloo-entry-description">
            Customers can choose a service, select a provider, place a ride or
            delivery request, review prices, receive status updates and manage
            their activity in one app.
          </p>

          <ul className="biloo-entry-service-list" aria-label="BILOO app functionality">
            {services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>

        <section
          aria-labelledby="biloo-entry-data-title"
          className="biloo-entry-data-card"
        >
          <p className="biloo-entry-data-kicker">DATA TRANSPARENCY</p>
          <h2 id="biloo-entry-data-title">Why BILOO requests your information</h2>
          <p>
            BILOO collects the account, contact, location and service information
            needed to create your account, process rides and orders, connect you
            with drivers or vendors, show service progress and protect the platform.
          </p>
          <p>
            When you choose <strong>Continue with Google</strong>, BILOO requests
            only the basic Google profile information you approve—typically your
            name, email address, profile image and account identifier. This data is
            used only to authenticate you, create or connect your BILOO account and
            secure the sign-in process.
          </p>
          <p>
            BILOO does not request access to Gmail, Google Drive, contacts or
            calendars, and does not sell Google user data. Read the complete{" "}
            <Link href="/privacy">BILOO Privacy Policy</Link>.
          </p>
        </section>

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
            <span>Taxi · Food · Grocery · Materials · Car parts</span>
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
            By continuing, you agree to BILOO&apos;s{" "}
            <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <nav aria-label="BILOO public information" className="biloo-entry-public-links">
            <Link href="/about">About BILOO</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms">Terms of Service</Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
