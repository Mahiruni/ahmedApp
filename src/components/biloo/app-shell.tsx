"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { roles, type Role } from "@/data/biloo";

import { BrandMark, Icon } from "./ui";

export function AppHeader({
  cartCount,
  unreadCount,
  onOpenCart,
  onOpenNotifications,
  role,
  setRole,
  availableRoles = roles.map((item) => item.key),
  accountInitials = "BI",
  liveData = false,
}: {
  cartCount: number;
  unreadCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  role: Role;
  setRole: (role: Role) => void;
  availableRoles?: Role[];
  accountInitials?: string;
  liveData?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const visibleRoles = roles.filter((item) => availableRoles.includes(item.key));
  const currentRole = roles.find((item) => item.key === role) ?? roles[0];

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  function runMenuAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/92 px-3 backdrop-blur-2xl sm:px-5"
        data-biloo-header
      >
        <div className="mx-auto flex h-[76px] max-w-[1540px] items-center gap-3 sm:gap-5">
          <Link
            aria-label="BILOO home"
            className="min-w-0 shrink-0 rounded-2xl transition hover:opacity-78"
            href="/biloo"
          >
            <BrandMark />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200/75 bg-slate-50/86 p-1 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
              <span className="flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-[11px] font-black text-[#07111f] shadow-sm">
                <span className="grid size-6 place-items-center rounded-full bg-[#07111f] text-[#55e6b1]">
                  <Icon className="size-3.5" name={currentRole.icon} />
                </span>
                {currentRole.label} workspace
              </span>
              <span className="flex min-h-10 items-center gap-2 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                <span className="biloo-pulse size-2 rounded-full bg-[#55e6b1]" />
                Connected commerce
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <span
              className={`hidden min-h-10 items-center gap-2 rounded-full px-3.5 text-[9px] font-black uppercase tracking-[0.14em] xl:inline-flex ${
                liveData
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  liveData ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {liveData ? "Live data" : "Demo mode"}
            </span>

            <HeaderAction
              badge={cartCount ? String(cartCount) : undefined}
              className="hidden sm:grid"
              label="Open cart"
              onClick={onOpenCart}
            >
              <Icon name="cart" />
            </HeaderAction>
            <HeaderAction
              alert={Boolean(unreadCount)}
              className="hidden sm:grid"
              label="Open notifications"
              onClick={onOpenNotifications}
            >
              <Icon name="bell" />
            </HeaderAction>

            <button
              ref={menuButtonRef}
              aria-controls="biloo-command-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close BILOO menu" : "Open BILOO menu"}
              className={`group flex min-h-12 items-center gap-2 rounded-full border px-1.5 pr-2 transition duration-200 sm:pr-3 ${
                menuOpen
                  ? "border-[#07111f] bg-[#07111f] text-white shadow-[0_16px_38px_rgba(7,17,31,0.2)]"
                  : "border-slate-200/85 bg-white text-[#07111f] shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }`}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span
                className={`grid size-9 place-items-center rounded-full text-[10px] font-black transition ${
                  menuOpen
                    ? "bg-white text-[#07111f]"
                    : "bg-gradient-to-br from-[#07111f] to-[#123b66] text-white"
                }`}
              >
                {accountInitials}
              </span>
              <span className="hidden text-xs font-black sm:block">Menu</span>
              <span className="relative ml-0.5 block h-4 w-4" aria-hidden="true">
                <span
                  className={`absolute left-0 top-[4px] h-[1.5px] w-4 rounded-full bg-current transition ${
                    menuOpen ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-[4px] left-0 h-[1.5px] w-4 rounded-full bg-current transition ${
                    menuOpen ? "-translate-y-[3px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[80] transition duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        id="biloo-command-menu"
      >
        <button
          aria-label="Close BILOO menu"
          className="absolute inset-0 bg-[#07111f]/42 backdrop-blur-[6px]"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          type="button"
        />

        <section
          aria-label="BILOO navigation"
          aria-modal="true"
          className={`absolute inset-x-3 bottom-3 top-[88px] flex flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/96 shadow-[0_36px_110px_rgba(7,17,31,0.34)] backdrop-blur-2xl transition duration-300 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-[88px] sm:max-h-[calc(100svh-104px)] sm:w-[460px] ${
            menuOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-[0.98] opacity-0"
          }`}
          role="dialog"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/75 px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  BILOO command center
                </span>
                <span
                  className={`size-1.5 rounded-full ${
                    liveData ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-[#07111f]">
                Move through BILOO.
              </h2>
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Switch workspace, open your activity, or manage your account from one focused menu.
              </p>
            </div>
            <button
              aria-label="Close menu"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-[#07111f] transition hover:rotate-6 hover:bg-[#07111f] hover:text-white"
              onClick={() => setMenuOpen(false)}
              type="button"
            >
              <Icon className="size-4" name="close" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Workspaces
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
                {visibleRoles.length} available
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {visibleRoles.map((item) => {
                const active = item.key === role;
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-[86px] items-center gap-3 rounded-[1.35rem] border p-3.5 text-left transition duration-200 ${
                      active
                        ? "border-[#07111f] bg-[#07111f] text-white shadow-[0_16px_38px_rgba(7,17,31,0.16)]"
                        : "border-slate-200/80 bg-white text-[#07111f] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    }`}
                    key={item.key}
                    onClick={() => runMenuAction(() => setRole(item.key))}
                    type="button"
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                        active
                          ? "bg-white/10 text-[#55e6b1]"
                          : "bg-[#eef3f8] text-[#123b66]"
                      }`}
                    >
                      <Icon name={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black">{item.label}</span>
                      <span
                        className={`mt-1 block text-[10px] leading-4 ${
                          active ? "text-white/45" : "text-slate-400"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>
                    <Icon
                      className={`size-4 transition group-hover:translate-x-0.5 ${
                        active ? "text-[#55e6b1]" : "text-slate-300"
                      }`}
                      name="arrow"
                    />
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Quick access
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MenuAction
                badge={cartCount ? String(cartCount) : undefined}
                icon="cart"
                label="Cart"
                onClick={() => runMenuAction(onOpenCart)}
              />
              <MenuAction
                alert={Boolean(unreadCount)}
                icon="bell"
                label="Notifications"
                onClick={() => runMenuAction(onOpenNotifications)}
              />
              <Link
                className="group flex min-h-16 items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white px-3.5 text-[#07111f] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                href={liveData ? "/account" : "/auth/login"}
                onClick={() => setMenuOpen(false)}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-[#eef3f8] text-[#123b66]">
                  <Icon className="size-4" name="customer" />
                </span>
                <span className="text-xs font-black">Account</span>
                <Icon className="ml-auto size-3.5 text-slate-300 transition group-hover:translate-x-0.5" name="arrow" />
              </Link>
              <Link
                className="group flex min-h-16 items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white px-3.5 text-[#07111f] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                href="/biloo"
                onClick={() => setMenuOpen(false)}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-[#eef3f8] text-[#123b66]">
                  <Icon className="size-4" name="home" />
                </span>
                <span className="text-xs font-black">BILOO home</span>
                <Icon className="ml-auto size-3.5 text-slate-300 transition group-hover:translate-x-0.5" name="arrow" />
              </Link>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-slate-200/75 bg-slate-50/82 px-5 py-4 sm:px-6">
            <span className="flex items-center gap-2 text-[10px] font-black text-slate-500">
              <span
                className={`size-2 rounded-full ${
                  liveData ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {liveData ? "Supabase connected" : "Local demo experience"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-300">
              Addis Ababa
            </span>
          </footer>
        </section>
      </div>
    </>
  );
}

function HeaderAction({
  children,
  label,
  onClick,
  badge,
  alert = false,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  alert?: boolean;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`relative size-11 place-items-center rounded-full border border-slate-200/85 bg-white text-[#07111f] shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ffca68] px-1 text-[9px] font-black text-[#07111f] ring-2 ring-white">
          {badge}
        </span>
      ) : null}
      {alert ? (
        <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      ) : null}
    </button>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  badge,
  alert = false,
}: {
  icon: "cart" | "bell";
  label: string;
  onClick: () => void;
  badge?: string;
  alert?: boolean;
}) {
  return (
    <button
      className="group relative flex min-h-16 items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white px-3.5 text-left text-[#07111f] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
      type="button"
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-[#eef3f8] text-[#123b66]">
        <Icon className="size-4" name={icon} />
        {alert ? (
          <span className="absolute right-0 top-0 size-2 rounded-full bg-rose-500 ring-2 ring-[#eef3f8]" />
        ) : null}
      </span>
      <span className="text-xs font-black">{label}</span>
      {badge ? (
        <span className="ml-auto rounded-full bg-[#ffca68] px-2 py-1 text-[9px] font-black text-[#07111f]">
          {badge}
        </span>
      ) : (
        <Icon className="ml-auto size-3.5 text-slate-300 transition group-hover:translate-x-0.5" name="arrow" />
      )}
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
          <div
            className={`h-full rounded-full bg-gradient-to-r from-[#55e6b1] to-[#ffca68] ${
              liveData ? "w-[72%]" : "w-[58%]"
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
