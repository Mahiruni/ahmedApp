"use client";

import { useEffect, useMemo, useState } from "react";

import type { DriverJob, IconName } from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill, Surface } from "./ui";

type DriverStage = "accepted" | "at_pickup" | "picked_up" | "at_dropoff";

type DriverJobWithContact = DriverJob & {
  customerName?: string;
  customerPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  contactName?: string;
  contactPhone?: string;
};

const driverStages: Array<{
  key: DriverStage;
  label: string;
  action: string;
  progress: number;
}> = [
  { key: "accepted", label: "Accepted", action: "Arrived at pickup", progress: 18 },
  { key: "at_pickup", label: "At pickup", action: "Confirm pickup", progress: 46 },
  { key: "picked_up", label: "Picked up", action: "Arrived at drop-off", progress: 74 },
  { key: "at_dropoff", label: "At drop-off", action: "Complete job", progress: 100 },
];

const driverStageStorageKey = "biloo.driver-active-stage";
const declinedJobsStorageKey = "biloo.driver-declined-jobs";

function normalizeEthiopianDialNumber(value?: string) {
  if (!value) return null;

  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 9) return null;

  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("251")) return `+${digits}`;
  if (digits.startsWith("0")) return `+251${digits.slice(1)}`;

  return digits;
}

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
  const [stage, setStage] = useState<DriverStage>("accepted");
  const [declinedJobIds, setDeclinedJobIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedDeclined = window.localStorage.getItem(declinedJobsStorageKey);
      if (storedDeclined) setDeclinedJobIds(JSON.parse(storedDeclined) as string[]);
    } catch {
      // Keep the driver workflow usable when storage is blocked or corrupted.
    }
  }, []);

  useEffect(() => {
    if (!activeJob) {
      setStage("accepted");
      return;
    }

    try {
      const stored = window.localStorage.getItem(driverStageStorageKey);
      if (!stored) {
        setStage("accepted");
        return;
      }
      const parsed = JSON.parse(stored) as { jobId?: string; stage?: DriverStage };
      setStage(parsed.jobId === activeJob.id && parsed.stage ? parsed.stage : "accepted");
    } catch {
      setStage("accepted");
    }
  }, [activeJob?.id]);

  useEffect(() => {
    if (!activeJob) {
      try {
        window.localStorage.removeItem(driverStageStorageKey);
      } catch {
        // In-memory progress still works.
      }
      return;
    }
    try {
      window.localStorage.setItem(
        driverStageStorageKey,
        JSON.stringify({ jobId: activeJob.id, stage }),
      );
    } catch {
      // In-memory progress still works.
    }
  }, [activeJob, stage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        declinedJobsStorageKey,
        JSON.stringify(declinedJobIds),
      );
    } catch {
      // In-memory filtering still works.
    }
  }, [declinedJobIds]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const visibleJobs = useMemo(
    () => jobs.filter((job) => !declinedJobIds.includes(job.id)),
    [declinedJobIds, jobs],
  );

  const currentStage =
    driverStages.find((candidate) => candidate.key === stage) ?? driverStages[0];

  const activeJobContact = activeJob as DriverJobWithContact | null;
  const activeContactName =
    activeJobContact?.customerName ??
    activeJobContact?.recipientName ??
    activeJobContact?.contactName ??
    "customer";
  const activeContactPhone = normalizeEthiopianDialNumber(
    activeJobContact?.customerPhone ??
      activeJobContact?.recipientPhone ??
      activeJobContact?.contactPhone,
  );

  function advanceJob() {
    const currentIndex = driverStages.findIndex((candidate) => candidate.key === stage);
    if (currentIndex === driverStages.length - 1) {
      try {
        window.localStorage.removeItem(driverStageStorageKey);
      } catch {
        // Completion remains available when storage is blocked.
      }
      setStage("accepted");
      onComplete();
      return;
    }

    const next = driverStages[currentIndex + 1];
    setStage(next.key);
    setNotice(`Job updated: ${next.label}.`);
  }

  function declineJob(job: DriverJob) {
    setDeclinedJobIds((current) =>
      current.includes(job.id) ? current : [...current, job.id],
    );
    setNotice(`${job.id} declined. It was removed from your queue.`);
  }

  function openNavigation(job: DriverJob) {
    const destination =
      stage === "accepted" || stage === "at_pickup" ? job.pickup : job.dropoff;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

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
                  <p className="mt-2 text-xs font-semibold text-white/55">{label}</p>
                </div>
                <Icon className="size-5 text-[#f2bd4b]" name={icon as IconName} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {notice}
        </div>
      ) : null}

      {activeJob ? (
        <Surface className="overflow-hidden">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusPill tone="success">Active job</StatusPill>
                <span className="text-xs font-black text-slate-400">
                  {currentStage.progress}% complete
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.045em]">
                {activeJob.type} in progress
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {serviceLabel(activeJob.service)} · {activeJob.distance} · {activeJob.eta}
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${currentStage.progress}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {driverStages.map((item) => {
                  const activeIndex = driverStages.findIndex(
                    (candidate) => candidate.key === stage,
                  );
                  const itemIndex = driverStages.findIndex(
                    (candidate) => candidate.key === item.key,
                  );
                  return (
                    <div key={item.key} className="text-center">
                      <span
                        className={`mx-auto block size-2.5 rounded-full ${
                          itemIndex <= activeIndex ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                      <span className="mt-2 block text-[9px] font-black text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-4">
                <RouteStop label="Pickup" location={activeJob.pickup} tone="green" />
                <RouteStop label="Drop-off" location={activeJob.dropoff} tone="red" />
              </div>

              <div className="mt-6 rounded-2xl bg-[#f5f8fa] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Estimated earning
                </p>
                <p className="mt-2 text-2xl font-black">{formatETB(activeJob.amount)}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {activeContactPhone ? (
                  <a
                    aria-label={`Call ${activeContactName}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black text-[#082640]"
                    href={`tel:${activeContactPhone}`}
                  >
                    <Icon name="phone" /> Call customer
                  </a>
                ) : (
                  <button
                    aria-label="Customer phone unavailable"
                    className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-400"
                    disabled
                    title="No verified customer phone is attached to this job"
                    type="button"
                  >
                    <Icon name="phone" /> Call unavailable
                  </button>
                )}
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#082640] text-sm font-black text-white"
                  onClick={() => openNavigation(activeJob)}
                  type="button"
                >
                  <Icon name="navigation" /> Navigate
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                Calls use the verified phone attached to this customer’s active job.
              </p>
              <button
                className="mt-3 min-h-12 w-full rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700"
                onClick={advanceJob}
                type="button"
              >
                {currentStage.action}
              </button>
            </div>

            <div className="relative min-h-[430px] overflow-hidden bg-[#e8eef2]">
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute left-[15%] top-[23%] h-2 w-[65%] rotate-[24deg] rounded-full bg-[#082640]/25" />
              <div className="absolute left-[19%] top-[19%] grid size-12 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-xl">
                <Icon name="location" />
              </div>
              <div className="absolute bottom-[19%] right-[14%] grid size-12 place-items-center rounded-full border-4 border-white bg-rose-500 text-white shadow-xl">
                <Icon name="location" />
              </div>
              <div className="absolute left-[52%] top-[44%] grid size-14 place-items-center rounded-full border-4 border-white bg-[#082640] text-[#f2bd4b] shadow-2xl">
                <Icon name={activeJob.type === "Taxi" ? "taxi" : "driver"} />
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/92 p-4 shadow-xl backdrop-blur">
                <p className="text-sm font-black">{currentStage.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Your progress is saved on this device until the backend is connected.
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
              {visibleJobs.map((job) => (
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
                        <span className="text-xs font-bold text-slate-400">{job.id}</span>
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
                      className="min-h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-500 disabled:opacity-40"
                      disabled={!online}
                      onClick={() => declineJob(job)}
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

              {visibleJobs.length === 0 ? (
                <div className="rounded-[1.45rem] bg-slate-50 px-6 py-12 text-center">
                  <Icon className="mx-auto size-8 text-slate-300" name="check" />
                  <p className="mt-4 text-sm font-black text-slate-600">Queue cleared</p>
                  <p className="mt-2 text-xs text-slate-400">
                    New requests will appear here when they become available.
                  </p>
                </div>
              ) : null}
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
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">High-demand zones</h2>
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
