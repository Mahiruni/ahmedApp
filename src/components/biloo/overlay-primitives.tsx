"use client";

import type { ReactNode } from "react";

import { Icon } from "./ui";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden={!open}
      className="biloo-overlay"
      data-open={open}
    >
      <button
        aria-label="Close panel"
        className="biloo-overlay-backdrop"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className="biloo-drawer-sheet"
        role="dialog"
      >
        <div className="biloo-sheet-handle" aria-hidden="true" />
        <header className="biloo-overlay-header">
          <div>
            <span>BILOO workspace</span>
            <h2>{title}</h2>
          </div>
          <button aria-label="Close" className="biloo-icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </header>
        <div className="biloo-overlay-content">{children}</div>
      </section>
    </div>
  );
}

export function Modal({
  onClose,
  title,
  children,
  wide = false,
}: {
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="biloo-overlay biloo-overlay-modal" data-open="true">
      <button aria-label="Close dialog" className="biloo-overlay-backdrop" onClick={onClose} type="button" />
      <section
        aria-label={title}
        aria-modal="true"
        className="biloo-modal-sheet"
        data-wide={wide}
        role="dialog"
      >
        <div className="biloo-sheet-handle" aria-hidden="true" />
        <header className="biloo-overlay-header">
          <div>
            <span>Connected experience</span>
            <h2>{title}</h2>
          </div>
          <button aria-label="Close" className="biloo-icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </header>
        <div className="biloo-overlay-content">{children}</div>
      </section>
    </div>
  );
}
