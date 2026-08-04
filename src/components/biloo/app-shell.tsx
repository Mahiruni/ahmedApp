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

type CustomerSection = "home" | "explore";

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
      <header className="biloo-app-header" data-biloo-header>
        <div className="biloo-app-header-inner">
          <Link
            aria-label="BILOO home"
            className="biloo-header-brand"
            href="/biloo"
          >
            <BrandMark />
          </Link>

          <div className="biloo-header-workspace">
            <span className="biloo-header-workspace-pill">
              <Icon className="size-[17px]" name={currentRole.icon} />
              <span>{currentRole.label}</span>
              <i aria-hidden="true" />
            </span>
          </div>

          <div className="biloo-header-actions">
            <HeaderAction
              badge={cartCount ? String(cartCount) : undefined}
              label="Open cart"
              onClick={onOpenCart}
            >
              <Icon className="size-[21px]" name="cart" />
            </HeaderAction>
            <HeaderAction
              alert={Boolean(unreadCount)}
              label="Open notifications"
              onClick={onOpenNotifications}
            >
              <Icon className="size-[21px]" name="bell" />
            </HeaderAction>

            <button
              ref={menuButtonRef}
              aria-controls="biloo-command-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close BILOO menu" : "Open BILOO menu"}
              className="biloo-header-menu-button"
              data-open={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span className="biloo-header-menu-lines" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className="biloo-command-overlay"
        data-open={menuOpen}
        id="biloo-command-menu"
      >
        <button
          aria-label="Close BILOO menu"
          className="biloo-command-backdrop"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          type="button"
        />

        <section
          aria-label="BILOO navigation"
          aria-modal="true"
          className="biloo-command-panel"
          data-open={menuOpen}
          role="dialog"
        >
          <div className="biloo-command-head">
            <BrandMark />
            <button
              aria-label="Close menu"
              className="biloo-command-close"
              onClick={() => setMenuOpen(false)}
              type="button"
            >
              <Icon className="size-[19px]" name="close" />
            </button>
          </div>

          <div className="biloo-command-scroll">
            <div className="biloo-command-account">
              <span className="biloo-command-avatar">{accountInitials}</span>
              <span className="biloo-command-account-copy">
                <strong>BILOO account</strong>
                <small>
                  {currentRole.label} workspace · {liveData ? "Connected" : "Demo"}
                </small>
              </span>
              <span
                aria-label={liveData ? "Connected" : "Demo mode"}
                className="biloo-command-status"
                data-live={liveData}
                role="status"
              />
            </div>

            <p className="biloo-command-label">Workspaces</p>
            <div className="biloo-command-group">
              {visibleRoles.map((item) => {
                const active = item.key === roleState.role;
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className="biloo-command-row"
                    data-active={active}
                    key={item.key}
                    onClick={() => switchWorkspace(item.key)}
                    type="button"
                  >
                    <span className="biloo-command-row-icon">
                      <Icon className="size-[20px]" name={item.icon} />
                    </span>
                    <span className="biloo-command-row-copy">
                      <strong>{item.label}</strong>
                      <small>{active ? "Current workspace" : "Open workspace"}</small>
                    </span>
                    {active ? (
                      <span className="biloo-command-current" aria-hidden="true" />
                    ) : (
                      <Icon className="size-[18px]" name="arrow" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="biloo-command-label">Account and activity</p>
            <div className="biloo-command-group">
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

          <footer className="biloo-command-footer">
            <span>{liveData ? "Supabase connected" : "Local preview"}</span>
            <span>Addis Ababa</span>
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
      className="biloo-header-action"
      onClick={onClick}
      type="button"
    >
      {children}
      {badge ? <span className="biloo-header-badge">{badge}</span> : null}
      {alert ? <span className="biloo-header-alert" /> : null}
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
    <button className="biloo-command-row" onClick={onClick} type="button">
      <span className="biloo-command-row-icon">
        <Icon className="size-[20px]" name={icon} />
        {alert ? <span className="biloo-command-row-alert" /> : null}
      </span>
      <span className="biloo-command-row-copy">
        <strong>{label}</strong>
        <small>Open {label.toLowerCase()}</small>
      </span>
      {badge ? (
        <span className="biloo-command-count">{badge}</span>
      ) : (
        <Icon className="size-[18px]" name="arrow" />
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
    <Link className="biloo-command-row" href={href} onClick={onClick}>
      <span className="biloo-command-row-icon">
        <Icon className="size-[20px]" name={icon} />
      </span>
      <span className="biloo-command-row-copy">
        <strong>{label}</strong>
        <small>Open {label.toLowerCase()}</small>
      </span>
      <Icon className="size-[18px]" name="arrow" />
    </Link>
  );
}

function CustomerNavButton({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: "home" | "search" | "cart";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className="biloo-customer-nav-item"
      data-active={active}
      onClick={onClick}
      type="button"
    >
      <span className="biloo-customer-nav-icon">
        <Icon className="size-[22px]" name={icon} />
      </span>
      <span>{label}</span>
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
  const customerOnly = role === "customer" && visibleRoles.length === 1;
  const [customerSection, setCustomerSection] =
    useState<CustomerSection>("home");

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

  useEffect(() => {
    if (!customerOnly) return;

    function updateSection() {
      const home = document.querySelector<HTMLElement>(
        "[data-biloo-customer-home]",
      );
      const explore = home?.nextElementSibling;
      if (!(explore instanceof HTMLElement)) return;
      setCustomerSection(
        explore.getBoundingClientRect().top <= 150 ? "explore" : "home",
      );
    }

    updateSection();
    window.addEventListener("scroll", updateSection, { passive: true });
    window.addEventListener("resize", updateSection);
    return () => {
      window.removeEventListener("scroll", updateSection);
      window.removeEventListener("resize", updateSection);
    };
  }, [customerOnly]);

  function selectRole(nextRole: Role) {
    setRole(nextRole);
    announceRoleState(nextRole, availableRoles);
  }

  function goToCustomerSection(section: CustomerSection) {
    const home = document.querySelector<HTMLElement>(
      "[data-biloo-customer-home]",
    );
    const target = section === "home" ? home : home?.nextElementSibling;
    if (!(target instanceof HTMLElement)) return;
    setCustomerSection(section);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openCart() {
    document
      .querySelector<HTMLButtonElement>(
        '[data-biloo-header] button[aria-label="Open cart"]',
      )
      ?.click();
  }

  if (customerOnly) {
    return (
      <aside
        className="biloo-customer-nav"
        data-biloo-role-rail
        data-mode="customer"
      >
        <div className="biloo-customer-nav-head">
          <span>Customer</span>
          <strong>Quick navigation</strong>
        </div>
        <nav aria-label="Customer navigation" className="biloo-customer-nav-list">
          <CustomerNavButton
            active={customerSection === "home"}
            icon="home"
            label="Home"
            onClick={() => goToCustomerSection("home")}
          />
          <CustomerNavButton
            active={customerSection === "explore"}
            icon="search"
            label="Explore"
            onClick={() => goToCustomerSection("explore")}
          />
          <CustomerNavButton icon="cart" label="Cart" onClick={openCart} />
          <Link
            className="biloo-customer-nav-item"
            href={liveData ? "/account" : "/auth/login"}
          >
            <span className="biloo-customer-nav-icon">
              <Icon className="size-[22px]" name="customer" />
            </span>
            <span>Account</span>
          </Link>
        </nav>
        <div className="biloo-customer-nav-status">
          <i data-live={liveData} />
          <span>{liveData ? "Production connected" : "Demo experience"}</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="biloo-workspace-rail" data-biloo-role-rail>
      <div className="biloo-workspace-rail-head">
        <span>Operations</span>
        <strong>Workspaces</strong>
      </div>

      <div className="biloo-workspace-list">
        {visibleRoles.map((item) => {
          const active = role === item.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className="biloo-workspace-item"
              data-active={active}
              key={item.key}
              onClick={() => selectRole(item.key)}
              type="button"
            >
              <span className="biloo-workspace-icon">
                <Icon className="size-[20px]" name={item.icon} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="biloo-workspace-status">
        <i data-live={liveData} />
        <span>{liveData ? "Production connected" : "Demo experience"}</span>
      </div>
    </aside>
  );
}
