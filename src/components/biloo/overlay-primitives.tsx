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
      className={`fixed inset-0 z-[70] transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        aria-label="Close panel"
        className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-[min(100%,470px)] flex-col bg-white shadow-2xl transition duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-5 sm:px-6">
          <h2 className="text-xl font-black tracking-[-0.03em]">{title}</h2>
          <button
            aria-label="Close"
            className="grid size-10 place-items-center rounded-xl bg-slate-100 text-[#082640]"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
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
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <section
        aria-label={title}
        className={`my-auto w-full overflow-hidden rounded-[1.8rem] bg-white shadow-2xl ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-5 sm:px-6">
          <h2 className="text-xl font-black tracking-[-0.03em]">{title}</h2>
          <button
            aria-label="Close"
            className="grid size-10 place-items-center rounded-xl bg-slate-100 text-[#082640]"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="max-h-[calc(100svh-110px)] overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}
