"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { BilooNotification, IconName } from "@/data/biloo";

import { Icon } from "./ui";

type NotificationFilter = "all" | "unread";

type NotificationStyle = {
  icon: IconName;
  iconClassName: string;
  label: string;
};

function getNotificationStyle(notification: BilooNotification): NotificationStyle {
  const content = `${notification.title} ${notification.message}`.toLowerCase();

  if (content.includes("wallet") || content.includes("payment") || content.includes("credited")) {
    return {
      icon: "wallet",
      iconClassName: "bg-[#eef6ff] text-[#0a68d8]",
      label: "Payment",
    };
  }

  if (content.includes("driver") || content.includes("ride") || content.includes("taxi")) {
    return {
      icon: "taxi",
      iconClassName: "bg-[#edf9f2] text-[#078449]",
      label: "Ride",
    };
  }

  if (
    content.includes("order") ||
    content.includes("vendor") ||
    content.includes("delivered") ||
    content.includes("delivery")
  ) {
    return {
      icon: "receipt",
      iconClassName: "bg-[#fff5e9] text-[#b85d00]",
      label: "Order",
    };
  }

  if (content.includes("alert") || content.includes("failed") || content.includes("issue")) {
    return {
      icon: "alert",
      iconClassName: "bg-[#fff0f0] text-[#d92d20]",
      label: "Important",
    };
  }

  if (content.includes("welcome") || content.includes("ready") || content.includes("completed")) {
    return {
      icon: "check",
      iconClassName: "bg-[#edf9f2] text-[#078449]",
      label: "Update",
    };
  }

  return {
    icon: "bell",
    iconClassName: "bg-[#f2f3f5] text-[#34363a]",
    label: "BILOO",
  };
}

