"use client";

import type { IconName, VendorOrder } from "@/data/biloo";

import { formatETB, Icon, StatusPill, Surface } from "./ui";

export function VendorDashboard({
  storeOpen,
  setStoreOpen,
  orders,
  onAdvanceOrder,
}: {
  storeOpen: boolean;
  setStoreOpen: (value: boolean) => void;
  orders: VendorOrder[];
  onAdvanceOrder: (order: VendorOrder) => void;
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Fresh Corner · Bole branch
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Store operations
            </h1>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Manage orders, preparation, inventory and payouts in real time.
            </p>
          </div>
          <button
            className={`min-h-12 rounded-2xl px-5 text-sm font-black ${
              storeOpen
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
            onClick={() => setStoreOpen(!storeOpen)}
            type="button"
          >
            ● Store {storeOpen ? "open" : "closed"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["ETB 48,620", "Sales today", "wallet" as const],
            [String(orders.length + 34), "Orders today", "receipt" as const],
            [
              String(
                orders.filter((order) => order.status === "Preparing").length,
              ),
              "Preparing now",
              "clock" as const,
            ],
            ["94.2%", "Acceptance rate", "trend" as const],
          ].map(([value, label, icon]) => (
            <div className="rounded-2xl bg-[#f5f8fa] p-5" key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {label}
                  </p>
                </div>
                <Icon className="size-5 text-[#082640]" name={icon as IconName} />
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#082640]">
                Order queue
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Live orders
              </h2>
            </div>
            <StatusPill tone={storeOpen ? "success" : "neutral"}>
              {storeOpen ? "Accepting" : "Paused"}
            </StatusPill>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-slate-200">
            <div className="hidden grid-cols-[0.6fr_1fr_0.7fr_0.75fr_0.8fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 md:grid">
              <span>Order</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {orders.map((order) => (
              <div
                className="grid gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 md:grid-cols-[0.6fr_1fr_0.7fr_0.75fr_0.8fr] md:items-center"
                key={order.id}
              >
                <span>
                  <span className="block text-sm font-black">{order.id}</span>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {order.placed}
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-700">
                    {order.customer}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {order.items} items
                  </span>
                </span>
                <span className="text-sm font-black">
                  {formatETB(order.total)}
                </span>
                <StatusPill
                  tone={
                    order.status === "New"
                      ? "warning"
                      : order.status === "Ready"
                        ? "success"
                        : "brand"
                  }
                >
                  {order.status}
                </StatusPill>
                <button
                  className="min-h-10 rounded-xl bg-[#082640] px-3 text-xs font-black text-white disabled:opacity-40"
                  disabled={!storeOpen || order.status === "Dispatched"}
                  onClick={() => onAdvanceOrder(order)}
                  type="button"
                >
                  {nextVendorAction(order.status)}
                </button>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
                Inventory attention
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Low-stock products
              </h2>
            </div>
            <Icon className="size-6 text-rose-500" name="inventory" />
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["Sunflower oil 5L", "4 left", "Restock"],
              ["Basmati rice 10kg", "7 left", "Restock"],
              ["Baby diapers XL", "9 left", "Review"],
              ["Fresh milk 1L", "11 left", "Review"],
            ].map(([name, stock, action]) => (
              <div
                className="flex items-center gap-4 rounded-2xl bg-[#f5f8fa] p-4"
                key={name}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-white text-[#082640] shadow-sm">
                  <Icon name="inventory" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">
                    {name}
                  </span>
                  <span className="mt-1 block text-xs font-bold text-rose-600">
                    {stock}
                  </span>
                </span>
                <button
                  className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#082640] shadow-sm"
                  type="button"
                >
                  {action}
                </button>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function nextVendorAction(status: VendorOrder["status"]) {
  if (status === "New") return "Accept";
  if (status === "Accepted") return "Prepare";
  if (status === "Preparing") return "Mark ready";
  if (status === "Ready") return "Dispatch";
  return "Done";
}
