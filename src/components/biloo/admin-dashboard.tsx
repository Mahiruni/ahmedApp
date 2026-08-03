"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminIncident, IconName, ServiceKey } from "@/data/biloo";

import { Icon, StatusPill, Surface } from "./ui";

interface Campaign {
  id: string;
  name: string;
  service: ServiceKey | "all";
  discount: number;
  active: boolean;
  createdAt: string;
}

const campaignStorageKey = "biloo.admin-campaigns";

const initialCampaigns: Campaign[] = [
  {
    id: "CMP-101",
    name: "Bole lunch boost",
    service: "food",
    discount: 12,
    active: true,
    createdAt: "Today · 10:20 AM",
  },
  {
    id: "CMP-098",
    name: "Weekend market saver",
    service: "market",
    discount: 8,
    active: false,
    createdAt: "Yesterday · 4:35 PM",
  },
];

const serviceOptions: Array<{ value: Campaign["service"]; label: string }> = [
  { value: "all", label: "All services" },
  { value: "food", label: "Food delivery" },
  { value: "taxi", label: "Taxi" },
  { value: "market", label: "Supermarket" },
  { value: "construction", label: "Construction" },
  { value: "parts", label: "Car parts" },
];

export function AdminDashboard({
  incidents,
  onResolveIncident,
}: {
  incidents: AdminIncident[];
  onResolveIncident: (incident: AdminIncident) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [composerOpen, setComposerOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignService, setCampaignService] = useState<Campaign["service"]>("all");
  const [campaignDiscount, setCampaignDiscount] = useState(10);
  const [notice, setNotice] = useState<string | null>(null);

  const openIncidents = incidents.filter((incident) => !incident.resolved);
  const activeCampaigns = campaigns.filter((campaign) => campaign.active);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(campaignStorageKey);
      if (stored) setCampaigns(JSON.parse(stored) as Campaign[]);
    } catch {
      // Seeded campaigns remain available when storage is blocked.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(campaignStorageKey, JSON.stringify(campaigns));
    } catch {
      // In-memory campaign controls still work.
    }
  }, [campaigns]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const serviceMetrics = useMemo(
    () => [
      ["Food delivery", 78, "642 orders", "#f97316"],
      ["Taxi", 64, "418 trips", "#d99a1f"],
      ["Supermarket", 48, "156 orders", "#059669"],
      ["Construction", 31, "42 orders", "#0284c7"],
      ["Car parts", 22, "26 orders", "#7c3aed"],
    ] as const,
    [],
  );

  function createCampaign() {
    const name = campaignName.trim();
    if (!name) {
      setNotice("Enter a campaign name before publishing.");
      return;
    }

    const campaign: Campaign = {
      id: `CMP-${Math.floor(100 + Math.random() * 899)}`,
      name,
      service: campaignService,
      discount: Math.max(1, Math.min(80, campaignDiscount)),
      active: true,
      createdAt: `Today · ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date())}`,
    };

    setCampaigns((current) => [campaign, ...current]);
    setCampaignName("");
    setCampaignDiscount(10);
    setCampaignService("all");
    setComposerOpen(false);
    setNotice(`${campaign.name} is now active.`);
  }

  function toggleCampaign(campaign: Campaign) {
    setCampaigns((current) =>
      current.map((item) =>
        item.id === campaign.id ? { ...item, active: !item.active } : item,
      ),
    );
    setNotice(`${campaign.name} ${campaign.active ? "paused" : "activated"}.`);
  }

  function exportReport() {
    const rows = [
      ["section", "metric", "value"],
      ["overview", "gross_order_value", "2480000"],
      ["overview", "orders_today", "1284"],
      ["overview", "drivers_online", "486"],
      ["overview", "open_incidents", String(openIncidents.length)],
      ["overview", "active_campaigns", String(activeCampaigns.length)],
      ...incidents.map((incident) => [
        "incident",
        incident.id,
        `${incident.severity}:${incident.resolved ? "resolved" : "open"}`,
      ]),
      ...campaigns.map((campaign) => [
        "campaign",
        campaign.id,
        `${campaign.service}:${campaign.discount}%:${campaign.active ? "active" : "paused"}`,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `biloo-operations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice("Operations report exported as CSV.");
  }

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
              Monitor marketplace activity, driver supply, payments, vendors and
              service health across the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-2xl bg-white/10 px-5 text-sm font-black transition hover:bg-white/15"
              onClick={exportReport}
              type="button"
            >
              Export report
            </button>
            <button
              className="min-h-12 rounded-2xl bg-[#f2bd4b] px-5 text-sm font-black text-[#082640] transition hover:bg-[#ffd272]"
              onClick={() => setComposerOpen((current) => !current)}
              type="button"
            >
              {composerOpen ? "Close composer" : "Create campaign"}
            </button>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {notice}
        </div>
      ) : null}

      {composerOpen ? (
        <Surface className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <label className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Campaign name
              </span>
              <input
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-[#082640]"
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="Example: Addis weekend saver"
                value={campaignName}
              />
            </label>
            <label className="lg:w-56">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Service
              </span>
              <select
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#082640]"
                onChange={(event) =>
                  setCampaignService(event.target.value as Campaign["service"])
                }
                value={campaignService}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="lg:w-40">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Discount %
              </span>
              <input
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-[#082640]"
                max={80}
                min={1}
                onChange={(event) => setCampaignDiscount(Number(event.target.value))}
                type="number"
                value={campaignDiscount}
              />
            </label>
            <button
              className="min-h-12 rounded-xl bg-[#082640] px-6 text-sm font-black text-white"
              onClick={createCampaign}
              type="button"
            >
              Publish campaign
            </button>
          </div>
        </Surface>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          [String(activeCampaigns.length), "Active campaigns", "Demo control", "trend" as const],
        ].map(([value, label, change, icon]) => (
          <article
            className="rounded-[1.55rem] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.045)]"
            key={label}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-4 text-3xl font-black tracking-[-0.04em]">{value}</p>
                <p
                  className={`mt-3 text-xs font-black ${
                    label === "Open incidents" ? "text-rose-600" : "text-emerald-600"
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
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
            {serviceMetrics.map(([label, width, value, color]) => (
              <div key={label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-black">{label}</span>
                  <span className="font-bold text-slate-400">{value}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color, width: `${width}%` }}
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
                    <p className="text-sm font-black leading-5">{incident.title}</p>
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

      <Surface className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Growth controls
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Campaign manager
            </h2>
          </div>
          <StatusPill tone="success">{activeCampaigns.length} active</StatusPill>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <article
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
              key={campaign.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black">{campaign.name}</p>
                  <StatusPill tone={campaign.active ? "success" : "neutral"}>
                    {campaign.active ? "Active" : "Paused"}
                  </StatusPill>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-400">
                  {campaign.id} · {serviceLabel(campaign.service)} · {campaign.discount}% off
                </p>
                <p className="mt-1 text-[10px] text-slate-400">Created {campaign.createdAt}</p>
              </div>
              <button
                className={`min-h-10 rounded-xl px-4 text-xs font-black ${
                  campaign.active
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
                onClick={() => toggleCampaign(campaign)}
                type="button"
              >
                {campaign.active ? "Pause" : "Activate"}
              </button>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  );
}

function serviceLabel(service: Campaign["service"]) {
  return serviceOptions.find((option) => option.value === service)?.label ?? service;
}
