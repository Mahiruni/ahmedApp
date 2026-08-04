import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark, Icon } from "@/components/biloo/ui";
import type { IconName } from "@/data/biloo";

const authBenefits: Array<{
  icon: IconName;
  label: string;
  detail: string;
}> = [
  {
    icon: "shield",
    label: "Protected sessions",
    detail: "Secure account access across devices",
  },
  {
    icon: "customer",
    label: "Role-based workspace",
    detail: "Customer, driver, vendor and admin access",
  },
  {
    icon: "bell",
    label: "Live updates",
    detail: "Orders, payments and verification status",
  },
];

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
          <div>
            <Link className="biloo-auth-brand" href="/" aria-label="BILOO home">
              <BrandMark />
            </Link>
            <span className="biloo-auth-story-kicker">One account. Every service.</span>
            <h2>Move, order and operate with confidence.</h2>
            <p>
              A secure BILOO identity connects rides, food, groceries, materials, deliveries and operational workspaces.
            </p>
          </div>

          <div className="biloo-auth-benefits">
            {authBenefits.map((benefit) => (
              <article key={benefit.label}>
                <span><Icon name={benefit.icon} /></span>
                <div><strong>{benefit.label}</strong><small>{benefit.detail}</small></div>
              </article>
            ))}
          </div>
        </section>

        <section className="biloo-auth-form-panel">
          <div className="biloo-auth-form-wrap">
            <div className="biloo-auth-mobile-brand">
              <Link href="/" aria-label="BILOO home"><BrandMark /></Link>
              <span>Secure account</span>
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
