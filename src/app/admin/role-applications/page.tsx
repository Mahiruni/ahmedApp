import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark, Icon, StatusPill } from "@/components/biloo/ui";
import { requireViewer } from "@/lib/biloo/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json, ProfileRow } from "@/types/database";

import { reviewRoleApplicationAction } from "./actions";

export const dynamic = "force-dynamic";

type ApplicationRow =
  Database["public"]["Tables"]["biloo_role_applications"]["Row"];
type ApplicationStatus = ApplicationRow["status"] | "all";

const filters: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All applications" },
];

function safeStatus(value?: string): ApplicationStatus {
  return filters.some((filter) => filter.value === value)
    ? (value as ApplicationStatus)
    : "pending";
}

function applicationRecord(value: Json) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }
  return {};
}

function detail(value: Json, key: string) {
  const candidate = applicationRecord(value)[key];
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : "Not supplied";
}

function formatDate(value: string | null) {
  if (!value) return "Not reviewed";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

function statusTone(status: ApplicationRow["status"]) {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "warning" as const;
}

export default async function RoleApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    notice?: string;
    error?: string;
  }>;
}) {
  const viewer = await requireViewer();
  if (viewer.databaseRole !== "admin") redirect("/biloo");

  const params = await searchParams;
  const activeStatus = safeStatus(params.status);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("biloo_role_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) throw new Error(`Unable to load role applications: ${error.message}`);

  const applications = (data ?? []) as ApplicationRow[];
  const profileIds = [...new Set(applications.map((application) => application.user_id))];
  const profiles = new Map<string, ProfileRow>();

  if (profileIds.length) {
    const { data: profileData, error: profileError } = await supabase
      .from("biloo_profiles")
      .select("*")
      .in("id", profileIds);

    if (profileError) {
      throw new Error(`Unable to load applicant profiles: ${profileError.message}`);
    }

    for (const profile of (profileData ?? []) as ProfileRow[]) {
      profiles.set(profile.id, profile);
    }
  }

  const visibleApplications = applications.filter(
    (application) => activeStatus === "all" || application.status === activeStatus,
  );
  const pendingCount = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === "approved",
  ).length;
  const rejectedCount = applications.filter(
    (application) => application.status === "rejected",
  ).length;

  return (
    <main className="min-h-screen bg-[#eef3f8] text-[#101828]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 px-4 py-3 backdrop-blur-2xl sm:px-6">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 sm:inline-flex">
              Phase 2.2 live operations
            </span>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0a1b31] px-4 text-xs font-black text-white transition hover:bg-[#123b66]"
              href="/biloo"
            >
              <Icon className="size-4 rotate-180" name="arrow" />
              Back to BILOO
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-[#07111f] px-6 py-8 text-white shadow-[0_30px_90px_rgba(7,17,31,0.22)] sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-[#55e6b1]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-1/3 size-80 rounded-full bg-[#ffca68]/12 blur-3xl" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#55e6b1] shadow-[0_0_0_7px_rgba(85,230,177,0.12)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Identity and access operations
                </p>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Verification that activates the business.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                Review driver and vendor applications, record a decision, create the operational profile atomically, and notify the applicant from one secure command center.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4 backdrop-blur-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                Signed in as
              </p>
              <p className="mt-2 text-sm font-black">{viewer.displayName}</p>
              <p className="mt-1 text-xs text-white/40">Administrator · Addis operations</p>
            </div>
          </div>
        </section>

        {params.notice ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {params.notice}
          </div>
        ) : null}
        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
            {params.error}
          </div>
        ) : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [String(applications.length), "Total applications", "All recorded", "receipt" as const],
            [String(pendingCount), "Pending review", "Action required", "clock" as const],
            [String(approvedCount), "Approved", "Access activated", "check" as const],
            [String(rejectedCount), "Rejected", "Decision recorded", "alert" as const],
          ].map(([value, label, helper, icon]) => (
            <article
              className="rounded-[1.55rem] border border-white bg-white/90 p-5 shadow-[0_14px_45px_rgba(24,39,65,0.06)]"
              key={label}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-black tracking-[-0.04em]">{value}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    {helper}
                  </p>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-[#eef3f8] text-[#0a1b31]">
                  <Icon name={icon} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <nav className="mt-6 flex gap-2 overflow-x-auto rounded-[1.35rem] border border-white bg-white/88 p-2 shadow-sm">
          {filters.map((filter) => {
            const active = activeStatus === filter.value;
            return (
              <Link
                className={`min-h-11 shrink-0 rounded-xl px-4 text-xs font-black transition ${
                  active
                    ? "bg-[#0a1b31] text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#0a1b31]"
                }`}
                href={`/admin/role-applications?status=${filter.value}`}
                key={filter.value}
              >
                <span className="flex h-full items-center">{filter.label}</span>
              </Link>
            );
          })}
        </nav>

        <section className="mt-6 space-y-4">
          {visibleApplications.map((application) => {
            const profile = profiles.get(application.user_id);
            const isDriver = application.requested_role === "driver";
            const title = isDriver ? "Driver application" : "Vendor application";
            const data = application.application_data;

            return (
              <article
                className="overflow-hidden rounded-[1.8rem] border border-white bg-white/92 shadow-[0_18px_55px_rgba(24,39,65,0.07)]"
                key={application.id}
              >
                <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <span
                          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                            isDriver
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <Icon name={isDriver ? "driver" : "vendor"} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-black tracking-[-0.035em]">
                              {profile?.display_name ?? "BILOO applicant"}
                            </h2>
                            <StatusPill tone={statusTone(application.status)}>
                              {application.status}
                            </StatusPill>
                          </div>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {title} · Submitted {formatDate(application.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-500">
                        {application.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Email", profile?.email ?? "Not supplied"],
                        ["Phone", profile?.phone ?? "Not supplied"],
                        ["City", profile?.city ?? "Not supplied"],
                        ["Account", profile?.status ?? "Unknown"],
                      ].map(([label, value]) => (
                        <div className="rounded-2xl bg-[#f3f6f9] p-4" key={label}>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                            {label}
                          </p>
                          <p className="mt-2 truncate text-sm font-black text-[#10243a]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-[1.4rem] border border-slate-200/80 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Activation details
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {isDriver ? (
                          <>
                            <Detail label="Vehicle type" value={detail(data, "vehicle_type")} />
                            <Detail label="Plate number" value={detail(data, "plate_number")} />
                            <Detail label="Activation result" value="Verified driver profile" />
                          </>
                        ) : (
                          <>
                            <Detail label="Legal name" value={detail(data, "legal_name")} />
                            <Detail label="Storefront" value={detail(data, "display_name")} />
                            <Detail label="Service" value={detail(data, "service_type")} />
                          </>
                        )}
                      </div>
                    </div>

                    {application.status !== "pending" ? (
                      <div className="mt-5 rounded-[1.35rem] bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-black text-slate-600">
                            Reviewed {formatDate(application.reviewed_at)}
                          </p>
                          <StatusPill tone={statusTone(application.status)}>
                            Decision complete
                          </StatusPill>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {application.notes || "No reviewer note was recorded."}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <aside className="border-t border-slate-200/70 bg-[#f8fafc] p-5 sm:p-6 lg:border-l lg:border-t-0">
                    {application.status === "pending" ? (
                      <form action={reviewRoleApplicationAction}>
                        <input name="applicationId" type="hidden" value={application.id} />
                        <input name="currentFilter" type="hidden" value={activeStatus} />
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Admin decision
                        </p>
                        <h3 className="mt-2 text-xl font-black tracking-[-0.035em]">
                          Activate this workspace?
                        </h3>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          Approval changes the account role, creates the verified operational record, sends a notification, and writes an audit event in one transaction.
                        </p>
                        <label className="mt-5 block text-xs font-black text-slate-600">
                          Reviewer notes
                          <textarea
                            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-[#123b66] focus:ring-4 focus:ring-[#55e6b1]/10"
                            maxLength={600}
                            name="notes"
                            placeholder="Record verification checks, missing documents or the decision rationale."
                          />
                        </label>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                            className="min-h-12 rounded-xl border border-rose-200 bg-white px-3 text-xs font-black text-rose-700 transition hover:bg-rose-50"
                            name="decision"
                            type="submit"
                            value="rejected"
                          >
                            Reject
                          </button>
                          <button
                            className="min-h-12 rounded-xl bg-[#0a1b31] px-3 text-xs font-black text-white shadow-[0_12px_30px_rgba(7,17,31,0.18)] transition hover:bg-[#123b66]"
                            name="decision"
                            type="submit"
                            value="approved"
                          >
                            Approve and activate
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex h-full min-h-64 flex-col justify-between">
                        <div>
                          <span
                            className={`grid size-12 place-items-center rounded-2xl ${
                              application.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            <Icon name={application.status === "approved" ? "check" : "close"} />
                          </span>
                          <h3 className="mt-5 text-xl font-black tracking-[-0.035em]">
                            Review complete
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            This application is immutable through the review workflow and cannot be processed twice.
                          </p>
                        </div>
                        <Link
                          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-xs font-black text-[#0a1b31] shadow-sm"
                          href="/biloo"
                        >
                          Open operations dashboard
                        </Link>
                      </div>
                    )}
                  </aside>
                </div>
              </article>
            );
          })}

          {!visibleApplications.length ? (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eef3f8] text-slate-400">
                <Icon name="shield" />
              </span>
              <h2 className="mt-5 text-xl font-black tracking-[-0.035em]">
                No {activeStatus === "all" ? "role" : activeStatus} applications
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                New driver and vendor submissions will appear here after account onboarding. The production review workflow is ready.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black capitalize text-[#10243a]">{value}</p>
    </div>
  );
}
