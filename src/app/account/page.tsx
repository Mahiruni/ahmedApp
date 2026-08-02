import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { BrandMark } from "@/components/biloo/ui";
import { requireViewer } from "@/lib/biloo/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await requireViewer();
  return (
    <main className="min-h-screen bg-[#eef3f6] px-4 py-8 text-[#10243a]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <BrandMark />
          <Link
            className="rounded-xl bg-white px-4 py-2 text-sm font-black shadow-sm"
            href="/biloo"
          >
            Back to app
          </Link>
        </div>
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="flex items-center gap-5">
            <div className="grid size-20 place-items-center rounded-[1.5rem] bg-[#082640] text-2xl font-black text-white">
              {viewer.initials}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b77a05]">
                BILOO account
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                {viewer.displayName}
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                {viewer.email}
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Active role
              </p>
              <p className="mt-2 text-lg font-black capitalize">
                {viewer.databaseRole.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                Security
              </p>
              <p className="mt-2 text-lg font-black text-emerald-900">
                Supabase session active
              </p>
            </div>
          </div>
          <form action={signOutAction} className="mt-8">
            <button
              className="h-12 w-full rounded-2xl border border-rose-200 bg-rose-50 text-sm font-black text-rose-700"
              type="submit"
            >
              Sign out of BILOO
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