export function NotificationsDrawer({
  open,
  notifications,
  onClose,
}: {
  open: boolean;
  notifications: BilooNotification[];
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    () => new Set(notifications.filter((item) => !item.read).map((item) => item.id)),
  );
  const unreadBeforeOpenRef = useRef<Set<string>>(new Set(unreadIds));
  const previouslyOpenRef = useRef(open);

  useEffect(() => {
    if (!open) {
      unreadBeforeOpenRef.current = new Set(
        notifications.filter((item) => !item.read).map((item) => item.id),
      );
    }
  }, [notifications, open]);

  useEffect(() => {
    const justOpened = open && !previouslyOpenRef.current;
    previouslyOpenRef.current = open;

    if (!justOpened) return;

    const currentUnread = notifications
      .filter((item) => !item.read)
      .map((item) => item.id);
    setUnreadIds(new Set([...unreadBeforeOpenRef.current, ...currentUnread]));
    setFilter("all");
  }, [notifications, open]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  const unreadCount = unreadIds.size;
  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((item) => unreadIds.has(item.id))
        : notifications,
    [filter, notifications, unreadIds],
  );
  const newNotifications = visibleNotifications.filter((item) => unreadIds.has(item.id));
  const earlierNotifications = visibleNotifications.filter((item) => !unreadIds.has(item.id));

  function markRead(notificationId: string) {
    setUnreadIds((current) => {
      if (!current.has(notificationId)) return current;
      const next = new Set(current);
      next.delete(notificationId);
      return next;
    });
  }

  function markAllRead() {
    setUnreadIds(new Set());
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[90] transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      data-biloo-notification-center
    >
      <button
        aria-label="Close notifications"
        className={`absolute inset-0 bg-black/42 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        type="button"
      />

      <section
        aria-labelledby="biloo-notification-title"
        aria-modal="true"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col overflow-hidden rounded-t-[26px] border border-black/5 bg-white shadow-[0_-20px_64px_rgba(0,0,0,0.18)] transition duration-300 ease-out sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:w-[420px] sm:rounded-[24px] sm:shadow-[-18px_20px_70px_rgba(0,0,0,0.18)] ${
          open
            ? "translate-y-0 opacity-100 sm:translate-x-0"
            : "translate-y-full opacity-0 sm:translate-x-[108%] sm:translate-y-0"
        }`}
        role="dialog"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[#d7d9dc] sm:hidden" />

        <header className="border-b border-[#eceef0] px-4 pb-4 pt-3 sm:px-5 sm:pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-black text-white">
                <Icon className="size-[19px]" name="bell" />
                {unreadCount ? (
                  <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[#d92d20] px-1 text-[9px] font-bold leading-none text-white ring-[3px] ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <div className="min-w-0">
                <h2
                  className="text-[19px] font-semibold tracking-[-0.03em] text-[#111214]"
                  id="biloo-notification-title"
                >
                  Notifications
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-[#73767b]">
                  {unreadCount
                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                    : "You’re all caught up"}
                </p>
              </div>
            </div>

            <button
              aria-label="Close notifications"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f1f2f4] text-[#242629] transition hover:bg-[#e5e7e9] active:scale-[0.97]"
              onClick={onClose}
              type="button"
            >
              <Icon className="size-4" name="close" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div
              aria-label="Notification filters"
              className="inline-flex rounded-full bg-[#f1f2f4] p-0.5"
              role="tablist"
            >
              {(["all", "unread"] as const).map((item) => {
                const active = filter === item;
                return (
                  <button
                    aria-selected={active}
                    className={`min-h-8 rounded-full px-3.5 text-[11px] font-semibold capitalize transition ${
                      active
                        ? "bg-white text-black shadow-[0_1px_4px_rgba(0,0,0,0.09)]"
                        : "text-[#686b70] hover:text-black"
                    }`}
                    key={item}
                    onClick={() => setFilter(item)}
                    role="tab"
                    type="button"
                  >
                    {item}
                    {item === "unread" && unreadCount ? ` ${unreadCount}` : ""}
                  </button>
                );
              })}
            </div>

            <button
              className="min-h-8 rounded-full px-2 text-[11px] font-semibold text-[#0a68d8] transition hover:bg-[#eef6ff] disabled:cursor-default disabled:text-[#a9acb0] disabled:hover:bg-transparent"
              disabled={!unreadCount}
              onClick={markAllRead}
              type="button"
            >
              Mark all read
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(14px,env(safe-area-inset-bottom))]">
          {visibleNotifications.length ? (
            <div className="py-2">
              <NotificationGroup
                notifications={newNotifications}
                onRead={markRead}
                title="New"
                unreadIds={unreadIds}
              />
              <NotificationGroup
                notifications={earlierNotifications}
                onRead={markRead}
                title={newNotifications.length ? "Earlier" : "Recent"}
                unreadIds={unreadIds}
              />
            </div>
          ) : (
            <div className="grid min-h-[360px] place-items-center px-8 py-12 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f1f2f4] text-[#5f6267]">
                  <Icon className="size-6" name={filter === "unread" ? "check" : "bell"} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-[#17181a]">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </h3>
                <p className="mx-auto mt-1.5 max-w-[250px] text-[11px] leading-[1.65] text-[#777a7f]">
                  {filter === "unread"
                    ? "New ride, order, payment, and account updates will appear here."
                    : "BILOO will keep important activity organized in this notification center."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NotificationGroup({
  title,
  notifications,
  unreadIds,
  onRead,
}: {
  title: string;
  notifications: BilooNotification[];
  unreadIds: Set<string>;
  onRead: (notificationId: string) => void;
}) {
  if (!notifications.length) return null;

  return (
    <section aria-label={`${title} notifications`}>
      <div className="flex items-center justify-between px-4 pb-1.5 pt-2 sm:px-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85888d]">
          {title}
        </h3>
        <span className="text-[10px] text-[#a0a3a7]">{notifications.length}</span>
      </div>

      <div>
        {notifications.map((notification) => {
          const unread = unreadIds.has(notification.id);
          const style = getNotificationStyle(notification);

          return (
            <button
              aria-label={`${unread ? "Unread: " : ""}${notification.title}`}
              className={`group relative flex w-full items-start gap-3 border-b border-[#f0f1f2] px-4 py-3.5 text-left transition last:border-b-0 sm:px-5 ${
                unread ? "bg-[#f7fbff] hover:bg-[#f1f8ff]" : "bg-white hover:bg-[#f8f9fa]"
              }`}
              key={notification.id}
              onClick={() => onRead(notification.id)}
              type="button"
            >
              {unread ? (
                <span className="absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#0a68d8]" />
              ) : null}

              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full ${style.iconClassName}`}
              >
                <Icon className="size-[18px]" name={style.icon} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span
                    className={`line-clamp-1 text-[13px] tracking-[-0.01em] text-[#191a1c] ${
                      unread ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {notification.title}
                  </span>
                  <span className="shrink-0 pt-0.5 text-[10px] text-[#8b8e93]">
                    {notification.time}
                  </span>
                </span>
                <span className="mt-1 line-clamp-2 text-[11px] leading-[1.55] text-[#66696e]">
                  {notification.message}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#92959a]">
                  {style.label}
                  {unread ? <span className="size-1 rounded-full bg-[#0a68d8]" /> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
