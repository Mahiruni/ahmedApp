"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { roles, type Role } from "@/data/biloo";

import { BrandMark, Icon } from "./ui";

const roleChangeEvent = "biloo:role-change";
const roleStateEvent = "biloo:role-state";

type RoleState = {
  role: Role;
  availableRoles: Role[];
};

function announceRoleChange(role: Role) {
  window.dispatchEvent(new CustomEvent<Role>(roleChangeEvent, { detail: role }));
}

function announceRoleState(role: Role, availableRoles: Role[]) {
  window.dispatchEvent(
    new CustomEvent<RoleState>(roleStateEvent, {
      detail: { role, availableRoles },
    }),
  );
}

export function AppHeader({
  cartCount,
  unreadCount,
  onOpenCart,
  onOpenNotifications,
  availableRoles = roles.map((item) => item.key),
  accountInitials = "BI",
  liveData = false,
}: {
  cartCount: number;
  unreadCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  availableRoles?: Role[];
  accountInitials?: string;
  liveData?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleState, setRoleState] = useState<RoleState>({
    role: availableRoles[0] ?? "customer",
    availableRoles,
  });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const visibleRoles = roles.filter((item) =>
    roleState.availableRoles.includes(item.key),
  );
  const currentRole =
    roles.find((item) => item.key === roleState.role) ?? roles[0];

  useEffect(() => {
    function syncRoleState(event: Event) {
      const detail = (event as CustomEvent<RoleState>).detail;
      if (!detail?.availableRoles?.length) return;
      setRoleState(detail);
    }

    window.addEventListener(roleStateEvent, syncRoleState);
    return () => window.removeEventListener(roleStateEvent, syncRoleState);
  }, []);

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

  function switchWorkspace(nextRole: Role) {
    if (!roleState.availableRoles.includes(nextRole)) return;
    setRoleState((current) => ({ ...current, role: nextRole }));
    setMenuOpen(false);
    announceRoleChange(nextRole);
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-[#e8e8e8] bg-white/95 px-4 backdrop-blur-xl sm:px-6"
        data-biloo-header
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3">
          <Link
            aria-label="BILOO home"
            className="shrink-0 rounded-lg transition-opacity hover:opacity-70"
            href="/biloo"
          >
            <BrandMark />
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-[#f3f3f3] px-3 text-[12px] font-medium text-[#333333]">
              <Icon className="size-4" name={currentRole.icon} />
              {currentRole.label}
              <span className="size-1.5 rounded-full bg-[#06c167]" />
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <HeaderAction
              badge={cartCount ? String(cartCount) : undefined}
              label="Open cart"
              onClick={onOpenCart}
            >
              <Icon className="size-[19px]" name="cart" />
            </HeaderAction>
            <HeaderAction
              alert={Boolean(unreadCount)}
              label="Open notifications"
              onClick={onOpenNotifications}
            >
              <Icon className="size-[19px]" name="bell" />
            </HeaderAction>

            <button
              ref={menuButtonRef}
              aria-controls="biloo-command-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close BILOO menu" : "Open BILOO menu"}
              className={`group ml-0.5 flex size-10 items-center justify-center rounded-full transition ${
                menuOpen
                  ? "bg-[#333333] text-white"
                  : "bg-black text-white hover:bg-[#333333]"
              }`}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span className="relative block h-4 w-[18px]" aria-hidden="true">
                <span
                  className={`absolute left-0 top-[4px] h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-200 ${
                    menuOpen ? "translate-y-[3.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-[4px] left-0 h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-200 ${
                    menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[80] transition-opacity duration-200 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        id="biloo-command-menu"
      >
        <button
          aria-label="Close BILOO menu"
          className="absolute inset-0 bg-black/35"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          type="button"
        />

        <section
          aria-label="BILOO navigation"
          aria-modal="true"
          className={`absolute inset-y-0 right-0 flex w-[min(90vw,360px)] flex-col bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))]">
            <BrandMark />
            <button
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-full bg-[#f3f3f3] text-black transition hover:bg-[#e8e8e8]"
              onClick={() => setMenuOpen(false)}
              type="button"
            >
              <Icon className="size-[17px]" name="close" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#f3f3f3] p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-[11px] font-semibold text-white">
                {accountInitials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-black">
                  BILOO account
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[#6b6b6b]">
                  {currentRole.label} workspace · {liveData ? "Connected" : "Demo"}
                </span>
              </span>
              <span className={`size-2 rounded-full ${liveData ? "bg-[#06c167]" : "bg-[#9b9b9b]"}`} />
            </div>

            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold text-[#6b6b6b]">
              Workspaces
            </p>
            <div className="overflow-hidden rounded-xl border border-[#e8e8e8]">
              {visibleRoles.map((item, index) => {
                const active = item.key === roleState.role;
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[54px] w-full items-center gap-3 px-3.5 text-left transition ${
                      active ? "bg-[#f3f3f3]" : "bg-white hover:bg-[#f8f8f8]"
                    } ${index ? "border-t border-[#eeeeee]" : ""}`}
                    key={item.key}
                    onClick={() => switchWorkspace(item.key)}
                    type="button"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                        active ? "bg-black text-white" : "bg-[#eeeeee] text-black"
                      }`}
                    >
                      <Icon className="size-4" name={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] font-medium text-black">
                      {item.label}
                    </span>
                    {active ? (
                      <span className="size-2 rounded-full bg-[#06c167]" />
                    ) : (
                      <Icon className="size-4 text-[#a0a0a0]" name="arrow" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold text-[#6b6b6b]">
              Account
            </p>
            <div className="overflow-hidden rounded-xl border border-[#e8e8e8]">
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
              <MenuLink
                href={liveData ? "/account" : "/auth/login"}
                icon="customer"
                label="Account settings"
                onClick={() => setMenuOpen(false)}
              />
              <MenuLink
                href="/biloo"
                icon="home"
                label="BILOO home"
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </div>

          <footer className="border-t border-[#eeeeee] px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between text-[10px] text-[#777777]">
              <span>{liveData ? "Supabase connected" : "Local preview"}</span>
              <span>Addis Ababa</span>
            </div>
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
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  alert?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-full bg-[#f3f3f3] text-black transition hover:bg-[#e8e8e8]"
      onClick={onClick}
      type="button"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] font-semibold text-white ring-2 ring-white">
          {badge}
        </span>
      ) : null}
      {alert ? (
        <span className="absolute right-1 top-1 size-2 rounded-full bg-[#d92d20] ring-2 ring-[#f3f3f3]" />
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
      className="flex min-h-[52px] w-full items-center gap-3 border-b border-[#eeeeee] bg-white px-3.5 text-left transition last:border-b-0 hover:bg-[#f8f8f8]"
      onClick={onClick}
      type="button"
    >
      <span className="relative grid size-8 place-items-center rounded-lg bg-[#eeeeee] text-black">
        <Icon className="size-4" name={icon} />
        {alert ? (
          <span className="absolute right-0 top-0 size-2 rounded-full bg-[#d92d20] ring-2 ring-[#eeeeee]" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-medium text-black">{label}</span>
      {badge ? (
        <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-semibold text-white">
          {badge}
        </span>
      ) : (
        <Icon className="size-4 text-[#a0a0a0]" name="arrow" />
      )}
    </button>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: "customer" | "home";
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      className="flex min-h-[52px] items-center gap-3 border-b border-[#eeeeee] bg-white px-3.5 transition last:border-b-0 hover:bg-[#f8f8f8]"
      href={href}
      onClick={onClick}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[#eeeeee] text-black">
        <Icon className="size-4" name={icon} />
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-medium text-black">{label}</span>
      <Icon className="size-4 text-[#a0a0a0]" name="arrow" />
    </Link>
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

  useEffect(() => {
    announceRoleState(role, availableRoles);
  }, [availableRoles, role]);

  useEffect(() => {
    function switchFromHeader(event: Event) {
      const nextRole = (event as CustomEvent<Role>).detail;
      if (nextRole !== role && availableRoles.includes(nextRole)) setRole(nextRole);
    }

    window.addEventListener(roleChangeEvent, switchFromHeader);
    return () => window.removeEventListener(roleChangeEvent, switchFromHeader);
  }, [availableRoles, role, setRole]);

  function selectRole(nextRole: Role) {
    setRole(nextRole);
    announceRoleState(nextRole, availableRoles);
  }

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8e8e8] bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:sticky lg:inset-auto lg:top-20 lg:z-20 lg:mx-4 lg:my-5 lg:h-[calc(100vh-100px)] lg:rounded-2xl lg:border lg:pb-0 lg:shadow-none"
      data-biloo-role-rail
    >
      <div className="hidden border-b border-[#eeeeee] px-4 py-4 lg:block">
        <p className="text-[12px] font-semibold text-black">Workspaces</p>
        <p className="mt-1 text-[11px] leading-4 text-[#777777]">
          Switch operational views.
        </p>
      </div>

      <div
        className={`grid lg:block ${
          visibleRoles.length === 1 ? "grid-cols-1" : "grid-cols-4"
        }`}
      >
        {visibleRoles.map((item) => {
          const active = role === item.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-[60px] w-full flex-col items-center justify-center gap-1 px-1 text-center transition lg:min-h-[54px] lg:flex-row lg:justify-start lg:gap-3 lg:border-b lg:border-[#eeeeee] lg:px-3.5 lg:text-left ${
                active
                  ? "text-black"
                  : "text-[#777777] hover:bg-[#f8f8f8] hover:text-black"
              }`}
              key={item.key}
              onClick={() => selectRole(item.key)}
              type="button"
            >
              <span
                className={`relative grid size-6 shrink-0 place-items-center rounded-md lg:size-8 ${
                  active ? "bg-black text-white" : "bg-transparent text-current lg:bg-[#eeeeee]"
                }`}
              >
                <Icon className="size-[18px] lg:size-4" name={item.icon} />
              </span>
              <span className="text-[10px] font-medium lg:text-[13px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-3 mt-auto hidden rounded-xl bg-[#f3f3f3] p-3 lg:block">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${liveData ? "bg-[#06c167]" : "bg-[#9b9b9b]"}`} />
          <p className="text-[11px] font-medium text-black">
            {liveData ? "Production connected" : "Demo experience"}
          </p>
        </div>
      </div>
    </aside>
  );
}
