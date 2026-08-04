"use client";

import { useEffect, useMemo, useState } from "react";

import type { DriverJob, IconName } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

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
  const currentStageIndex = Math.max(
    0,
    driverStages.findIndex((candidate) => candidate.key === stage),
  );

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

  const metrics: Array<{
    value: string;
    label: string;
    detail: string;
    icon: IconName;
  }> = [
    {
      value: formatETB(earnings),
      label: "Today’s earnings",
      detail: "Available after completed work",
      icon: "wallet",
    },
    {
      value: String(completed),
      label: "Completed jobs",
      detail: activeJob ? "One active job in progress" : `${visibleJobs.length} nearby requests`,
      icon: "check",
    },
    {
      value: "4.93",
      label: "Driver rating",
      detail: "Excellent service score",
      icon: "star",
    },
  ];

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
    if (!next) return;
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
    <div className="biloo-driver-workspace">
      <section className="biloo-driver-hero">
        <div className="biloo-driver-hero-main">
          <span className="biloo-driver-avatar" aria-hidden="true">
            <Icon name="driver" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="biloo-driver-kicker">
              <span className={online ? "is-live" : ""} />
              {online ? "Online · Receiving requests" : "Offline · Requests paused"}
            </div>
            <h1>Driver workspace</h1>
            <p>Trips, deliveries, navigation and earnings—organized around your next action.</p>
          </div>
          <button
            aria-pressed={online}
            className="biloo-driver-availability"
            data-online={online}
            onClick={() => setOnline(!online)}
            type="button"
          >
            <span>
              <small>Availability</small>
              <strong>{online ? "Go offline" : "Go online"}</strong>
            </span>
            <span className="biloo-driver-switch" aria-hidden="true"><i /></span>
          </button>
        </div>

        <div className="biloo-driver-metrics">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <span className="biloo-driver-metric-icon">
                <Icon name={metric.icon} />
              </span>
              <span className="min-w-0">
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
                <em>{metric.detail}</em>
              </span>
            </article>
          ))}
        </div>
      </section>

      {notice ? (
        <div className="biloo-driver-notice" role="status">
          <Icon name="check" />
          <span>{notice}</span>
        </div>
      ) : null}

      {activeJob && currentStage ? (
        <section className="biloo-driver-active">
          <div className="biloo-driver-active-content">
            <header className="biloo-driver-active-header">
              <span className="biloo-driver-active-badge">
                <i /> Active {activeJob.type.toLowerCase()}
              </span>
              <span>{activeJob.id}</span>
            </header>

            <div className="biloo-driver-active-title">
              <span className="biloo-driver-service-icon">
                <Icon name={activeJob.type === "Taxi" ? "taxi" : "driver"} />
              </span>
              <div className="min-w-0 flex-1">
                <small>{serviceLabel(activeJob.service)}</small>
                <h2>{currentStage.label}</h2>
                <p>{activeJob.distance} · {activeJob.eta} estimated</p>
              </div>
              <strong>{formatETB(activeJob.amount)}</strong>
            </div>

            <div className="biloo-driver-stage-progress">
              <div>
                <span>{currentStage.label}</span>
                <strong>{currentStage.progress}%</strong>
              </div>
              <div className="biloo-driver-stage-track">
                <span style={{ width: `${currentStage.progress}%` }} />
              </div>
              <div className="biloo-driver-stage-labels">
                {driverStages.map((item, index) => (
                  <span data-current={index === currentStageIndex} data-done={index <= currentStageIndex} key={item.key}>
                    <i />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="biloo-driver-route-card">
              <RouteStop label="Pickup" location={activeJob.pickup} tone="green" />
              <span className="biloo-driver-route-connector" aria-hidden="true" />
              <RouteStop label="Drop-off" location={activeJob.dropoff} tone="red" />
            </div>

            <div className="biloo-driver-job-metrics">
              <article>
                <small>Estimated earning</small>
                <strong>{formatETB(activeJob.amount)}</strong>
              </article>
              <article>
                <small>Distance</small>
                <strong>{activeJob.distance}</strong>
              </article>
              <article>
                <small>ETA</small>
                <strong>{activeJob.eta}</strong>
              </article>
            </div>

            <div className="biloo-driver-contact-actions">
              {activeContactPhone ? (
                <a aria-label={`Call ${activeContactName}`} href={`tel:${activeContactPhone}`}>
                  <Icon name="phone" />
                  <span>Call customer</span>
                </a>
              ) : (
                <button
                  aria-label="Customer phone unavailable"
                  disabled
                  title="No verified customer phone is attached to this job"
                  type="button"
                >
                  <Icon name="phone" />
                  <span>Call unavailable</span>
                </button>
              )}
              <button onClick={() => openNavigation(activeJob)} type="button">
                <Icon name="navigation" />
                <span>Open navigation</span>
              </button>
            </div>

            <button className="biloo-driver-primary-action" onClick={advanceJob} type="button">
              <span>{currentStage.action}</span>
              <Icon name={stage === "at_dropoff" ? "check" : "arrow"} />
            </button>
            <p className="biloo-driver-contact-note">
              Customer calls use only the verified phone attached to this active job.
            </p>
          </div>

          <div className="biloo-driver-route-visual" aria-label="Active route preview">
            <div className="biloo-driver-map-grid" />
            <div className="biloo-driver-map-route" />
            <span className="biloo-driver-map-pin is-start"><Icon name="location" /></span>
            <span className="biloo-driver-map-pin is-end"><Icon name="location" /></span>
            <span
              className="biloo-driver-map-vehicle"
              style={{
                left: `${18 + currentStage.progress * 0.52}%`,
                top: `${25 + currentStage.progress * 0.22}%`,
              }}
            >
              <Icon name={activeJob.type === "Taxi" ? "taxi" : "driver"} />
            </span>
            <div className="biloo-driver-map-card">
              <span><Icon name="navigation" /></span>
              <div>
                <small>Next action</small>
                <strong>{currentStage.action}</strong>
                <p>Progress is synchronized with the customer order lifecycle.</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="biloo-driver-grid">
          <section className="biloo-driver-panel">
            <header className="biloo-driver-panel-header">
              <div>
                <span>Nearby opportunities</span>
                <h2>Available jobs</h2>
                <p>Compare route, time and payout before accepting.</p>
              </div>
              <span className="biloo-driver-panel-status" data-online={online}>
                <i /> {online ? "Live" : "Offline"}
              </span>
            </header>

            <div className="biloo-driver-jobs" data-online={online}>
              {visibleJobs.map((job) => (
                <article className="biloo-driver-job" key={job.id}>
                  <div className="biloo-driver-job-top">
                    <span className="biloo-driver-job-type">
                      <Icon name={job.type === "Taxi" ? "taxi" : "driver"} />
                      {job.type}
                    </span>
                    <span>{job.id}</span>
                  </div>

                  <div className="biloo-driver-job-route">
                    <RouteStop label="Pickup" location={job.pickup} tone="green" />
                    <span className="biloo-driver-route-connector" aria-hidden="true" />
                    <RouteStop label="Drop-off" location={job.dropoff} tone="red" />
                  </div>

                  <div className="biloo-driver-job-summary">
                    <span>
                      <small>Payout</small>
                      <strong>{formatETB(job.amount)}</strong>
                    </span>
                    <span>
                      <small>Distance</small>
                      <strong>{job.distance}</strong>
                    </span>
                    <span>
                      <small>Time</small>
                      <strong>{job.eta}</strong>
                    </span>
                  </div>

                  <div className="biloo-driver-job-actions">
                    <button disabled={!online} onClick={() => declineJob(job)} type="button">
                      Decline
                    </button>
                    <button disabled={!online} onClick={() => onAccept(job)} type="button">
                      Accept job <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}

              {visibleJobs.length === 0 ? (
                <div className="biloo-driver-empty">
                  <span><Icon name="check" /></span>
                  <h3>Queue cleared</h3>
                  <p>New requests will appear here automatically when they become available.</p>
                </div>
              ) : null}
            </div>
          </section>

          <DemandMap online={online} />
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
    <div className="biloo-driver-route-stop" data-tone={tone}>
      <span aria-hidden="true"><i /></span>
      <div className="min-w-0">
        <small>{label}</small>
        <strong>{location}</strong>
      </div>
    </div>
  );
}

function DemandMap({ online }: { online: boolean }) {
  return (
    <section className="biloo-driver-panel biloo-driver-demand">
      <header className="biloo-driver-panel-header">
        <div>
          <span>Demand intelligence</span>
          <h2>High-demand zones</h2>
          <p>Move toward active areas to reduce waiting time.</p>
        </div>
        <span className="biloo-driver-demand-trend"><Icon name="trend" /> 2.1×</span>
      </header>

      <div className="biloo-driver-demand-map" data-online={online}>
        <div className="biloo-driver-map-grid" />
        <span className="biloo-driver-demand-zone is-one" />
        <span className="biloo-driver-demand-zone is-two" />
        <span className="biloo-driver-demand-zone is-three" />
        <span className="biloo-driver-demand-position"><Icon name="driver" /></span>
        <div className="biloo-driver-demand-card">
          <span><Icon name="trend" /></span>
          <div>
            <small>Best nearby zone</small>
            <strong>Bole · 2.1× demand</strong>
            <p>{online ? "Estimated four-minute wait for the next request." : "Go online to receive requests in this zone."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
