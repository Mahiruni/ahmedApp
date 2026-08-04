"use client";

import { useEffect, useMemo, useState } from "react";

import type { IconName, VendorOrder } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

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
const vendorStages: VendorOrder["status"][] = [
  "New",
  "Accepted",
  "Preparing",
  "Ready",
  "Dispatched",
];

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
      // Seeded data keeps the vendor workspace usable when storage is blocked.
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
  const newOrders = orders.filter((order) => order.status === "New").length;
  const preparingOrders = orders.filter(
    (order) => order.status === "Accepted" || order.status === "Preparing",
  ).length;
  const readyOrders = orders.filter((order) => order.status === "Ready").length;
  const salesToday = orders.reduce((sum, order) => sum + order.total, 0) + 42000;

  const metrics: Array<{
    value: string;
    label: string;
    detail: string;
    icon: IconName;
    tone: "default" | "brand" | "success" | "danger";
  }> = [
    {
      value: formatETB(salesToday),
      label: "Sales today",
      detail: "Across completed and active orders",
      icon: "wallet",
      tone: "brand",
    },
    {
      value: String(orders.length + 34),
      label: "Orders today",
      detail: `${newOrders} waiting for action`,
      icon: "receipt",
      tone: newOrders ? "danger" : "default",
    },
    {
      value: String(preparingOrders),
      label: "In preparation",
      detail: `${readyOrders} ready for dispatch`,
      icon: "clock",
      tone: readyOrders ? "success" : "default",
    },
    {
      value: String(lowStockItems.length),
      label: "Stock alerts",
      detail: lowStockItems.length ? "Restock recommended" : "Inventory healthy",
      icon: "inventory",
      tone: lowStockItems.length ? "danger" : "success",
    },
  ];

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
    <div className="biloo-vendor-workspace">
      <section className="biloo-vendor-hero">
        <div className="biloo-vendor-hero-main">
          <div className="biloo-vendor-store-mark" aria-hidden="true">
            <Icon name="vendor" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="biloo-vendor-kicker">
              <span className={storeOpen ? "is-live" : ""} />
              Fresh Corner · Bole branch
            </div>
            <h1>Store command center</h1>
            <p>Orders, preparation, inventory and store availability in one focused workspace.</p>
          </div>
          <button
            aria-pressed={storeOpen}
            className="biloo-vendor-availability"
            data-open={storeOpen}
            onClick={() => setStoreOpen(!storeOpen)}
            type="button"
          >
            <span className="biloo-vendor-availability-copy">
              <small>Store status</small>
              <strong>{storeOpen ? "Open for orders" : "Orders paused"}</strong>
            </span>
            <span className="biloo-vendor-switch" aria-hidden="true">
              <i />
            </span>
          </button>
        </div>

        <div className="biloo-vendor-metrics">
          {metrics.map((metric) => (
            <article data-tone={metric.tone} key={metric.label}>
              <span className="biloo-vendor-metric-icon">
                <Icon name={metric.icon} />
              </span>
              <span className="min-w-0">
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
                <em>{metric.detail}</em>
              </span>
            </article>
          ))}
        </div>
      </section>

      {inventoryNotice ? (
        <div className="biloo-vendor-notice" role="status">
          <Icon name="check" />
          <span>{inventoryNotice}</span>
        </div>
      ) : null}

      {(newOrders > 0 || lowStockItems.length > 0) && (
        <section className="biloo-vendor-attention" aria-label="Needs attention">
          <span className="biloo-vendor-attention-icon">
            <Icon name="inventory" />
          </span>
          <span className="min-w-0 flex-1">
            <small>Needs attention</small>
            <strong>
              {newOrders > 0 ? `${newOrders} new ${newOrders === 1 ? "order" : "orders"}` : "Orders are clear"}
              {newOrders > 0 && lowStockItems.length > 0 ? " · " : ""}
              {lowStockItems.length > 0
                ? `${lowStockItems.length} low-stock ${lowStockItems.length === 1 ? "item" : "items"}`
                : ""}
            </strong>
          </span>
          <span className="biloo-vendor-attention-status">Review now</span>
        </section>
      )}

      <div className="biloo-vendor-grid">
        <section className="biloo-vendor-panel biloo-vendor-orders-panel">
          <header className="biloo-vendor-panel-header">
            <div>
              <span>Live workflow</span>
              <h2>Order queue</h2>
              <p>Prioritized by the next action required from your team.</p>
            </div>
            <span className="biloo-vendor-panel-count">
              {storeOpen ? `${orders.length} active` : "Paused"}
            </span>
          </header>

          <div className="biloo-vendor-orders">
            {orders.map((order) => {
              const stageIndex = vendorStages.indexOf(order.status);
              const progress = Math.max(12, ((stageIndex + 1) / vendorStages.length) * 100);
              const actionDisabled = !storeOpen || order.status === "Dispatched";

              return (
                <article className="biloo-vendor-order" data-status={order.status} key={order.id}>
                  <div className="biloo-vendor-order-top">
                    <div className="min-w-0">
                      <span className="biloo-vendor-order-id">{order.id}</span>
                      <h3>{order.customer}</h3>
                      <p>{order.items} items · {order.placed}</p>
                    </div>
                    <div className="biloo-vendor-order-value">
                      <strong>{formatETB(order.total)}</strong>
                      <span>{order.status}</span>
                    </div>
                  </div>

                  <div className="biloo-vendor-order-progress" aria-label={`${order.status} stage`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <div className="biloo-vendor-order-stages" aria-hidden="true">
                    {vendorStages.map((stage, index) => (
                      <span data-done={index <= stageIndex} key={stage}>
                        {stage === "Dispatched" ? "Sent" : stage}
                      </span>
                    ))}
                  </div>

                  <div className="biloo-vendor-order-footer">
                    <span>
                      <Icon name={order.status === "Ready" ? "driver" : "clock"} />
                      {vendorActionHint(order.status)}
                    </span>
                    <button
                      disabled={actionDisabled}
                      onClick={() => onAdvanceOrder(order)}
                      type="button"
                    >
                      {nextVendorAction(order.status)}
                      <Icon name={order.status === "Dispatched" ? "check" : "arrow"} />
                    </button>
                  </div>
                </article>
              );
            })}

            {orders.length === 0 ? (
              <div className="biloo-vendor-empty">
                <span><Icon name="receipt" /></span>
                <h3>No active orders</h3>
                <p>New customer orders will appear here automatically.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="biloo-vendor-panel biloo-vendor-inventory-panel">
          <header className="biloo-vendor-panel-header">
            <div>
              <span>Inventory health</span>
              <h2>Stock control</h2>
              <p>Update quantities and restore target stock in a few taps.</p>
            </div>
            <span className="biloo-vendor-panel-count" data-danger={lowStockItems.length > 0}>
              {lowStockItems.length} low
            </span>
          </header>

          <div className="biloo-vendor-inventory">
            {inventory.map((item) => {
              const low = item.stock <= item.reorderAt;
              const stockPercent = Math.min(100, Math.round((item.stock / item.target) * 100));

              return (
                <article className="biloo-vendor-stock" data-low={low} key={item.id}>
                  <div className="biloo-vendor-stock-top">
                    <span className="biloo-vendor-stock-icon">
                      <Icon name="inventory" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <h3>{item.name}</h3>
                      <p>{item.sku}</p>
                    </span>
                    <span className="biloo-vendor-stock-quantity">
                      <strong>{item.stock}</strong>
                      <small>{item.unit}</small>
                    </span>
                  </div>

                  <div className="biloo-vendor-stock-meter">
                    <span style={{ width: `${stockPercent}%` }} />
                  </div>
                  <div className="biloo-vendor-stock-meta">
                    <span>{low ? "Below reorder point" : "Healthy stock"}</span>
                    <span>Target {item.target}</span>
                  </div>

                  <div className="biloo-vendor-stock-actions">
                    <div>
                      <button
                        aria-label={`Decrease ${item.name} stock`}
                        onClick={() => adjustStock(item, -1)}
                        type="button"
                      >
                        −
                      </button>
                      <span>{item.stock}</span>
                      <button
                        aria-label={`Increase ${item.name} stock`}
                        onClick={() => adjustStock(item, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => restock(item)} type="button">
                      Restock to {item.target}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function nextVendorAction(status: VendorOrder["status"]) {
  if (status === "New") return "Accept order";
  if (status === "Accepted") return "Start preparing";
  if (status === "Preparing") return "Mark ready";
  if (status === "Ready") return "Request courier";
  return "Completed";
}

function vendorActionHint(status: VendorOrder["status"]) {
  if (status === "New") return "Customer is waiting for confirmation";
  if (status === "Accepted") return "Begin preparing the order";
  if (status === "Preparing") return "Complete packing and quality check";
  if (status === "Ready") return "Order is ready for courier pickup";
  return "Courier workflow has started";
}
