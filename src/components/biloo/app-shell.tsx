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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1540px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="BILOO home"
            className="grid size-11 shrink-0 place-items-center rounded-2xl border border-slate-200 text-[#082640] transition hover:border-[#082640]"
            href="/biloo"
          >
            ←
          </Link>
          <BrandMark />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`hidden rounded-full px-4 py-2 text-[11px] font-black md:inline-flex ${
              liveData
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            ● {liveData ? "Supabase live" : "Demo mode"}
          </span>
          <button
            aria-label="Open cart"
            className="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-[#082640] transition hover:border-[#082640]"
            onClick={onOpenCart}
            type="button"
          >
            <Icon name="cart" />
            {cartCount ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#f2bd4b] px-1 text-[9px] font-black text-[#082640] ring-2 ring-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            aria-label="Open notifications"
            className="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-[#082640] transition hover:border-[#082640]"
            onClick={onOpenNotifications}
            type="button"
          >
            <Icon name="bell" />
            {unreadCount ? (
              <span className="absolute right-2 top-2 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            ) : null}
          </button>
          <Link
            aria-label="Open account"
            className="grid size-11 place-items-center rounded-2xl bg-[#082640] text-xs font-black text-white shadow-lg shadow-[#082640]/15"
            href={liveData ? "/account" : "/auth/login"}
          >
            {accountInitials}
          </Link>
        </div>
      </div>
    </header>
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
    <aside className="border-b border-slate-200 bg-white px-3 py-4 lg:min-h-[calc(100vh-72px)] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
      <p className="hidden px-3 text-[10px] font-black uppercase tracking-[0.19em] text-slate-400 lg:block">
        Application mode
      </p>
      <div
        className={`grid gap-2 lg:mt-3 lg:grid-cols-1 ${
          visibleRoles.length === 1 ? "grid-cols-1" : "grid-cols-4"
        }`}
      >
        {visibleRoles.map((item) => {
          const active = role === item.key;
          return (
            <button
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-left ${
                active
                  ? "bg-[#082640] text-white shadow-lg shadow-[#082640]/15"
                  : "bg-[#f5f8fa] text-slate-600 hover:bg-slate-100"
              }`}
              key={item.key}
              onClick={() => setRole(item.key)}
              type="button"
            >
              <Icon
                className={`size-5 shrink-0 ${active ? "text-[#f2bd4b]" : "text-[#082640]"}`}
                name={item.icon}
              />
              <span className="mt-2 min-w-0 lg:mt-0">
                <span className="block text-[11px] font-black sm:text-xs lg:text-sm">
                  {item.label}
                </span>
                <span
                  className={`mt-1 hidden text-xs lg:block ${
                    active ? "text-white/55" : "text-slate-400"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 hidden rounded-[1.55rem] bg-[#fff8e6] p-5 lg:block">
        <div className="flex items-center gap-2 text-amber-700">
          <Icon className="size-4" name="shield" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em]">
            {liveData ? "Production foundation" : "Local preview"}
          </p>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
          {liveData
            ? "Your account, orders and notifications are secured by Supabase Auth, RLS and Realtime."
            : "Supabase variables are not configured, so this preview stores activity only on this device."}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full bg-[#d99a1f] ${liveData ? "w-[68%]" : "w-[46%]"}`}
          />
        </div>
        <p className="mt-2 text-xs font-black text-amber-800">
          {liveData
            ? "Phase 2 · Auth and shared data"
            : "Phase 1 · Experience foundation"}
        </p>
      </div>
    </aside>
  );
}
