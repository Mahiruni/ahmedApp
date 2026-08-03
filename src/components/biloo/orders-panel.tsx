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
    <Surface className="overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#777777]">Activity</p>
          <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-black">
            Your trips and orders
          </h2>
        </div>
        <StatusPill tone={activeOrders.length ? "success" : "neutral"}>
          {activeOrders.length} active
        </StatusPill>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e4e4e4]">
        {orders.slice(0, 6).map((order, index) => {
          const completed = order.progress >= 100;
          return (
            <article
              className={`bg-white px-3.5 py-3.5 ${
                index ? "border-t border-[#eeeeee]" : ""
              }`}
              key={order.id}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${
                    completed ? "bg-[#e8f7ef] text-[#087443]" : "bg-[#f3f3f3] text-black"
                  }`}
                >
                  <Icon className="size-4" name={order.service === "taxi" ? "taxi" : "receipt"} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-black">
                        {order.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-[#777777]">
                        {serviceLabel(order.service)} · {order.id}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-black">
                      {order.eta}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-1 text-[11px] text-[#545454]">
                    {order.status}
                  </p>

                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#eeeeee]">
                    <div
                      className={`h-full rounded-full ${completed ? "bg-[#06c167]" : "bg-black"}`}
                      style={{ width: `${Math.min(100, order.progress)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold text-black">
                      {formatETB(order.total)}
                    </span>
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#f3f3f3] px-3 text-[10px] font-medium text-black transition hover:bg-[#e8e8e8]"
                      onClick={() => onTrackOrder(order)}
                      type="button"
                    >
                      <Icon className="size-3.5" name="map" />
                      {completed ? "View" : "Track"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {!orders.length ? (
          <div className="bg-[#f8f8f8] px-5 py-10 text-center">
            <Icon className="mx-auto size-5 text-[#777777]" name="map" />
            <p className="mt-3 text-[13px] font-semibold text-black">No activity yet</p>
            <p className="mt-1 text-[11px] text-[#777777]">
              Your next ride or order will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </Surface>
  );
}
