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
        className={`absolute inset-0 bg-[#07111f]/58 backdrop-blur-md transition duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        className={`absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] max-w-[490px] flex-col overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/94 shadow-[0_34px_100px_rgba(7,17,31,0.32)] backdrop-blur-2xl transition duration-300 sm:inset-y-3 sm:right-3 sm:w-[min(100%-1.5rem,490px)] ${
          open ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-200/70 px-5 sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">BILOO workspace</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-[#101828]">{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="grid size-10 place-items-center rounded-xl bg-[#eef3f8] text-[#0a1b31] transition hover:rotate-6 hover:bg-[#0a1b31] hover:text-white"
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
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#07111f]/62 p-3 backdrop-blur-md sm:p-5">
      <section
        aria-label={title}
        className={`my-auto w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_36px_120px_rgba(7,17,31,0.38)] backdrop-blur-2xl ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="flex h-[74px] items-center justify-between border-b border-slate-200/70 px-5 sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Connected experience</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-[#101828]">{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="grid size-10 place-items-center rounded-xl bg-[#eef3f8] text-[#0a1b31] transition hover:rotate-6 hover:bg-[#0a1b31] hover:text-white"
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
