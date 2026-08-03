import type { ActiveOrder } from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill, Surface } from "./ui";

export function OrdersPanel({
  orders,
  onTrackOrder,
}: {
  orders: ActiveOrder[];
  onTrackOrder: (order: ActiveOrder) => void;
}) {
  const activeOrders = orders.filter((order) => order.progress < 100);

  return (
    <Surface className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="biloo-pulse size-2 rounded-full bg-[#55e6b1]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Live orchestration</p>
          </div>
          <h2 className="mt-2.5 text-2xl font-black tracking-[-0.045em] text-[#101828]">Your journeys</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Every vendor and driver handoff in one timeline.</p>
        </div>
        <StatusPill tone="success">{activeOrders.length} live</StatusPill>
      </div>

      <div className="mt-6 space-y-3">
        {orders.slice(0, 6).map((order, index) => {
          const completed = order.progress >= 100;
          return (
            <article
              className={`group relative overflow-hidden rounded-[1.45rem] border p-4 transition hover:-translate-y-0.5 ${
                completed
                  ? "border-emerald-100 bg-emerald-50/55"
                  : "border-slate-200/70 bg-white shadow-[0_12px_35px_rgba(24,39,65,0.05)]"
              }`}
              key={order.id}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#55e6b1] to-[#123b66]" />
              <div className="flex items-start justify-between gap-3 pl-1">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{order.id}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">{serviceLabel(order.service)}</span>
                  </div>
                  <h3 className="mt-2.5 truncate text-sm font-black tracking-[-0.02em] text-[#101828]">{order.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{order.status}</p>
                </div>
                <span className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-black ${completed ? "bg-emerald-100 text-emerald-700" : "bg-[#0a1b31] text-white"}`}>
                  {order.eta}
                </span>
              </div>

              <div className="mt-4 pl-1">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                  <span>Progress</span>
                  <span>{order.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#55e6b1] via-[#39cda0] to-[#123b66] transition-all duration-500"
                    style={{ width: `${Math.min(100, order.progress)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 pl-1">
                <span className="text-xs font-black text-[#0a1b31]">{formatETB(order.total)}</span>
                <button
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#eef3f8] px-3 text-[10px] font-black text-[#0a1b31] transition hover:bg-[#0a1b31] hover:text-white"
                  onClick={() => onTrackOrder(order)}
                  type="button"
                >
                  <Icon className="size-4" name="map" />
                  {completed ? "View" : "Track live"}
                </button>
              </div>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-5xl font-black text-slate-950/[0.025]">{String(index + 1).padStart(2, "0")}</span>
            </article>
          );
        })}

        {!orders.length ? (
          <div className="rounded-[1.45rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm">
              <Icon name="map" />
            </span>
            <p className="mt-4 text-sm font-black text-slate-600">No journeys yet</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Your next order or ride will appear here automatically.</p>
          </div>
        ) : null}
      </div>
    </Surface>
  );
}
