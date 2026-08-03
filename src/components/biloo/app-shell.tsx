"use client";

import Link from "next/link";

import { roles, type Role } from "@/data/biloo";

import { BrandMark, Icon } from "./ui";

export function AppHeader({
  cartCount,
  unreadCount,
  onOpenCart,
  onOpenNotifications,
  accountInitials = "BI",
  liveData = false,
}: {
  cartCount: number;
  unreadCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  accountInitials?: string;
  liveData?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 px-2 pt-2 sm:px-4" data-biloo-header>
      <div className="mx-auto flex h-[70px] max-w-[1560px] items-center justify-between gap-3 rounded-[1.45rem] border border-white/80 bg-white/82 px-3 shadow-[0_18px_55px_rgba(24,39,65,0.1)] backdrop-blur-2xl sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            aria-label="BILOO home"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#0a1b31] text-white shadow-[0_12px_30px_rgba(7,17,31,0.18)] transition hover:-translate-y-0.5 hover:bg-[#123b66]"
            href="/biloo"
          >
            <Icon className="size-4 rotate-180" name="arrow" />
          </Link>
          <div className="rounded-2xl px-1 py-1">
            <BrandMark />
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-2 lg:flex">
          <span className="biloo-pulse size-2 rounded-full bg-[#55e6b1]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Connected commerce · Addis Ababa
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] md:inline-flex ${
              liveData
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span className={`size-1.5 rounded-full ${liveData ? "bg-emerald-500" : "bg-amber-500"}`} />
            {liveData ? "Live data" : "Demo mode"}
          </span>
          <HeaderAction
            badge={cartCount ? String(cartCount) : undefined}
            label="Open cart"
            onClick={onOpenCart}
          >
            <Icon name="cart" />
          </HeaderAction>
          <HeaderAction
            alert={Boolean(unreadCount)}
            label="Open notifications"
            onClick={onOpenNotifications}
          >
            <Icon name="bell" />
          </HeaderAction>
          <Link
            aria-label="Open account"
            className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#0a1b31] to-[#123b66] text-xs font-black text-white shadow-[0_12px_30px_rgba(7,17,31,0.22)] transition hover:-translate-y-0.5"
            href={liveData ? "/account" : "/auth/login"}
          >
            {accountInitials}
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeaderAction({
  children,
  label,
  onClick,
  badge,
  alert = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  alert?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="relative grid size-11 place-items-center rounded-2xl border border-slate-200/80 bg-white text-[#0a1b31] shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
      type="button"
    >
      {children}
      {badge ? (
        <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ffca68] px-1 text-[9px] font-black text-[#07111f] ring-2 ring-white">
          {badge}
        </span>
      ) : null}
      {alert ? (
        <span className="absolute right-2 top-2 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      ) : null}
    </button>
  );
}

export function RoleRail({
  role,
  setRole,
  availableRoles = roles.map((item) => item.key),
  liveData = false,
}: {
  role: Role;
  setRole: (role: Role) => void;
  availableRoles?: Role[];
  liveData?: boolean;
}) {
  const visibleRoles = roles.filter((item) => availableRoles.includes(item.key));

  return (
    <aside
      className="fixed inset-x-2 bottom-2 z-50 rounded-[1.55rem] border border-white/15 bg-[#07111f]/94 p-2 shadow-[0_24px_70px_rgba(7,17,31,0.34)] backdrop-blur-2xl lg:sticky lg:inset-auto lg:top-[88px] lg:z-20 lg:mx-4 lg:my-4 lg:h-[calc(100vh-104px)] lg:rounded-[2rem] lg:p-4"
      data-biloo-role-rail
    >
      <div className="hidden px-3 pt-2 lg:block">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
          Workspaces
        </p>
        <p className="mt-2 text-sm font-bold leading-5 text-white/72">
          One operating system for every side of BILOO.
        </p>
      </div>

      <div
        className={`grid gap-1.5 lg:mt-5 lg:grid-cols-1 lg:gap-2 ${
          visibleRoles.length === 1 ? "grid-cols-1" : "grid-cols-4"
        }`}
      >
        {visibleRoles.map((item) => {
          const active = role === item.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-[62px] flex-col items-center justify-center rounded-[1.15rem] px-2 py-2 text-center transition duration-300 lg:min-h-[68px] lg:flex-row lg:justify-start lg:gap-3 lg:px-3.5 lg:text-left ${
                active
                  ? "bg-white text-[#07111f] shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
                  : "text-white/52 hover:bg-white/8 hover:text-white"
              }`}
              key={item.key}
              onClick={() => setRole(item.key)}
              type="button"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-xl transition ${
                  active
                    ? "bg-[#0a1b31] text-[#55e6b1]"
                    : "bg-white/8 text-white/70 group-hover:bg-white/12"
                }`}
              >
                <Icon className="size-4.5" name={item.icon} />
              </span>
              <span className="mt-1.5 min-w-0 lg:mt-0">
                <span className="block text-[10px] font-black sm:text-[11px] lg:text-sm">
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 hidden text-[11px] leading-4 lg:block ${
                    active ? "text-slate-400" : "text-white/30"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto hidden rounded-[1.45rem] border border-white/8 bg-white/5 p-4 lg:block">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#55e6b1]/12 text-[#55e6b1]">
            <Icon className="size-5" name="shield" />
          </span>
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
            Phase 2.1
          </span>
        </div>
        <p className="mt-4 text-sm font-black text-white">
          {liveData ? "Production connected" : "Experience preview"}
        </p>
        <p className="mt-2 text-xs leading-5 text-white/38">
          {liveData
            ? "Secure shared data, realtime updates and authenticated workspaces."
            : "The complete connected lifecycle is running locally on this device."}
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className={`h-full rounded-full bg-gradient-to-r from-[#55e6b1] to-[#ffca68] ${liveData ? "w-[72%]" : "w-[58%]"}`} />
        </div>
      </div>
    </aside>
  );
}
