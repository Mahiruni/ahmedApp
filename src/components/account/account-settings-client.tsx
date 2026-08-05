"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";
import type { AppViewer } from "@/lib/biloo/auth";

const storageKey = "biloo.account-preferences";

type Preferences = {
  orderUpdates: boolean;
  promotions: boolean;
  safetyAlerts: boolean;
  compactMode: boolean;
  language: "English" | "Afaan Oromo" | "Amharic";
};

const defaultPreferences: Preferences = {
  orderUpdates: true,
  promotions: false,
  safetyAlerts: true,
  compactMode: false,
  language: "English",
};

function roleLabel(role: AppViewer["databaseRole"]) {
  if (role === "vendor_owner") return "Vendor owner";
  if (role === "vendor_staff") return "Vendor staff";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function workspaceCopy(role: AppViewer["uiRole"]) {
  if (role === "driver") {
    return {
      icon: "driver" as const,
      title: "Driver workspace",
      detail: "Trips, deliveries, navigation and earnings.",
    };
  }
  if (role === "vendor") {
    return {
      icon: "vendor" as const,
      title: "Vendor workspace",
      detail: "Orders, store availability, inventory and payouts.",
    };
  }
  if (role === "admin") {
    return {
      icon: "shield" as const,
      title: "Admin workspace",
      detail: "Operations, applications, incidents and platform health.",
    };
  }
  return {
    icon: "customer" as const,
    title: "Customer workspace",
    detail: "Rides, delivery, shopping, orders and saved places.",
  };
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="biloo-settings-toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <i aria-hidden="true"><b /></i>
    </label>
  );
}

