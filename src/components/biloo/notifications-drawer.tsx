import type { BilooNotification } from "@/data/biloo";

import { Drawer } from "./overlay-primitives";
import { Icon } from "./ui";

export function NotificationsDrawer({
  open,
  notifications,
  onClose,
}: {
  open: boolean;
  notifications: BilooNotification[];
  onClose: () => void;
}) {
  return (
    <Drawer onClose={onClose} open={open} title="Notifications">
      <div className="space-y-3 p-5 sm:p-6">
        {notifications.map((notification) => (
          <article
            className="rounded-2xl border border-slate-200 p-4"
            key={notification.id}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f2f7fb] text-[#082640]">
                <Icon name="bell" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-black">{notification.title}</p>
                  <span className="shrink-0 text-[10px] font-bold text-slate-400">
                    {notification.time}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Drawer>
  );
}
