import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppEntryGoogleButton } from "@/components/auth/app-entry-actions";
import { getViewer } from "@/lib/biloo/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { signInWithGoogleAction } from "./auth/actions";

export const dynamic = "force-dynamic";

const description =
  "BILOO is Ethiopia's connected super app for taxi booking, food delivery, supermarket shopping, construction materials and car parts.";

export const metadata: Metadata = {
  title: { absolute: "BILOO" },
  description,
  applicationName: "BILOO",
  openGraph: {
    title: "BILOO",
    description,
    siteName: "BILOO",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const services = [
  {
    title: "Taxi booking",
    description: "Request local rides, choose pickup and destination locations, and follow trip progress.",
  },
  {
    title: "Food delivery",
    description: "Order meals from participating restaurants and receive preparation and delivery updates.",
  },
  {
    title: "Supermarket shopping",
    description: "Shop groceries and household essentials and arrange delivery to your location.",
  },
  {
    title: "Construction materials",
    description: "Find and order building supplies from participating local vendors.",
  },
  {
    title: "Car parts",
    description: "Browse vehicle parts and connect with local automotive suppliers.",
  },
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
    <main className="biloo-oauth-homepage">
      <header className="biloo-oauth-header">
        <div className="biloo-oauth-header-inner">
          <Link className="biloo-oauth-brand" href="/" aria-label="BILOO homepage">
            <Image
              alt="BILOO app logo"
              height={44}
              priority
              src="/icons/biloo-mark.svg"
              width={44}
            />
            <span>BILOO</span>
          </Link>

          <nav aria-label="BILOO public pages" className="biloo-oauth-nav">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </header>

      <section className="biloo-oauth-hero" aria-labelledby="biloo-home-title">
        <div className="biloo-oauth-hero-copy">
          <p className="biloo-oauth-eyebrow">ETHIOPIA&apos;S CONNECTED SUPER APP</p>
          <h1 id="biloo-home-title">BILOO</h1>
          <h2>Move, order and shop through one connected application.</h2>
          <p>
            BILOO helps people in Ethiopia book taxi rides, order food and groceries,
            buy construction materials and find car parts through one secure account.
          </p>
          <p>
            Customers can select a service and provider, place a ride or delivery
            request, review prices, receive status notifications and manage their
            activity without switching between unrelated apps.
          </p>
          <div className="biloo-oauth-hero-links">
            <Link href="#biloo-services">Explore BILOO services</Link>
            <Link href="/privacy">Read our Privacy Policy</Link>
          </div>
        </div>

        <div className="biloo-oauth-identity" aria-label="BILOO application identity">
          <Image
            alt="BILOO app logo"
            height={148}
            priority
            src="/icons/biloo-mark.svg"
            width={148}
          />
          <strong>BILOO</strong>
          <span>Operated by BILOO Group</span>
          <small>Addis Ababa, Ethiopia</small>
        </div>
      </section>

      <section className="biloo-oauth-section" id="biloo-services" aria-labelledby="biloo-services-title">
        <div className="biloo-oauth-section-heading">
          <p>APPLICATION FUNCTIONALITY</p>
          <h2 id="biloo-services-title">What users can do with BILOO</h2>
          <span>
            BILOO combines five practical services in one application for customers,
            drivers, delivery partners, stores and local vendors.
          </span>
        </div>

        <div className="biloo-oauth-service-grid">
          {services.map((service, index) => (
            <article key={service.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="biloo-oauth-section biloo-oauth-data" aria-labelledby="biloo-data-title">
        <div className="biloo-oauth-section-heading">
          <p>DATA TRANSPARENCY</p>
          <h2 id="biloo-data-title">Why BILOO requests user information</h2>
          <span>
            BILOO requests only the information needed to operate accounts, rides,
            orders, deliveries and secure authentication.
          </span>
        </div>

        <div className="biloo-oauth-data-grid">
          <article>
            <h3>Account and service information</h3>
            <p>
              BILOO uses account, contact, location and service information to create
              your account, process rides and orders, connect you with drivers or
              vendors, display progress and protect the platform.
            </p>
          </article>
          <article>
            <h3>Google sign-in information</h3>
            <p>
              When you choose Continue with Google, BILOO receives the basic profile
              information you approve, normally your name, email address, profile image
              and Google account identifier. It is used only to authenticate you and
              create or connect your BILOO account.
            </p>
          </article>
          <article>
            <h3>What BILOO does not request</h3>
            <p>
              BILOO does not request access to Gmail, Google Drive, Google Contacts or
              Google Calendar, and BILOO does not sell Google user data.
            </p>
          </article>
        </div>

        <p className="biloo-oauth-privacy-callout">
          Full details about collection, use, retention and user choices are available
          in the <Link href="/privacy">BILOO Privacy Policy</Link>.
        </p>
      </section>

      <section className="biloo-oauth-access" aria-labelledby="biloo-access-title">
        <div>
          <p className="biloo-oauth-eyebrow">ACCESS BILOO</p>
          <h2 id="biloo-access-title">Create an account or sign in</h2>
          <p>
            The information above and BILOO&apos;s legal pages are publicly available
            without requiring an account.
          </p>
        </div>

        <div className="biloo-oauth-actions">
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

          {configured ? (
            <form action={signInWithGoogleAction}>
              <input name="next" type="hidden" value="/biloo" />
              <AppEntryGoogleButton />
            </form>
          ) : (
            <button className="biloo-entry-google" disabled type="button">
              Google sign-in unavailable in preview
            </button>
          )}

          <p className="biloo-oauth-legal">
            By continuing, you agree to BILOO&apos;s <Link href="/terms">Terms of Service</Link>{" "}
            and <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      <footer className="biloo-oauth-footer">
        <div>
          <strong>BILOO</strong>
          <span>Operated by BILOO Group · Addis Ababa, Ethiopia</span>
        </div>
        <nav aria-label="BILOO legal links">
          <Link href="/about">About BILOO</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </main>
  );
}
