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
    <main className="min-h-screen bg-white px-4 py-6 text-black sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl overflow-hidden rounded-2xl border border-[#e4e4e4] bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden bg-black p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-xl bg-white p-3">
              <BrandMark />
            </div>
            <p className="mt-14 max-w-sm text-[38px] font-semibold leading-[1.06] tracking-[-0.045em]">
              Move, order and manage everything in one place.
            </p>
            <p className="mt-5 max-w-sm text-[13px] leading-6 text-white/65">
              One secure BILOO account for rides, food, groceries, materials and delivery operations.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/15 pt-5">
            {["Secure sessions", "Role-based access", "Live order updates"].map(
              (item) => (
                <div className="flex items-center gap-3 text-[12px] text-white/75" key={item}>
                  <span className="size-1.5 rounded-full bg-[#06c167]" />
                  {item}
                </div>
              ),
            )}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <Link href="/" aria-label="BILOO home">
                <BrandMark />
              </Link>
            </div>
            <p className="text-[11px] font-medium text-[#777777]">{eyebrow}</p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-black sm:text-[34px]">
              {title}
            </h1>
            <p className="mt-3 text-[13px] leading-5 text-[#6b6b6b]">{description}</p>
            <div className="mt-7">{children}</div>
            {footer ? <div className="mt-7">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg bg-[#fdecec] px-3.5 py-3 text-[12px] font-medium text-[#b42318]">
      {message}
    </div>
  );
}

export const authInputClass =
  "mt-2 h-12 w-full rounded-lg border border-[#dcdcdc] bg-white px-3.5 text-[14px] font-normal text-black outline-none transition placeholder:text-[#8a8a8a] focus:border-black focus:ring-2 focus:ring-black/10";

export const authButtonClass =
  "mt-5 h-12 w-full rounded-lg bg-black px-5 text-[14px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.99]";
