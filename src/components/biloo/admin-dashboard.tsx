"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminIncident, IconName, ServiceKey } from "@/data/biloo";

import { Icon, StatusPill } from "./ui";

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
  const urgentCount = openIncidents.filter((incident) => incident.severity === "High").length;

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
      ["Food delivery", 78, "642 orders", "food" as const],
      ["Taxi", 64, "418 trips", "taxi" as const],
      ["Supermarket", 48, "156 orders", "market" as const],
      ["Construction", 31, "42 orders", "construction" as const],
      ["Car parts", 22, "26 orders", "parts" as const],
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

  const metrics: Array<{
    value: string;
    label: string;
    detail: string;
    icon: IconName;
    tone: "positive" | "neutral" | "danger";
  }> = [
    { value: "ETB 2.48M", label: "Gross order value", detail: "+18.4% today", icon: "wallet", tone: "positive" },
    { value: "1,284", label: "Orders today", detail: "+11.2% vs yesterday", icon: "receipt", tone: "positive" },
    { value: "486", label: "Drivers online", detail: "92% currently active", icon: "driver", tone: "neutral" },
    { value: String(openIncidents.length), label: "Open incidents", detail: `${urgentCount} urgent`, icon: "alert", tone: urgentCount ? "danger" : "positive" },
  ];

  return (
    <div className="biloo-admin-page">
      <section className="biloo-admin-hero">
        <div className="biloo-admin-hero-copy">
          <span className="biloo-admin-kicker">BILOO command center</span>
          <h1>Run the entire marketplace from one clear view.</h1>
          <p>
            Monitor orders, driver supply, payments, vendors, incidents and growth controls without losing operational context.
          </p>
        </div>
        <div className="biloo-admin-hero-actions">
          <button className="biloo-button biloo-button-secondary-on-dark" onClick={exportReport} type="button">
            <Icon className="size-[17px]" name="receipt" />
            Export report
          </button>
          <button
            aria-expanded={composerOpen}
            className="biloo-button biloo-button-light"
            onClick={() => setComposerOpen((current) => !current)}
            type="button"
          >
            <Icon className="size-[17px]" name={composerOpen ? "close" : "plus"} />
            {composerOpen ? "Close campaign form" : "Create campaign"}
          </button>
        </div>
      </section>

      {notice ? <div className="biloo-inline-notice" role="status">{notice}</div> : null}

      {composerOpen ? (
        <section className="biloo-admin-composer" aria-label="Create campaign">
          <div className="biloo-section-heading">
            <div>
              <span>Growth control</span>
              <h2>Publish a campaign</h2>
            </div>
            <small>Discounts are capped at 80%</small>
          </div>
          <div className="biloo-admin-composer-grid">
            <label className="biloo-field biloo-admin-campaign-name">
              <span>Campaign name</span>
              <input
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="Example: Addis weekend saver"
                value={campaignName}
              />
            </label>
            <label className="biloo-field">
              <span>Service</span>
              <select
                onChange={(event) => setCampaignService(event.target.value as Campaign["service"])}
                value={campaignService}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="biloo-field">
              <span>Discount</span>
              <input
                max={80}
                min={1}
                onChange={(event) => setCampaignDiscount(Number(event.target.value))}
                type="number"
                value={campaignDiscount}
              />
            </label>
            <button className="biloo-button biloo-button-primary" onClick={createCampaign} type="button">
              Publish campaign
            </button>
          </div>
        </section>
      ) : null}

      <section className="biloo-admin-metrics" aria-label="Platform metrics">
        {metrics.map((metric) => (
          <article className="biloo-admin-metric" data-tone={metric.tone} key={metric.label}>
            <span className="biloo-admin-metric-icon"><Icon name={metric.icon} /></span>
            <div>
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
              <span>{metric.detail}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="biloo-admin-primary-grid">
        <section className="biloo-admin-panel">
          <div className="biloo-section-heading">
            <div>
              <span>Service performance</span>
              <h2>Marketplace activity</h2>
            </div>
            <StatusPill tone="brand">Today</StatusPill>
          </div>
          <div className="biloo-admin-services">
            {serviceMetrics.map(([label, width, value, service]) => (
              <article className="biloo-admin-service" key={label}>
                <span className="biloo-admin-service-icon"><Icon name={service} /></span>
                <div className="biloo-admin-service-body">
                  <div><strong>{label}</strong><small>{value}</small></div>
                  <div className="biloo-admin-service-track"><span style={{ width: `${width}%` }} /></div>
                </div>
                <b>{width}%</b>
              </article>
            ))}
          </div>
        </section>

        <section className="biloo-admin-panel">
          <div className="biloo-section-heading">
            <div>
              <span>Risk queue</span>
              <h2>Needs attention</h2>
            </div>
            <StatusPill tone={openIncidents.length ? "danger" : "success"}>{openIncidents.length} open</StatusPill>
          </div>
          <div className="biloo-admin-incidents">
            {incidents.map((incident) => (
              <article className="biloo-admin-incident" data-resolved={incident.resolved} key={incident.id}>
                <div className="biloo-admin-incident-top">
                  <span className="biloo-admin-incident-icon"><Icon name={incident.resolved ? "check" : "alert"} /></span>
                  <div><strong>{incident.title}</strong><small>{incident.id} · {incident.age}</small></div>
                  <StatusPill tone={incident.resolved ? "success" : incident.severity === "High" ? "danger" : "warning"}>
                    {incident.resolved ? "Resolved" : incident.severity}
                  </StatusPill>
                </div>
                {!incident.resolved ? (
                  <button className="biloo-button biloo-button-soft" onClick={() => onResolveIncident(incident)} type="button">
                    Mark resolved
                  </button>
                ) : null}
              </article>
            ))}
            {!incidents.length ? (
              <div className="biloo-empty-state compact"><Icon name="check" /><strong>All clear</strong><p>No incidents require attention.</p></div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="biloo-admin-panel">
        <div className="biloo-section-heading">
          <div>
            <span>Growth controls</span>
            <h2>Campaign manager</h2>
          </div>
          <StatusPill tone="success">{activeCampaigns.length} active</StatusPill>
        </div>
        <div className="biloo-admin-campaigns">
          {campaigns.map((campaign) => (
            <article className="biloo-admin-campaign" data-active={campaign.active} key={campaign.id}>
              <span className="biloo-admin-campaign-icon"><Icon name="trend" /></span>
              <div className="biloo-admin-campaign-copy">
                <div><strong>{campaign.name}</strong><StatusPill tone={campaign.active ? "success" : "neutral"}>{campaign.active ? "Active" : "Paused"}</StatusPill></div>
                <p>{campaign.id} · {serviceLabel(campaign.service)} · {campaign.discount}% off</p>
                <small>Created {campaign.createdAt}</small>
              </div>
              <button
                className={`biloo-button ${campaign.active ? "biloo-button-danger-soft" : "biloo-button-success-soft"}`}
                onClick={() => toggleCampaign(campaign)}
                type="button"
              >
                {campaign.active ? "Pause" : "Activate"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function serviceLabel(service: Campaign["service"]) {
  return serviceOptions.find((option) => option.value === service)?.label ?? service;
}
