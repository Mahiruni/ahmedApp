"use client";

import type { AdminIncident, IconName } from "@/data/biloo";

import { Icon, StatusPill, Surface } from "./ui";

export function AdminDashboard({
  incidents,
  onResolveIncident,
}: {
  incidents: AdminIncident[];
  onResolveIncident: (incident: AdminIncident) => void;
}) {
  const openIncidents = incidents.filter((incident) => !incident.resolved);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#082640] p-6 text-white shadow-[0_28px_80px_rgba(8,38,64,0.22)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#f2bd4b]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f2bd4b]">
              BILOO command center
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Operations at a glance.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Monitor marketplace activity, driver supply, payments, vendors
              and service health across the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-2xl bg-white/10 px-5 text-sm font-black"
              type="button"
            >
              Export report
            </button>
            <button
              className="min-h-12 rounded-2xl bg-[#f2bd4b] px-5 text-sm font-black text-[#082640]"
              type="button"
            >
              Create campaign
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["ETB 2.48M", "Gross order value", "+18.4%", "wallet" as const],
          ["1,284", "Orders today", "+11.2%", "receipt" as const],
          ["486", "Drivers online", "92% active", "driver" as const],
          [
            String(openIncidents.length),
            "Open incidents",
            `${openIncidents.filter((item) => item.severity === "High").length} urgent`,
            "alert" as const,
          ],
        ].map(([value, label, change, icon]) => (
          <article
            className="rounded-[1.55rem] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.045)]"
            key={label}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-4 text-3xl font-black tracking-[-0.04em]">
                  {value}
                </p>
                <p
                  className={`mt-3 text-xs font-black ${
                    label === "Open incidents"
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                >
                  {change}
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-[#f2f7fb] text-[#082640]">
                <Icon name={icon as IconName} />
              </span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Service performance
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Orders by vertical
              </h2>
            </div>
            <StatusPill tone="brand">Today</StatusPill>
          </div>

          <div className="mt-8 space-y-5">
            {[
              ["Food delivery", 78, "642 orders", "#f97316"],
              ["Taxi", 64, "418 trips", "#d99a1f"],
              ["Supermarket", 48, "156 orders", "#059669"],
              ["Construction", 31, "42 orders", "#0284c7"],
              ["Car parts", 22, "26 orders", "#7c3aed"],
            ].map(([label, width, value, color]) => (
              <div key={String(label)}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-black">{label}</span>
                  <span className="font-bold text-slate-400">{value}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: String(color), width: `${width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
                Risk queue
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Needs attention
              </h2>
            </div>
            <StatusPill tone="danger">{openIncidents.length} open</StatusPill>
          </div>

          <div className="mt-6 space-y-3">
            {incidents.map((incident) => (
              <article
                className={`rounded-2xl p-4 ${
                  incident.resolved ? "bg-emerald-50/70" : "bg-[#f5f8fa]"
                }`}
                key={incident.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black leading-5">
                      {incident.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {incident.id} · {incident.age}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      incident.resolved
                        ? "success"
                        : incident.severity === "High"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {incident.resolved ? "Resolved" : incident.severity}
                  </StatusPill>
                </div>
                {!incident.resolved ? (
                  <button
                    className="mt-4 min-h-10 w-full rounded-xl bg-white text-xs font-black text-[#082640] shadow-sm"
                    onClick={() => onResolveIncident(incident)}
                    type="button"
                  >
                    Mark resolved
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}
