import type { ReactNode } from "react";

import type { IconName, ServiceKey } from "@/data/biloo";

export function formatETB(value: number) {
  return `ETB ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function serviceLabel(service: ServiceKey) {
  const labels: Record<ServiceKey, string> = {
    food: "Food delivery",
    taxi: "Taxi",
    market: "Supermarket",
    construction: "Construction",
    parts: "Car parts",
  };

  return labels[service];
}

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "food":
      return (
        <svg {...common}>
          <path d="M7 3v8M4.5 3v4.2A2.8 2.8 0 0 0 7.3 10H9.5V3M7 10v11M15 3v18M15 3c3 1.5 4.5 4 4.5 7.5H15" />
        </svg>
      );
    case "taxi":
      return (
        <svg {...common}>
          <path d="m5 16-1 2v2h3l1-2h8l1 2h3v-2l-1-2-1.5-6.2A2.4 2.4 0 0 0 15.2 8H8.8a2.4 2.4 0 0 0-2.3 1.8L5 16Z" />
          <path d="M8 8 9 5h6l1 3M7 14h.01M17 14h.01M6 17h12" />
        </svg>
      );
    case "market":
    case "cart":
      return (
        <svg {...common}>
          <path d="M3 4h2l2.2 10.2A2 2 0 0 0 9.1 16h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />
          <path d="M9 21h.01M18 21h.01" />
        </svg>
      );
    case "construction":
      return (
        <svg {...common}>
          <path d="M4 21h16M6 21V8h8v13M14 11h4v10M8 11h4M8 14h4M8 17h4" />
          <path d="m5 8 5-5 5 5" />
        </svg>
      );
    case "parts":
      return (
        <svg {...common}>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
          <path d="m4.9 4.9 2 2M17.1 17.1l2 2M19.1 4.9l-2 2M6.9 17.1l-2 2M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18v4H6.5a2.5 2.5 0 0 0 0 5H21v7H6a2 2 0 0 1-2-2V6.5Z" />
          <path d="M16 11h5M17.5 15h.01" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m12 2.7 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2L2.9 9.3l6.3-.9L12 2.7Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "driver":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21a7 7 0 0 1 14 0M4 13h3M17 13h3" />
        </svg>
      );
    case "vendor":
      return (
        <svg {...common}>
          <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
          <path d="M8 20v-6h8v6M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" />
        </svg>
      );
    case "admin":
      return (
        <svg {...common}>
          <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
        </svg>
      );
    case "customer":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "support":
      return (
        <svg {...common}>
          <path d="M4 13a8 8 0 1 1 16 0v4a2 2 0 0 1-2 2h-3" />
          <path d="M4 13v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2ZM20 13v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v5c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V6l-8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="m3 17 6-6 4 4 8-9" />
          <path d="M15 6h6v6" />
        </svg>
      );
    case "inventory":
      return (
        <svg {...common}>
          <path d="m4 7 8-4 8 4-8 4-8-4Z" />
          <path d="m4 7 8 4 8-4v10l-8 4-8-4V7ZM12 11v10" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 20h18.4L12 3Z" />
          <path d="M12 9v5M12 17h.01" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );
    case "cash":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7 9H6v1M17 15h1v-1" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M10 17h4" />
        </svg>
      );
    case "navigation":
      return (
        <svg {...common}>
          <path d="m4 4 16 7-7 2-2 7-7-16Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#082640] text-sm font-black tracking-[-0.06em] text-[#f2bd4b] shadow-[0_12px_30px_rgba(8,38,64,0.22)]">
        BL
      </span>
      {!compact ? (
        <div>
          <p className="text-xl font-black tracking-[-0.05em] text-[#082640]">
            BILOO
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-slate-400">
            One app. Every move.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.8rem] border border-slate-200/90 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.045)] ${className}`}
    >
      {children}
    </section>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
    brand: "bg-[#e9f1f7] text-[#082640]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-black ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
