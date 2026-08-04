import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: { absolute: "BILOO" },
  description:
    "BILOO is an Ethiopia-focused super app for taxi booking, food delivery, grocery shopping, construction materials and car parts.",
  applicationName: "BILOO",
  openGraph: {
    title: "BILOO",
    description:
      "BILOO is an Ethiopia-focused super app for taxi booking, food delivery, grocery shopping, construction materials and car parts.",
    siteName: "BILOO",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const services = [
  {
    label: "Taxi booking",
    description:
      "Request local rides, choose pickup and destination locations, and follow trip progress from one BILOO account.",
  },
  {
    label: "Food delivery",
    description:
      "Discover nearby restaurants, order meals and receive preparation and delivery updates.",
  },
  {
    label: "Supermarket shopping",
    description:
      "Shop groceries and household essentials and arrange delivery to a saved address or current location.",
  },
  {
    label: "Construction materials",
    description:
      "Find building supplies from participating vendors for personal, contractor and business projects.",
  },
  {
    label: "Car parts",
    description:
      "Browse vehicle parts and connect with local suppliers through the same trusted BILOO experience.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="OFFICIAL BILOO APP HOMEPAGE"
      title="BILOO"
      description="BILOO helps people in Ethiopia book taxi rides, order food and groceries, buy construction materials and find car parts through one secure customer account."
    >
      <section className="biloo-public-intro-grid" aria-label="BILOO purpose">
        <article className="biloo-public-card biloo-public-card-primary">
          <p className="biloo-public-kicker">WHAT BILOO DOES</p>
          <h2>One practical platform for essential everyday services.</h2>
          <p>
            Customers use BILOO to search for available services, choose a provider,
            place a ride or delivery request, review prices, receive status updates
            and manage their activity without switching between unrelated apps.
          </p>
        </article>

        <article className="biloo-public-card biloo-public-company-card">
          <p className="biloo-public-kicker">APPLICATION AND COMPANY</p>
          <dl>
            <div>
              <dt>Application name</dt>
              <dd>BILOO</dd>
            </div>
            <div>
              <dt>Operating company</dt>
              <dd>BILOO Group</dd>
            </div>
            <div>
              <dt>Founder and CEO</dt>
              <dd>Mahir Aman Biftu</dd>
            </div>
            <div>
              <dt>Primary location</dt>
              <dd>Addis Ababa, Ethiopia</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="biloo-public-section" aria-labelledby="biloo-services-title">
        <div className="biloo-public-section-heading">
          <p className="biloo-public-kicker">BILOO SERVICES</p>
          <h2 id="biloo-services-title">Five connected services, one consistent account.</h2>
          <p>
            BILOO is designed for customers, drivers, delivery partners, stores,
            vendors and administrators. Every service uses the same BILOO identity,
            order history, notifications and support experience.
          </p>
        </div>

        <div className="biloo-public-service-grid">
          {services.map((service, index) => (
            <article className="biloo-public-service-card" key={service.label}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{service.label}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="biloo-public-section" aria-labelledby="biloo-google-title">
        <div className="biloo-public-section-heading">
          <p className="biloo-public-kicker">GOOGLE SIGN-IN</p>
          <h2 id="biloo-google-title">Why BILOO requests basic Google account information.</h2>
          <p>
            “Continue with Google” is an optional sign-in method. With permission,
            BILOO receives basic profile information such as your name, email address,
            profile image and Google account identifier so it can authenticate you,
            create or connect your BILOO account and protect the sign-in process.
            BILOO does not request access to Gmail, Google Drive, contacts or calendars.
          </p>
        </div>
        <div className="biloo-public-value-grid">
          <article>
            <strong>Authentication only</strong>
            <p>Google information is used to sign you in and connect the correct BILOO account.</p>
          </article>
          <article>
            <strong>No sale of Google data</strong>
            <p>BILOO does not sell Google profile information or use it for advertising profiling.</p>
          </article>
          <article>
            <strong>Clear privacy controls</strong>
            <p>Details about collection, use, retention and account choices are available in the Privacy Policy.</p>
          </article>
        </div>
      </section>

      <section className="biloo-public-section biloo-public-values">
        <div className="biloo-public-section-heading">
          <p className="biloo-public-kicker">OUR COMMITMENT</p>
          <h2>Local relevance, clear communication and responsible growth.</h2>
        </div>
        <div className="biloo-public-value-grid">
          <article>
            <strong>Clear choices</strong>
            <p>Users should understand the service, price and status before taking action.</p>
          </article>
          <article>
            <strong>Account security</strong>
            <p>Authentication, permissions and personal information are handled with care.</p>
          </article>
          <article>
            <strong>Accessible design</strong>
            <p>BILOO is built for responsive use across mobile phones and modern browsers.</p>
          </article>
        </div>
      </section>

      <section className="biloo-public-cta">
        <div>
          <p className="biloo-public-kicker">BILOO</p>
          <h2>Move, order and shop through one connected platform.</h2>
          <p>
            Read the BILOO Privacy Policy before creating an account or using Google sign-in.
          </p>
        </div>
        <div>
          <Link className="biloo-public-cta-primary" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="biloo-public-cta-secondary" href="/">
            Return home
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
