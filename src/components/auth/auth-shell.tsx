import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/biloo/ui";
import type { IconName } from "@/data/biloo";

const authBenefits: Array<{
  icon: IconName;
  label: string;
  detail: string;
}> = [
  {
    icon: "shield",
    label: "Protected access",
    detail: "Secure sessions across your devices",
  },
  {
    icon: "customer",
    label: "One BILOO identity",
    detail: "Rides, delivery, shopping and operations",
  },
  {
    icon: "bell",
    label: "Live progress",
    detail: "Orders, trips and verification updates",
  },
];

const services = ["Taxi", "Food", "Market", "Materials", "Car parts"];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="biloo-auth-page">
      <div className={`biloo-auth-shell${wide ? " biloo-auth-shell-wide" : ""}`}>
        <section className="biloo-auth-story" aria-label="BILOO account benefits">
          <div className="biloo-auth-story-top">
            <Link className="biloo-auth-brand" href="/" aria-label="BILOO home">
              <Image alt="" height={46} priority src="/icons/biloo-mark.svg" width={46} />
              <span>
                <strong>BILOO</strong>
                <small>One app. Every move.</small>
              </span>
            </Link>

            <nav className="biloo-auth-story-nav" aria-label="Public pages">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>

          <div className="biloo-auth-story-copy">
            <span className="biloo-auth-story-kicker">ETHIOPIA&apos;S CONNECTED SUPER APP</span>
            <h2>One trusted account for every everyday move.</h2>
            <p>
              Book a ride, order essentials and manage your BILOO activity through one secure identity built for Ethiopia.
            </p>
            <div className="biloo-auth-service-row" aria-label="BILOO services">
              {services.map((service) => <span key={service}>{service}</span>)}
            </div>
          </div>

          <div className="biloo-auth-benefits">
            {authBenefits.map((benefit) => (
              <article key={benefit.label}>
                <span className="biloo-auth-benefit-icon"><Icon name={benefit.icon} /></span>
                <div>
                  <strong>{benefit.label}</strong>
                  <small>{benefit.detail}</small>
                </div>
              </article>
            ))}
          </div>

          <p className="biloo-auth-location">Addis Ababa, Ethiopia · BILOO Group</p>
        </section>

        <section className="biloo-auth-form-panel">
          <div className="biloo-auth-form-wrap">
            <div className="biloo-auth-form-topbar">
              <Link className="biloo-auth-back" href="/">
                <span aria-hidden="true">←</span> Home
              </Link>
              <span className="biloo-auth-secure-badge">
                <Icon name="shield" /> Secure account
              </span>
            </div>

            <div className="biloo-auth-mobile-brand">
              <Link href="/" aria-label="BILOO home">
                <Image alt="" height={42} priority src="/icons/biloo-mark.svg" width={42} />
                <strong>BILOO</strong>
              </Link>
            </div>

            <header className="biloo-auth-heading">
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>

            <div className="biloo-auth-content">{children}</div>
            {footer ? <footer className="biloo-auth-footer">{footer}</footer> : null}

            <div className="biloo-auth-legal-links" aria-label="Legal links">
              <Link href="/privacy">Privacy</Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms">Terms</Link>
              <span aria-hidden="true">·</span>
              <a href="mailto:yenedeen@gmail.com">Support</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="biloo-auth-error" role="alert">
      <Icon className="size-[17px]" name="alert" />
      <span>{message}</span>
    </div>
  );
}

export const authInputClass = "biloo-auth-input";
export const authButtonClass = "biloo-auth-submit";
