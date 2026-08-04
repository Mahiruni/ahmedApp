"use client";

import { useMemo, useState } from "react";

import type { CartLine, PaymentMethod } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

const confirmationStorageKey = "biloo:pending-order-confirmation";

export function CheckoutModal({
  open,
  cart,
  onClose,
  onConfirm,
}: {
  open: boolean;
  cart: CartLine[];
  onClose: () => void;
  onConfirm: (payment: PaymentMethod) => void;
}) {
  const [payment, setPayment] = useState<PaymentMethod>("wallet");
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const subtotal = cart.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const delivery = cart.length ? 75 : 0;
  const serviceFee = cart.length ? Math.round(subtotal * 0.025) : 0;
  const total = subtotal + delivery + serviceFee;
  const walletBalance = 3840;
  const merchant = cart[0]?.item.merchant ?? "BILOO partner";
  const orderService = cart[0]?.item.service;

  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardValid =
    cardholder.trim().length >= 3 &&
    cardDigits.length >= 15 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvv.replace(/\D/g, "").length >= 3;
  const walletValid = walletBalance >= total;
  const canConfirm =
    cart.length > 0 &&
    (payment === "cash" ||
      (payment === "wallet" && walletValid) ||
      (payment === "card" && cardValid));

  const formattedCardNumber = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }, [cardNumber]);

  if (!open) return null;

  function selectPayment(method: PaymentMethod) {
    setPayment(method);
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  function submitPayment() {
    if (!canConfirm) return;

    try {
      window.sessionStorage.setItem(
        confirmationStorageKey,
        JSON.stringify({
          payment,
          itemCount,
          merchant,
          service: orderService ? serviceLabel(orderService) : "BILOO order",
          createdAt: Date.now(),
        }),
      );
    } catch {
      // Checkout remains functional when storage is unavailable.
    }

    onConfirm(payment);
  }

  const methodLabel =
    payment === "wallet"
      ? "Pay with BILOO Wallet"
      : payment === "card"
        ? "Pay securely"
        : "Place order";

  return (
    <div className="biloo-payment-overlay" role="presentation">
      <button
        aria-label="Return to cart"
        className="biloo-payment-backdrop"
        onClick={onClose}
        type="button"
      />

      <section
        aria-label="Secure payment"
        aria-modal="true"
        className="biloo-payment-sheet"
        role="dialog"
      >
        <div className="biloo-payment-handle" aria-hidden="true" />

        <header className="biloo-payment-header">
          <button
            aria-label="Back to cart"
            className="biloo-payment-back"
            onClick={onClose}
            type="button"
          >
            <Icon className="size-[18px] rotate-180" name="arrow" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="biloo-payment-eyebrow">Secure checkout</span>
            <h2>Payment</h2>
          </div>
          <span className="biloo-payment-secure">
            <Icon className="size-4" name="shield" />
            Secure
          </span>
        </header>

        <div className="biloo-payment-progress" aria-label="Checkout progress">
          <span data-complete="true">Cart</span>
          <i />
          <span data-active="true">Payment</span>
          <i />
          <span>Confirmation</span>
        </div>

        <div className="biloo-payment-content">
          <section className="biloo-payment-delivery">
            <span className="biloo-payment-section-icon">
              <Icon className="size-[18px]" name="home" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="biloo-payment-small-label">Deliver to</span>
              <strong>Home · Bole, Addis Ababa</strong>
              <small>Call on arrival</small>
            </span>
            <span className="biloo-payment-eta">{itemCount} items</span>
          </section>

          <button
            aria-expanded={showSummary}
            className="biloo-payment-order-toggle"
            onClick={() => setShowSummary((current) => !current)}
            type="button"
          >
            <span>
              <span className="biloo-payment-small-label">Order summary</span>
              <strong>{merchant}</strong>
            </span>
            <span>
              <strong>{formatETB(total)}</strong>
              <Icon
                className={`size-4 transition-transform ${showSummary ? "rotate-90" : ""}`}
                name="arrow"
              />
            </span>
          </button>

          {showSummary ? (
            <div className="biloo-payment-summary-lines">
              <PaymentLine label="Subtotal" value={formatETB(subtotal)} />
              <PaymentLine label="Delivery fee" value={formatETB(delivery)} />
              <PaymentLine label="Service fee" value={formatETB(serviceFee)} />
              <PaymentLine bold label="Total" value={formatETB(total)} />
            </div>
          ) : null}

          <div className="biloo-payment-section-title">
            <span>Choose payment method</span>
            <small>Encrypted and protected</small>
          </div>

          <div className="biloo-payment-methods">
            <PaymentChoice
              active={payment === "wallet"}
              detail={`Balance ${formatETB(walletBalance)}`}
              icon="wallet"
              onClick={() => selectPayment("wallet")}
              title="BILOO Wallet"
            />
            <PaymentChoice
              active={payment === "card"}
              detail="Visa, Mastercard and online payment"
              icon="card"
              onClick={() => selectPayment("card")}
              title="Bank card"
            />
            <PaymentChoice
              active={payment === "cash"}
              detail="Pay your courier when the order arrives"
              icon="cash"
              onClick={() => selectPayment("cash")}
              title="Cash on delivery"
            />
          </div>

          {payment === "wallet" ? (
            <div className={`biloo-payment-wallet ${walletValid ? "" : "is-low"}`}>
              <span>
                <span className="biloo-payment-small-label">Available balance</span>
                <strong>{formatETB(walletBalance)}</strong>
              </span>
              <span>
                {walletValid
                  ? `${formatETB(walletBalance - total)} remaining`
                  : `${formatETB(total - walletBalance)} more required`}
              </span>
            </div>
          ) : null}

          {payment === "card" ? (
            <div className="biloo-payment-card-section">
              <div className="biloo-payment-card-preview">
                <div className="biloo-payment-card-top">
                  <span>BILOO PAY</span>
                  <Icon className="size-5" name="card" />
                </div>
                <strong>{formattedCardNumber || "•••• •••• •••• ••••"}</strong>
                <div>
                  <span>{cardholder.trim() || "CARDHOLDER NAME"}</span>
                  <span>{expiry || "MM/YY"}</span>
                </div>
              </div>

              <label className="biloo-payment-field biloo-payment-field-wide">
                <span>Cardholder name</span>
                <input
                  autoComplete="cc-name"
                  onChange={(event) => setCardholder(event.target.value)}
                  placeholder="Name on card"
                  value={cardholder}
                />
              </label>
              <label className="biloo-payment-field biloo-payment-field-wide">
                <span>Card number</span>
                <input
                  autoComplete="cc-number"
                  inputMode="numeric"
                  onChange={(event) =>
                    setCardNumber(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                />
              </label>
              <div className="biloo-payment-card-fields">
                <label className="biloo-payment-field">
                  <span>Expiry</span>
                  <input
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                    placeholder="MM/YY"
                    value={expiry}
                  />
                </label>
                <label className="biloo-payment-field">
                  <span>CVV</span>
                  <input
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                    onChange={(event) =>
                      setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="123"
                    type="password"
                    value={cvv}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {payment === "cash" ? (
            <div className="biloo-payment-cash-note">
              <Icon className="size-[18px]" name="cash" />
              <span>
                Keep the exact amount ready where possible. The courier will
                confirm payment at delivery.
              </span>
            </div>
          ) : null}
        </div>

        <footer className="biloo-payment-footer">
          <div className="biloo-payment-footer-total">
            <span>Total</span>
            <strong>{formatETB(total)}</strong>
          </div>
          <button
            className="biloo-payment-submit"
            disabled={!canConfirm}
            onClick={submitPayment}
            type="button"
          >
            <Icon className="size-[17px]" name="shield" />
            <span>{methodLabel}</span>
            <span>{formatETB(total)}</span>
          </button>
          <p>
            By continuing, you confirm the order details and BILOO payment
            terms.
          </p>
        </footer>
      </section>
    </div>
  );
}

function PaymentChoice({
  active,
  icon,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  icon: "wallet" | "card" | "cash";
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="biloo-payment-choice"
      data-active={active}
      onClick={onClick}
      type="button"
    >
      <span className="biloo-payment-choice-icon">
        <Icon className="size-[18px]" name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <span className="biloo-payment-radio">
        {active ? <Icon className="size-3" name="check" /> : null}
      </span>
    </button>
  );
}

function PaymentLine({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="biloo-payment-summary-line" data-bold={bold}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
