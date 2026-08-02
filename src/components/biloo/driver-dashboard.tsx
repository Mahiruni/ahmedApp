"use client";

import type {
  DriverJob,
  IconName,
} from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill, Surface } from "./ui";

export function DriverDashboard({
  online,
  setOnline,
  jobs,
  activeJob,
  earnings,
  completed,
  onAccept,
  onComplete,
}: {
  online: boolean;
  setOnline: (value: boolean) => void;
  jobs: DriverJob[];
  activeJob: DriverJob | null;
  earnings: number;
  completed: number;
  onAccept: (job: DriverJob) => void;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#082640] p-6 text-white shadow-[0_28px_80px_rgba(8,38,64,0.22)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-[#f2bd4b]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <span
                className={`size-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-slate-400"}`}
              />
              {online ? "Online and receiving requests" : "You are offline"}
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Good evening, Dawit.
            </h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              Trips, deliveries, earnings and navigation in one driver app.
            </p>
          </div>
          <button
            className={`min-h-13 rounded-2xl px-7 text-sm font-black transition hover:-translate-y-0.5 ${
              online
                ? "bg-[#f2bd4b] text-[#082640]"
                : "bg-white text-[#082640]"
            }`}
            onClick={() => setOnline(!online)}
            type="button"
          >
            {online ? "Go offline" : "Go online"}
          </button>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {[
            [formatETB(earnings), "Today’s earnings", "wallet" as const],
            [String(completed), "Completed jobs", "check" as const],
            ["4.93", "Driver rating", "star" as const],
          ].map(([value, label, icon]) => (
            <div className="rounded-2xl bg-white/9 p-5" key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-2 text-xs font-semibold text-white/55">
                    {label}
                  </p>
                </div>
                <Icon className="size-5 text-[#f2bd4b]" name={icon as IconName} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeJob ? (
        <Surface className="overflow-hidden">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="p-5 sm:p-6">
              <StatusPill tone="success">Active job</StatusPill>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.045em]">
                {activeJob.type} in progress
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {serviceLabel(activeJob.service)} · {activeJob.distance} ·{" "}
                {activeJob.eta}
              </p>

              <div className="mt-6 space-y-4">
                <RouteStop label="Pickup" location={activeJob.pickup} tone="green" />
                <RouteStop
                  label="Drop-off"
                  location={activeJob.dropoff}
                  tone="red"
                />
              </div>

              <div className="mt-6 rounded-2xl bg-[#f5f8fa] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Estimated earning
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatETB(activeJob.amount)}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black text-[#082640]"
                  type="button"
                >
                  <Icon name="phone" /> Call
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#082640] text-sm font-black text-white"
                  type="button"
                >
                  <Icon name="navigation" /> Navigate
                </button>
              </div>
              <button
                className="mt-3 min-h-12 w-full rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700"
                onClick={onComplete}
                type="button"
              >
                Complete job
              </button>
            </div>

            <div className="relative min-h-[430px] overflow-hidden bg-[#e8eef2]">
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute left-[15%] top-[23%] h-2 w-[65%] rotate-[24deg] rounded-full bg-[#082640]/25" />
              <div className="absolute left-[19%] top-[19%] grid size-12 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-xl">
                <Icon name="location" />
              </div>
              <div className="absolute right-[14%] bottom-[19%] grid size-12 place-items-center rounded-full border-4 border-white bg-rose-500 text-white shadow-xl">
                <Icon name="location" />
              </div>
              <div className="absolute left-[52%] top-[44%] grid size-14 place-items-center rounded-full border-4 border-white bg-[#082640] text-[#f2bd4b] shadow-2xl">
                <Icon name={activeJob.type === "Taxi" ? "taxi" : "driver"} />
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/92 p-4 shadow-xl backdrop-blur">
                <p className="text-sm font-black">Fastest route selected</p>
                <p className="mt-1 text-xs text-slate-500">
                  Traffic-aware navigation will use the configured map provider.
                </p>
              </div>
            </div>
          </div>
        </Surface>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
          <Surface className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                  Incoming work
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Available jobs nearby
                </h2>
              </div>
              <StatusPill tone={online ? "success" : "neutral"}>
                {online ? "Live" : "Offline"}
              </StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              {jobs.map((job) => (
                <article
                  className={`rounded-[1.45rem] border p-5 transition ${
                    online
                      ? "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                      : "border-slate-100 opacity-55"
                  }`}
                  key={job.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="brand">{job.type}</StatusPill>
                        <span className="text-xs font-bold text-slate-400">
                          {job.id}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-black">{job.pickup}</p>
                      <div className="my-2 ml-2 h-5 border-l border-dashed border-slate-300" />
                      <p className="text-sm font-black">{job.dropoff}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#082640]">
                        {formatETB(job.amount)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {job.distance} · {job.eta}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      className="min-h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-500"
                      disabled={!online}
                      type="button"
                    >
                      Decline
                    </button>
                    <button
                      className="min-h-11 rounded-xl bg-[#082640] text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!online}
                      onClick={() => onAccept(job)}
                      type="button"
                    >
                      Accept job
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Surface>

          <DemandMap />
        </div>
      )}
    </div>
  );
}

function RouteStop({
  label,
  location,
  tone,
}: {
  label: string;
  location: string;
  tone: "green" | "red";
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1 size-3 shrink-0 rounded-full ${
          tone === "green" ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-black">{location}</p>
      </div>
    </div>
  );
}

function DemandMap() {
  return (
    <Surface className="p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        Demand map
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
        High-demand zones
      </h2>
      <div className="relative mt-6 min-h-[430px] overflow-hidden rounded-[1.45rem] bg-[#e8eef2]">
        <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute left-[15%] top-[20%] size-32 rounded-full bg-amber-400/38 blur-sm" />
        <div className="absolute right-[9%] top-[42%] size-40 rounded-full bg-orange-400/34 blur-sm" />
        <div className="absolute bottom-[12%] left-[34%] size-28 rounded-full bg-emerald-400/30 blur-sm" />
        <div className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-[#082640] text-white shadow-xl">
          <Icon name="driver" />
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/92 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black">Bole · 2.1× demand</p>
              <p className="mt-1 text-xs text-slate-500">
                Estimated four-minute wait for the next request.
              </p>
            </div>
            <Icon className="size-5 text-[#082640]" name="trend" />
          </div>
        </div>
      </div>
    </Surface>
  );
}
