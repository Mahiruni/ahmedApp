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
    <main className="min-h-screen bg-[#eef3f6] px-4 py-8 text-[#10243a] sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#082640] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-[#f2bd4b]/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex rounded-2xl bg-white p-3"><BrandMark /></div>
            <p className="mt-16 max-w-lg text-5xl font-black leading-[1.05] tracking-[-0.045em]">
              One account for every BILOO service.
            </p>
            <p className="mt-6 max-w-md text-base font-medium leading-7 text-white/65">
              Order food, book a ride, shop local markets, source materials and
              manage delivery operations from one secure identity.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {["Secure sessions", "Role-based access", "Realtime orders"].map(
              (item) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-black text-white/75"
                  key={item}
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Link href="/" aria-label="BILOO home">
                <BrandMark />
              </Link>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77a05]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#082640]">
              {title}
            </h1>
            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
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
    <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {message}
    </div>
  );
}

export const authInputClass =
  "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#10243a] outline-none transition placeholder:text-slate-300 focus:border-[#d99a1f] focus:ring-4 focus:ring-[#f2bd4b]/15";

export const authButtonClass =
  "mt-6 h-12 w-full rounded-2xl bg-[#082640] px-5 text-sm font-black text-white shadow-lg shadow-[#082640]/15 transition hover:-translate-y-0.5 hover:bg-[#0b3557]";
