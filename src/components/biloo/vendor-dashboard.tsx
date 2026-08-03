"use client";

import { useEffect, useMemo, useState } from "react";

import type { IconName, VendorOrder } from "@/data/biloo";

import { formatETB, Icon, StatusPill, Surface } from "./ui";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderAt: number;
  target: number;
  unit: string;
}

const initialInventory: InventoryItem[] = [
  {
    id: "inv-oil-5l",
    name: "Sunflower oil 5L",
    sku: "FRC-OIL-5L",
    stock: 4,
    reorderAt: 8,
    target: 28,
    unit: "bottles",
  },
  {
    id: "inv-rice-10kg",
    name: "Basmati rice 10kg",
    sku: "FRC-RICE-10",
    stock: 7,
    reorderAt: 10,
    target: 32,
    unit: "bags",
  },
  {
    id: "inv-diapers-xl",
    name: "Baby diapers XL",
    sku: "FRC-BABY-XL",
    stock: 9,
    reorderAt: 12,
    target: 30,
    unit: "packs",
  },
  {
    id: "inv-milk-1l",
    name: "Fresh milk 1L",
    sku: "FRC-MILK-1L",
    stock: 11,
    reorderAt: 14,
    target: 40,
    unit: "cartons",
  },
];

const inventoryStorageKey = "biloo.vendor-inventory";
const storeStorageKey = "biloo.vendor-store-open";

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
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedInventory = window.localStorage.getItem(inventoryStorageKey);
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory) as InventoryItem[]);
      }

      const storedOpen = window.localStorage.getItem(storeStorageKey);
      if (storedOpen === "true" || storedOpen === "false") {
        setStoreOpen(storedOpen === "true");
      }
    } catch {
      // The demo continues with seeded data when local storage is unavailable.
    }
  }, [setStoreOpen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(inventoryStorageKey, JSON.stringify(inventory));
    } catch {
      // In-memory inventory remains functional.
    }
  }, [inventory]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storeStorageKey, String(storeOpen));
    } catch {
      // Store state remains available for this session.
    }
  }, [storeOpen]);

  useEffect(() => {
    if (!inventoryNotice) return;
    const timeout = window.setTimeout(() => setInventoryNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [inventoryNotice]);

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.stock <= item.reorderAt),
    [inventory],
  );

  const salesToday = orders.reduce((sum, order) => sum + order.total, 0) + 42000;

  function adjustStock(item: InventoryItem, change: number) {
    const nextStock = Math.max(0, item.stock + change);
    setInventory((current) =>
      current.map((candidate) =>
        candidate.id === item.id ? { ...candidate, stock: nextStock } : candidate,
      ),
    );
    setInventoryNotice(`${item.name} updated to ${nextStock} ${item.unit}.`);
  }

  function restock(item: InventoryItem) {
    setInventory((current) =>
      current.map((candidate) =>
        candidate.id === item.id ? { ...candidate, stock: candidate.target } : candidate,
      ),
    );
    setInventoryNotice(
      `Restock recorded: ${item.name} is now at ${item.target} ${item.unit}.`,
    );
  }

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
            [formatETB(salesToday), "Sales today", "wallet" as const],
            [String(orders.length + 34), "Orders today", "receipt" as const],
            [
              String(orders.filter((order) => order.status === "Preparing").length),
              "Preparing now",
              "clock" as const,
            ],
            [String(lowStockItems.length), "Low-stock items", "inventory" as const],
          ].map(([value, label, icon]) => (
            <div className="rounded-2xl bg-[#f5f8fa] p-5" key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{label}</p>
                </div>
                <Icon className="size-5 text-[#082640]" name={icon as IconName} />
              </div>
            </div>
          ))}
        </div>
      </Surface>

      {inventoryNotice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {inventoryNotice}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Surface className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#082640]">
                Order queue
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Live orders</h2>
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
                <span className="text-sm font-black">{formatETB(order.total)}</span>
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
                Inventory control
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Stock levels
              </h2>
            </div>
            <StatusPill tone={lowStockItems.length ? "danger" : "success"}>
              {lowStockItems.length} low
            </StatusPill>
          </div>

          <div className="mt-6 space-y-3">
            {inventory.map((item) => {
              const low = item.stock <= item.reorderAt;
              const stockPercent = Math.min(100, Math.round((item.stock / item.target) * 100));
              return (
                <article
                  className={`rounded-2xl border p-4 ${
                    low ? "border-rose-100 bg-rose-50/55" : "border-slate-100 bg-[#f5f8fa]"
                  }`}
                  key={item.id}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#082640] shadow-sm">
                      <Icon name="inventory" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">{item.name}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        {item.sku}
                      </span>
                    </span>
                    <StatusPill tone={low ? "danger" : "success"}>
                      {item.stock} {item.unit}
                    </StatusPill>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${low ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Reorder at {item.reorderAt}</span>
                    <span>Target {item.target}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-[44px_44px_1fr] gap-2">
                    <button
                      aria-label={`Decrease ${item.name} stock`}
                      className="min-h-10 rounded-xl bg-white text-sm font-black text-[#082640] shadow-sm"
                      onClick={() => adjustStock(item, -1)}
                      type="button"
                    >
                      −
                    </button>
                    <button
                      aria-label={`Increase ${item.name} stock`}
                      className="min-h-10 rounded-xl bg-white text-sm font-black text-[#082640] shadow-sm"
                      onClick={() => adjustStock(item, 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="min-h-10 rounded-xl bg-[#082640] px-3 text-xs font-black text-white"
                      onClick={() => restock(item)}
                      type="button"
                    >
                      Restock to target
                    </button>
                  </div>
                </article>
              );
            })}
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