export function AccountSettingsClient({ viewer }: { viewer: AppViewer }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const workspace = workspaceCopy(viewer.uiRole);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
    } catch {
      // The settings remain usable during this session when storage is blocked.
    }
  }, []);

  const completion = useMemo(() => {
    let score = 70;
    if (viewer.phone) score += 15;
    if (viewer.city) score += 10;
    if (viewer.email) score += 5;
    return Math.min(100, score);
  }, [viewer.city, viewer.email, viewer.phone]);

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function savePreferences(formData: FormData) {
    const phone = String(formData.get("phone") ?? "");
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences));
      window.localStorage.setItem("biloo.account-contact-phone", phone);
    } catch {
      // The success state still confirms the current in-memory selection.
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <main className="biloo-settings-page">
      <header className="biloo-settings-topbar">
        <Link aria-label="Return to BILOO" className="biloo-settings-brand" href="/biloo">
          <span className="biloo-settings-brand-mark">B</span>
          <span><strong>BILOO</strong><small>Account center</small></span>
        </Link>
        <Link className="biloo-settings-back" href="/biloo">
          <Icon name="arrow" />
          Back to app
        </Link>
      </header>

      <div className="biloo-settings-layout">
        <aside className="biloo-settings-sidebar">
          <div className="biloo-settings-profile-mini">
            <span>{viewer.initials}</span>
            <div>
              <strong>{viewer.displayName}</strong>
              <small>{roleLabel(viewer.databaseRole)}</small>
            </div>
          </div>

          <nav aria-label="Account settings sections">
            <a className="is-active" href="#profile"><Icon name="customer" />Profile</a>
            <a href="#contact"><Icon name="phone" />Contact</a>
            <a href="#notifications"><Icon name="bell" />Notifications</a>
            <a href="#preferences"><Icon name="admin" />Preferences</a>
            <a href="#security"><Icon name="shield" />Security</a>
          </nav>

          <div className="biloo-settings-sidebar-status">
            <span><i /> Account connected</span>
            <small>Protected by Supabase Auth</small>
          </div>
        </aside>

        <section className="biloo-settings-content">
          <section className="biloo-settings-hero" id="profile">
            <div className="biloo-settings-hero-profile">
              <span className="biloo-settings-avatar">{viewer.initials}</span>
              <div>
                <small>BILOO ACCOUNT</small>
                <h1>{viewer.displayName}</h1>
                <p>{viewer.email || "Verified BILOO member"}</p>
              </div>
            </div>
            <div className="biloo-settings-completion">
              <div><span>Profile strength</span><strong>{completion}%</strong></div>
              <i><b style={{ width: `${completion}%` }} /></i>
              <small>Your account is ready for everyday BILOO services.</small>
            </div>
          </section>

          <Link className="biloo-settings-workspace-card" href="/biloo">
            <span><Icon name={workspace.icon} /></span>
            <div><small>ACTIVE EXPERIENCE</small><strong>{workspace.title}</strong><p>{workspace.detail}</p></div>
            <Icon name="arrow" />
          </Link>

          <form action={savePreferences} className="biloo-settings-form">
            <section className="biloo-settings-panel" id="contact">
              <header>
                <div><small>PERSONAL DETAILS</small><h2>Contact information</h2><p>Information used for account communication and service coordination.</p></div>
                <span className="biloo-settings-panel-icon"><Icon name="customer" /></span>
              </header>

              <div className="biloo-settings-fields">
                <label>
                  <span>Display name</span>
                  <input defaultValue={viewer.displayName} disabled />
                  <small>Name changes will be available after identity verification.</small>
                </label>
                <label>
                  <span>Email address</span>
                  <input defaultValue={viewer.email ?? ""} disabled type="email" />
                  <small>Managed by your secure sign-in provider.</small>
                </label>
                <label className="biloo-settings-phone-field">
                  <span>Ethiopian mobile number</span>
                  <EthiopianPhoneInput defaultValue={viewer.phone ?? ""} name="phone" />
                  <small>The +251 prefix stays fixed. Enter only nine digits beginning with 9 or 7.</small>
                </label>
                <label>
                  <span>Primary city</span>
                  <input defaultValue={viewer.city || "Addis Ababa"} />
                  <small>Used to personalize nearby BILOO services.</small>
                </label>
              </div>
            </section>

            <section className="biloo-settings-panel" id="notifications">
              <header>
                <div><small>STAY INFORMED</small><h2>Notifications</h2><p>Choose which updates deserve your attention.</p></div>
                <span className="biloo-settings-panel-icon"><Icon name="bell" /></span>
              </header>
              <div className="biloo-settings-toggle-list">
                <Toggle checked={preferences.orderUpdates} description="Ride, order, delivery and workspace status changes." label="Service updates" onChange={(value) => updatePreference("orderUpdates", value)} />
                <Toggle checked={preferences.safetyAlerts} description="Important account, security and safety notices." label="Safety alerts" onChange={(value) => updatePreference("safetyAlerts", value)} />
                <Toggle checked={preferences.promotions} description="Occasional offers and new BILOO service announcements." label="Offers and product news" onChange={(value) => updatePreference("promotions", value)} />
              </div>
            </section>

            <section className="biloo-settings-panel" id="preferences">
              <header>
                <div><small>YOUR EXPERIENCE</small><h2>App preferences</h2><p>Make BILOO feel familiar across customer, vendor and driver workspaces.</p></div>
                <span className="biloo-settings-panel-icon"><Icon name="admin" /></span>
              </header>
              <div className="biloo-settings-preference-grid">
                <label>
                  <span>Language</span>
                  <select value={preferences.language} onChange={(event) => updatePreference("language", event.target.value as Preferences["language"])}>
                    <option>English</option><option>Afaan Oromo</option><option>Amharic</option>
                  </select>
                  <small>Interface translations will expand progressively.</small>
                </label>
                <Toggle checked={preferences.compactMode} description="Reduce spacing in dense operational screens." label="Compact workspace" onChange={(value) => updatePreference("compactMode", value)} />
              </div>
            </section>

            <section className="biloo-settings-panel biloo-settings-security" id="security">
              <header>
                <div><small>ACCOUNT PROTECTION</small><h2>Security and privacy</h2><p>Your session is authenticated and your password is never displayed inside BILOO.</p></div>
                <span className="biloo-settings-panel-icon"><Icon name="shield" /></span>
              </header>
              <div className="biloo-settings-security-grid">
                <article><span><Icon name="check" /></span><div><strong>Secure session active</strong><small>Supabase authentication protects this account.</small></div></article>
                <article><span><Icon name="location" /></span><div><strong>Location permission</strong><small>Used only when you request nearby services or navigation.</small></div></article>
                <article><span><Icon name="customer" /></span><div><strong>Privacy controls</strong><small>Review how BILOO handles account and service data.</small></div><Link href="/privacy">View policy</Link></article>
              </div>
            </section>

            <div className="biloo-settings-savebar">
              <span>{saved ? <><Icon name="check" /> Settings saved on this device</> : "Review your preferences, then save changes."}</span>
              <button type="submit"><Icon name="check" />Save settings</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
