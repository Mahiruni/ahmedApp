import type { ActiveOrder } from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill, Surface } from "./ui";

export function OrdersPanel({
  orders,
  onTrackOrder,
}: {
  orders: ActiveOrder[];
  onTrackOrder: (order: ActiveOrder) => void;
}) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Live tracking
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
            Active orders
          </h2>
        </div>
        <StatusPill tone="success">{orders.length} active</StatusPill>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article className="rounded-[1.35rem] bg-[#f5f8fa] p-4" key={order.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {order.id} · {serviceLabel(order.service)}
                </p>
                <h3 className="mt-2 truncate text-base font-black">
                  {order.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {order.status}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#082640] shadow-sm">
                {order.eta}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#082640] transition-all"
                style={{ width: `${order.progress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs font-black text-slate-600">
                {formatETB(order.total)}
              </span>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-[#082640] shadow-sm transition hover:bg-slate-50"
                onClick={() => onTrackOrder(order)}
                type="button"
              >
                <Icon className="size-4" name="map" />
                Track
              </button>
            </div>
          </article>
        ))}
      </div>
    </Surface>
  );
}
