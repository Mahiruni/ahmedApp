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
    detail: "Secure sessions powered by Supabase Auth",
  },
  {
    icon: "customer",
    label: "One BILOO identity",
    detail: "Rides, deliveries, shopping and workspaces",
  },
  {
    icon: "bell",
    label: "Live progress",
    detail: "Orders, trips and account updates in one place",
  },
];

const serviceLabels = ["Taxi", "Food", "Market", "Materials", "Car parts"];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="biloo-auth-page">
      <div className="biloo-auth-shell">
        <section className="biloo-auth-story" aria-label="BILOO account benefits">
          <div className="biloo-auth-story-top">
            <Link className="biloo-auth-brand" href="/" aria-label="BILOO home">
              <Image
                alt=""
                height={44}
                priority
                src="/icons/biloo-mark.svg"
                width={44}
              />
              <span>
                <strong>BILOO</strong>
                <small>Connected super app</small>
              </span>
            </Link>

            <nav aria-label="Public pages" className="biloo-auth-public-nav">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>

          <div className="biloo-auth-story-copy">
            <span className="biloo-auth-story-kicker">ONE ACCOUNT. EVERY MOVE.</span>
            <h2>Everything you need, connected through BILOO.</h2>
            <p>
              Book rides, order essentials and manage every service through one
              secure account designed for daily life in Ethiopia.
            </p>

            <div aria-label="BILOO services" className="biloo-auth-service-list">
              {serviceLabels.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>
          </div>

          <div className="biloo-auth-benefits">
            {authBenefits.map((benefit) => (
              <article key={benefit.label}>
                <span className="biloo-auth-benefit-icon">
                  <Icon name={benefit.icon} />
                </span>
                <div>
                  <strong>{benefit.label}</strong>
                  <small>{benefit.detail}</small>
                </div>
              </article>
            ))}
          </div>

          <p className="biloo-auth-story-footer">
            Built for customers, drivers, delivery partners and local vendors.
          </p>
        </section>

        <section className="biloo-auth-form-panel">
          <div className="biloo-auth-form-wrap">
            <div className="biloo-auth-form-topbar">
              <Link className="biloo-auth-mobile-brand" href="/" aria-label="BILOO home">
                <Image alt="" height={38} src="/icons/biloo-mark.svg" width={38} />
                <span>BILOO</span>
              </Link>
              <span className="biloo-auth-secure-label">
                <Icon aria-hidden="true" name="shield" />
                Secure connection
              </span>
            </div>

            <header className="biloo-auth-heading">
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>

            <div className="biloo-auth-content">{children}</div>
            {footer ? <footer className="biloo-auth-footer">{footer}</footer> : null}
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
