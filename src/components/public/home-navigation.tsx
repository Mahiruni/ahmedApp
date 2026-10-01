"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/biloo/ui";
import { useDialog } from "@/hooks/use-dialog";

export function HomeNavigation() {
  const [open, setOpen] = useState(false);
  const dialogRef = useDialog(open, () => setOpen(false));
  return (
    <div className="biloo-home-mobile-navigation">
      <button
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="biloo-home-mobile-menu"
        className="biloo-home-menu-toggle"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <div
        className="biloo-home-menu-overlay"
        data-open={open}
        inert={!open}
        aria-hidden={!open}
      >
        <button
          className="biloo-home-menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          tabIndex={-1}
          type="button"
        />
        <section
          ref={dialogRef}
          tabIndex={-1}
          aria-label="Website navigation"
          aria-modal="true"
          role="dialog"
          id="biloo-home-mobile-menu"
          className="biloo-home-menu-panel"
        >
          <header>
            <strong>Explore BILOO</strong>
            <button
              className="biloo-icon-button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              type="button"
            >
              <Icon name="close" />
            </button>
          </header>
          <nav aria-label="Website navigation">
            <a href="#services" onClick={() => setOpen(false)}>
              Services <Icon name="arrow" />
            </a>
            <a href="#experience" onClick={() => setOpen(false)}>
              Who it is for <Icon name="arrow" />
            </a>
            <a href="#how-it-works" onClick={() => setOpen(false)}>
              How it works <Icon name="arrow" />
            </a>
            <Link href="/about" onClick={() => setOpen(false)}>
              About <Icon name="arrow" />
            </Link>
            <Link href="/auth/login?next=/biloo" onClick={() => setOpen(false)}>
              Sign in <Icon name="customer" />
            </Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
