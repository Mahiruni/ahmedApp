import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "About BILOO",
  description:
    "Learn about BILOO Group and the connected Ethiopian super app for rides, delivery and everyday shopping.",
  robots: { index: true, follow: true },
};

const services = [
  {
    label: "Ride",
    description: "Request local taxi trips and follow the journey from pickup to arrival.",
  },
  {
    label: "Food delivery",
    description: "Discover nearby restaurants and order meals through one account.",
  },
  {
    label: "Groceries",
    description: "Shop supermarket essentials and arrange delivery to your location.",
  },
  {
    label: "Construction materials",
    description: "Find building supplies from verified vendors for personal and business projects.",
  },
  {
    label: "Car parts",
    description: "Browse vehicle parts and connect with trusted local suppliers.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="ABOUT BILOO"
      title="One trusted account for everyday movement and commerce."
      description="BILOO is an Ethiopia-focused super app that connects customers with transport, food, groceries, construction materials and car-parts services through one consistent digital experience."
    >
      <section className="biloo-public-intro-grid">
        <article className="biloo-public-card biloo-public-card-primary">
          <p className="biloo-public-kicker">OUR PURPOSE</p>
          <h2>Make essential local services easier to access.</h2>
          <p>
            BILOO brings fragmented daily services into one platform so people can
            book, order, pay, receive updates and manage activity without switching
            between unrelated applications.
          </p>
        </article>

        <article className="biloo-public-card biloo-public-company-card">
          <p className="biloo-public-kicker">COMPANY INFORMATION</p>
          <dl>
            <div>
              <dt>Operating name</dt>
              <dd>BILOO</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>BILOO Group</dd>
            </div>
            <div>
              <dt>Founder and CEO</dt>
              <dd>Mahir Aman Biftu</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Addis Ababa, Ethiopia</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="biloo-public-section">
        <div className="biloo-public-section-heading">
          <p className="biloo-public-kicker">CONNECTED SERVICES</p>
          <h2>Designed around real daily needs.</h2>
          <p>
            Each service uses the same BILOO identity, account, order history,
            notifications and support experience.
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
          <p className="biloo-public-kicker">GET STARTED</p>
          <h2>Move, order and shop with BILOO.</h2>
          <p>Create one customer account and access every available BILOO service.</p>
        </div>
        <div>
          <Link className="biloo-public-cta-primary" href="/auth/sign-up">
            Create account
          </Link>
          <Link className="biloo-public-cta-secondary" href="/">
            Return home
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
