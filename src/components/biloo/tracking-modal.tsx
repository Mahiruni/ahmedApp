"use client";

import { useEffect, useMemo, useState } from "react";

import type { ActiveOrder, PaymentMethod } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

const confirmationStorageKey = "biloo:pending-order-confirmation";

type ConfirmationContext = {
  payment: PaymentMethod;
  itemCount: number;
  merchant: string;
  service: string;
  createdAt: number;
};

type ExperienceMode = "confirmation" | "tracking";

export function TrackingModal({
  order,
  onClose,
  onAdvance,
}: {
  order: ActiveOrder | null;
  onClose: () => void;
  onAdvance: (order: ActiveOrder) => void;
}) {
  const [mode, setMode] = useState<ExperienceMode>("tracking");
  const [confirmation, setConfirmation] =
    useState<ConfirmationContext | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderId = order?.id;
  const orderService = order?.service;
  const orderTitle = order?.title;

  useEffect(() => {
    if (!orderId || !orderService || !orderTitle) return;

    setReceiptOpen(false);
    setCopied(false);
    setConfirmation(null);
    setMode("tracking");

    try {
      const stored = window.sessionStorage.getItem(confirmationStorageKey);
      if (!stored) return;

      window.sessionStorage.removeItem(confirmationStorageKey);
      const parsed = JSON.parse(stored) as Partial<ConfirmationContext>;
      const createdAt =
        typeof parsed.createdAt === "number" ? parsed.createdAt : null;
      const recent =
        createdAt !== null && Date.now() - createdAt < 2 * 60 * 1000;
      const merchantMatches =
        typeof parsed.merchant === "string" &&
        orderTitle.toLowerCase().includes(parsed.merchant.toLowerCase());
      const validPayment =
        parsed.payment === "wallet" ||
        parsed.payment === "card" ||
        parsed.payment === "cash";

      if (
        recent &&
        merchantMatches &&
        validPayment &&
        createdAt !== null &&
        orderService !== "taxi"
      ) {
        setConfirmation({
          payment: parsed.payment,
          itemCount:
            typeof parsed.itemCount === "number" ? parsed.itemCount : 1,
          merchant: parsed.merchant ?? "BILOO partner",
          service: parsed.service ?? serviceLabel(orderService),
          createdAt,
        });
        setMode("confirmation");
      }
    } catch {
      // Tracking remains available when session storage is blocked.
    }
  }, [orderId, orderService, orderTitle]);

  useEffect(() => {
    if (!order) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, order]);

  const progressLabel = useMemo(() => {
    if (!order) return "Order confirmed";
    if (order.progress >= 100) return "Delivered";
    if (order.progress >= 90) return "Arriving now";
    if (order.progress >= 60) return "Courier en route";
    if (order.progress >= 35) return "Provider preparing";
    return "Order confirmed";
  }, [order]);

  if (!order) return null;
  const currentOrder = order;

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(currentOrder.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  if (mode === "confirmation" && confirmation) {
    const prepaid = confirmation.payment !== "cash";
    const paymentLabel =
      confirmation.payment === "wallet"
        ? "BILOO Wallet"
        : confirmation.payment === "card"
          ? "Bank card"
          : "Cash on delivery";

    return (
      <div className="biloo-order-overlay" role="presentation">
        <div className="biloo-order-backdrop" />
        <section
          aria-label="Order confirmation"
          aria-modal="true"
          className="biloo-order-confirmation"
          role="dialog"
        >
          <div className="biloo-order-handle" aria-hidden="true" />

          <header className="biloo-order-confirmation-header">
            <span className="biloo-order-brand">BILOO</span>
            <button
              aria-label="Close confirmation"
              className="biloo-order-close"
              onClick={onClose}
              type="button"
            >
              <Icon className="size-[18px]" name="close" />
            </button>
          </header>

          <div className="biloo-order-confirmation-body">
            <div className="biloo-order-success-mark" aria-hidden="true">
              <span>
                <Icon className="size-8" name="check" />
              </span>
              <i />
              <i />
              <i />
            </div>

            <div className="biloo-order-success-copy" aria-live="polite">
              <span>{prepaid ? "Payment successful" : "Order confirmed"}</span>
              <h2>{prepaid ? "You’re all set." : "Your order is placed."}</h2>
              <p>
                {prepaid
                  ? `${confirmation.merchant} has received your order and payment.`
                  : `${confirmation.merchant} has received your order. Pay the courier when it arrives.`}
              </p>
            </div>

            <div className="biloo-order-id-card">
              <span>
                <small>Order number</small>
                <strong>{currentOrder.id}</strong>
              </span>
              <button onClick={copyOrderId} type="button">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="biloo-order-highlights">
              <article>
                <span className="biloo-order-highlight-icon">
                  <Icon className="size-[18px]" name="clock" />
                </span>
                <span>
                  <small>Estimated arrival</small>
                  <strong>{currentOrder.eta}</strong>
                </span>
              </article>
              <article>
                <span className="biloo-order-highlight-icon">
                  <Icon className="size-[18px]" name="wallet" />
                </span>
                <span>
                  <small>{prepaid ? "Amount paid" : "Amount due"}</small>
                  <strong>{formatETB(currentOrder.total)}</strong>
                </span>
              </article>
            </div>

            <div className="biloo-order-destination">
              <span className="biloo-order-destination-icon">
                <Icon className="size-[18px]" name="home" />
              </span>
              <span className="min-w-0 flex-1">
                <small>Delivering to</small>
                <strong>Home · Bole, Addis Ababa</strong>
                <em>Call on arrival</em>
              </span>
              <span className="biloo-order-live-pill">Confirmed</span>
            </div>

            <div className="biloo-order-first-step">
              <div className="biloo-order-first-step-line">
                <span data-done="true">
                  <Icon className="size-3" name="check" />
                </span>
                <i />
                <span />
                <i />
                <span />
              </div>
              <div className="biloo-order-first-step-labels">
                <strong>Confirmed</strong>
                <span>Preparing</span>
                <span>On the way</span>
              </div>
            </div>

            <button
              aria-expanded={receiptOpen}
              className="biloo-order-receipt-toggle"
              onClick={() => setReceiptOpen((current) => !current)}
              type="button"
            >
              <span>
                <Icon className="size-[18px]" name="receipt" />
                Receipt and order details
              </span>
              <Icon
                className={`size-4 transition-transform ${receiptOpen ? "rotate-90" : ""}`}
                name="arrow"
              />
            </button>

            {receiptOpen ? (
              <div className="biloo-order-receipt">
                <ReceiptLine label="Merchant" value={confirmation.merchant} />
                <ReceiptLine label="Service" value={confirmation.service} />
                <ReceiptLine
                  label="Items"
                  value={`${confirmation.itemCount}`}
                />
                <ReceiptLine label="Payment" value={paymentLabel} />
                <ReceiptLine
                  bold
                  label={prepaid ? "Paid" : "Total due"}
                  value={formatETB(currentOrder.total)}
                />
              </div>
            ) : null}
          </div>

          <footer className="biloo-order-confirmation-footer">
            <button
              className="biloo-order-track-button"
              onClick={() => setMode("tracking")}
              type="button"
            >
              <Icon className="size-[18px]" name="navigation" />
              <span>Track order</span>
              <Icon className="size-[18px]" name="arrow" />
            </button>
            <button
              className="biloo-order-done-button"
              onClick={onClose}
              type="button"
            >
              Done
            </button>
            <p>Updates will appear in BILOO notifications automatically.</p>
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className="biloo-order-overlay" role="presentation">
      <button
        aria-label="Close tracking"
        className="biloo-order-backdrop"
        onClick={onClose}
        type="button"
      />

      <section
        aria-label={`Track ${currentOrder.id}`}
        aria-modal="true"
        className="biloo-tracking-sheet"
        role="dialog"
      >
        <header className="biloo-tracking-header">
          <button
            aria-label="Close tracking"
            className="biloo-order-close"
            onClick={onClose}
            type="button"
          >
            <Icon className="size-[18px]" name="close" />
          </button>
          <span className="min-w-0 flex-1">
            <small>Live order</small>
            <strong>{currentOrder.id}</strong>
          </span>
          <span className="biloo-tracking-live">
            <i /> Live
          </span>
        </header>

        <div className="biloo-tracking-layout">
          <div className="biloo-tracking-details">
            <span className="biloo-tracking-service">
              {serviceLabel(currentOrder.service)}
            </span>
            <h2>{currentOrder.title}</h2>
            <p>{currentOrder.status}</p>

            <div className="biloo-tracking-progress-card">
              <div>
                <span>{progressLabel}</span>
                <strong>{currentOrder.progress}%</strong>
              </div>
              <div className="biloo-tracking-progress-track">
                <span
                  style={{ width: `${Math.min(currentOrder.progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="biloo-tracking-steps">
              <TrackingStep done label="Order confirmed" />
              <TrackingStep
                done={currentOrder.progress >= 35}
                label="Provider preparing"
              />
              <TrackingStep
                done={currentOrder.progress >= 60}
                label="Courier en route"
              />
              <TrackingStep
                done={currentOrder.progress >= 90}
                label="Arriving"
              />
            </div>

            <div className="biloo-tracking-metrics">
              <article>
                <small>ETA</small>
                <strong>{currentOrder.eta}</strong>
              </article>
              <article>
                <small>Total</small>
                <strong>{formatETB(currentOrder.total)}</strong>
              </article>
            </div>

            <button
              className="biloo-tracking-refresh"
              onClick={() => onAdvance(currentOrder)}
              type="button"
            >
              Check latest status
            </button>
          </div>

          <div className="biloo-tracking-map">
            <div className="biloo-tracking-grid" />
            <div className="biloo-tracking-route" />
            <span className="biloo-tracking-pin biloo-tracking-pin-start">
              <Icon className="size-5" name="location" />
            </span>
            <span className="biloo-tracking-pin biloo-tracking-pin-end">
              <Icon className="size-5" name="home" />
            </span>
            <span
              className="biloo-tracking-vehicle"
              style={{
                left: `${18 + Math.min(currentOrder.progress, 100) * 0.55}%`,
                top: `${24 + Math.min(currentOrder.progress, 100) * 0.28}%`,
              }}
            >
              <Icon
                className="size-5"
                name={currentOrder.service === "taxi" ? "taxi" : "driver"}
              />
            </span>
            <div className="biloo-tracking-map-status">
              <span>
                <Icon className="size-[18px]" name="navigation" />
              </span>
              <div>
                <strong>Route tracking</strong>
                <p>Authenticated driver GPS will update this route live.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReceiptLine({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="biloo-order-receipt-line" data-bold={bold}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrackingStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="biloo-tracking-step" data-done={done}>
      <span>
        {done ? <Icon className="size-3.5" name="check" /> : <i />}
      </span>
      <strong>{label}</strong>
    </div>
  );
}
