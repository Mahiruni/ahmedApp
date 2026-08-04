import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const publicNavigation = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="biloo-public-page">
      <header className="biloo-public-header">
        <div className="biloo-public-header-inner">
          <Link className="biloo-public-brand" href="/" aria-label="BILOO home">
            <Image
              alt="BILOO app logo"
              height={42}
              priority
              src="/icons/biloo-mark.svg"
              width={42}
            />
            <span>
              <strong>BILOO</strong>
              <small>One app. Every move.</small>
            </span>
          </Link>

          <nav aria-label="Public pages" className="biloo-public-nav">
            {publicNavigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link className="biloo-public-signin" href="/auth/login?next=/biloo">
            Sign in
          </Link>
        </div>
      </header>

      <section className="biloo-public-hero">
        <div className="biloo-public-hero-inner">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
      </section>

      <div className="biloo-public-content">{children}</div>

      <footer className="biloo-public-footer">
        <div className="biloo-public-footer-inner">
          <div className="biloo-public-footer-brand">
            <Image
              alt="BILOO app logo"
              height={38}
              src="/icons/biloo-mark.svg"
              width={38}
            />
            <div>
              <strong>BILOO</strong>
              <span>Operated by BILOO Group · Addis Ababa, Ethiopia</span>
            </div>
          </div>

          <div className="biloo-public-footer-contact">
            <a href="mailto:yenedeen@gmail.com">yenedeen@gmail.com</a>
            <a href="tel:+251924093037">+251 924 093 037</a>
          </div>

          <nav aria-label="Legal pages" className="biloo-public-footer-nav">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>

          <p className="biloo-public-copyright">
            © 2026 BILOO Group. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

export function PublicDocumentSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="biloo-public-document-section">
      <div className="biloo-public-document-number" aria-hidden="true">
        {number}
      </div>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}
