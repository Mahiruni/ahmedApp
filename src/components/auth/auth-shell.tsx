import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/biloo/ui";

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
    <main className="min-h-screen bg-[#f4f4f1] px-4 py-5 text-[#090a0c] sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_28px_90px_rgba(0,3,8,0.12)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-[#000308] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-28 size-[28rem] rounded-full bg-[#f2d019]/18 blur-3xl" />
          <div className="relative">
            <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
              <BrandMark />
            </div>
            <div className="mt-16 inline-flex rounded-full bg-[#f2d019] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#000308]">
              One account. Every service.
            </div>
            <p className="mt-6 max-w-lg text-5xl font-black leading-[0.98] tracking-[-0.055em]">
              Move through your city with one trusted identity.
            </p>
            <p className="mt-6 max-w-md text-base font-medium leading-7 text-white/62">
              Order, ride, shop, sell and deliver through one secure BILOO account built for everyday use.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {["Secure access", "Verified roles", "Live activity"].map((item) => (
              <div
                className="rounded-2xl border border-white/12 bg-white/6 p-4 text-xs font-black text-white/75"
                key={item}
              >
                <span className="mb-3 block h-1.5 w-7 rounded-full bg-[#f2d019]" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9 lg:hidden">
              <Link aria-label="BILOO home" href="/">
                <BrandMark />
              </Link>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.19em] text-[#807000]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[2.25rem] font-black leading-[1.02] tracking-[-0.045em] text-[#000308] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm font-medium leading-6 text-[#68696c]">
              {description}
            </p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {message}
    </div>
  );
}

export const authInputClass =
  "mt-2 h-[52px] w-full rounded-xl border border-[#deded8] bg-white px-4 text-[15px] font-semibold text-[#090a0c] outline-none transition placeholder:text-[#a1a19d] focus:border-[#000308] focus:ring-4 focus:ring-[#f2d019]/35";

export const authButtonClass =
  "mt-6 h-[52px] w-full rounded-xl bg-[#f2d019] px-5 text-sm font-black text-[#000308] shadow-[0_10px_24px_rgba(242,208,25,0.24)] transition hover:-translate-y-0.5 hover:bg-[#f4ff00] active:translate-y-0 active:bg-[#dac000]";
