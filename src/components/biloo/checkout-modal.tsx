"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CartLine, PaymentMethod } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

const walletBalance = 3840;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

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
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const subtotal = cart.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );
  const delivery = cart.length ? 75 : 0;
  const serviceFee = cart.length ? Math.round(subtotal * 0.025) : 0;
  const total = subtotal + delivery + serviceFee;
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const merchant = cart[0]?.item.merchant ?? "BILOO partner";
  const service = cart[0]?.item.service;
  const walletAvailable = total <= walletBalance;

  const cardValid = useMemo(() => {
    const numberDigits = cardNumber.replace(/\D/g, "");
    return (
      cardName.trim().length >= 2 &&
      numberDigits.length >= 15 &&
      expiry.length === 5 &&
      cvv.length >= 3
    );
  }, [cardName, cardNumber, cvv, expiry]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 120);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  function choosePayment(next: PaymentMethod) {
    setPayment(next);
    setError(null);
  }

  function submitPayment() {
    if (!cart.length) return;
    if (payment === "wallet" && !walletAvailable) {
      setError("Your BILOO Wallet balance is not enough for this order.");
      return;
    }
    if (payment === "card" && !cardValid) {
      setError("Complete the card details before placing your order.");
      return;
    }

    setError(null);
    onConfirm(payment);
  }

  return (
    <div
      aria-hidden={!open}
      className="biloo-payment-overlay"
      data-open={open}
    >
      <button
        aria-label="Return to cart"
        className="biloo-payment-backdrop"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        type="button"
      />

      <section
        aria-label="Secure checkout"
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
            <Icon className="size-[17px] rotate-180" name="arrow" />
          </button>

          <div className="min-w-0 flex-1">
            <span className="biloo-payment-eyebrow">Secure BILOO checkout</span>
            <h2>Payment</h2>
          </div>

          <span className="biloo-payment-secure">
            <Icon className="size-[14px]" name="shield" />
            Protected
          </span>

          <button
            ref={closeButtonRef}
            aria-label="Close payment"
            className="biloo-payment-close"
            onClick={onClose}
            type="button"
          >
            <Icon className="size-[18px]" name="close" />
          </button>
        </header>

        <div className="biloo-payment-progress" aria-label="Checkout progress">
          <span data-complete="true">
            <Icon className="size-3" name="check" />
            Cart
          </span>
          <i />
          <span data-active="true">2</span>
          <strong>Payment</strong>
          <i />
          <span>3</span>
          <strong>Confirmation</strong>
        </div>

        <div className="biloo-payment-content">
          <section className="biloo-payment-delivery">
            <span className="biloo-payment-delivery-icon">
              <Icon className="size-[18px]" name="home" />
            </span>
            <span className="min-w-0 flex-1">
              <small>Deliver to</small>
              <strong>Home · Bole, Addis Ababa</strong>
              <em>Call on arrival</em>
            </span>
            <button type="button">Change</button>
          </section>

          <div className="biloo-payment-section-heading">
            <div>
              <small>Choose how to pay</small>
              <h3>Payment method</h3>
            </div>
            <span>{formatETB(total)}</span>
          </div>

          <div className="biloo-payment-methods" role="radiogroup">
            <PaymentChoice
              active={payment === "wallet"}
              detail={`Balance ${formatETB(walletBalance)}`}
              icon="wallet"
              onClick={() => choosePayment("wallet")}
              title="BILOO Wallet"
              warning={!walletAvailable ? "Insufficient balance" : undefined}
            />
            <PaymentChoice
              active={payment === "card"}
              detail="Debit or credit card"
              icon="card"
              onClick={() => choosePayment("card")}
              title="Bank card"
            />
            <PaymentChoice
              active={payment === "cash"}
              detail="Pay the courier on delivery"
              icon="cash"
              onClick={() => choosePayment("cash")}
              title="Cash"
            />
          </div>

          {payment === "card" ? (
            <section className="biloo-card-form" aria-label="Card details">
              <div className="biloo-card-preview" aria-hidden="true">
                <span>BILOO</span>
                <Icon className="size-5" name="shield" />
                <strong>{cardNumber || "•••• •••• •••• ••••"}</strong>
                <small>{cardName || "CARDHOLDER NAME"}</small>
                <em>{expiry || "MM/YY"}</em>
              </div>

              <label className="biloo-payment-field biloo-payment-field-wide">
                <span>Name on card</span>
                <input
                  autoComplete="cc-name"
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Mahir Aman"
                  value={cardName}
                />
              </label>

              <label className="biloo-payment-field biloo-payment-field-wide">
                <span>Card number</span>
                <div>
                  <Icon className="size-[17px]" name="card" />
                  <input
                    autoComplete="cc-number"
                    inputMode="numeric"
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                  />
                </div>
              </label>

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
                <span>Security code</span>
                <input
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) =>
                    setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVV"
                  type="password"
                  value={cvv}
                />
              </label>
            </section>
          ) : null}

          {payment === "wallet" ? (
            <section className="biloo-payment-method-note" data-tone={walletAvailable ? "success" : "warning"}>
              <Icon className="size-[18px]" name={walletAvailable ? "check" : "alert"} />
              <span>
                <strong>{walletAvailable ? "Ready to pay instantly" : "Add funds or choose another method"}</strong>
                <small>
                  {walletAvailable
                    ? `${formatETB(total)} will be deducted from your BILOO Wallet.`
                    : `You need ${formatETB(total - walletBalance)} more to use your wallet.`}
                </small>
              </span>
            </section>
          ) : null}

          {payment === "cash" ? (
            <section className="biloo-payment-method-note">
              <Icon className="size-[18px]" name="cash" />
              <span>
                <strong>Prepare the exact amount where possible</strong>
                <small>Your courier will confirm payment when the order arrives.</small>
              </span>
            </section>
          ) : null}

          <section className="biloo-payment-order-card">
            <div>
              <span className="biloo-payment-order-icon">
                <Icon className="size-[18px]" name="receipt" />
              </span>
              <span className="min-w-0 flex-1">
                <small>{service ? serviceLabel(service) : "BILOO order"}</small>
                <strong>{merchant}</strong>
                <em>{itemCount} {itemCount === 1 ? "item" : "items"}</em>
              </span>
            </div>
            <dl>
              <div><dt>Subtotal</dt><dd>{formatETB(subtotal)}</dd></div>
              <div><dt>Delivery</dt><dd>{formatETB(delivery)}</dd></div>
              <div><dt>Service fee</dt><dd>{formatETB(serviceFee)}</dd></div>
              <div data-total="true"><dt>Total</dt><dd>{formatETB(total)}</dd></div>
            </dl>
          </section>

          {error ? (
            <p className="biloo-payment-error" role="alert">
              <Icon className="size-4" name="alert" />
              {error}
            </p>
          ) : null}
        </div>

        <footer className="biloo-payment-footer">
          <div>
            <small>Total due</small>
            <strong>{formatETB(total)}</strong>
          </div>
          <button
            disabled={!cart.length}
            onClick={submitPayment}
            type="button"
          >
            <Icon className="size-[17px]" name="shield" />
            {payment === "cash" ? "Place order" : `Pay ${formatETB(total)}`}
            <Icon className="size-[17px]" name="arrow" />
          </button>
          <p>
            Card details are UI-ready. Real charges require an enabled payment provider and server-side verification.
          </p>
        </footer>
      </section>
    </div>
  );
}

function PaymentChoice({
  active,
  detail,
  icon,
  onClick,
  title,
  warning,
}: {
  active: boolean;
  detail: string;
  icon: "wallet" | "card" | "cash";
  onClick: () => void;
  title: string;
  warning?: string;
}) {
  return (
    <button
      aria-checked={active}
      className="biloo-payment-choice"
      data-active={active}
      onClick={onClick}
      role="radio"
      type="button"
    >
      <span className="biloo-payment-choice-icon">
        <Icon className="size-[18px]" name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <strong>{title}</strong>
        <small data-warning={Boolean(warning)}>{warning ?? detail}</small>
      </span>
      <span className="biloo-payment-radio">
        {active ? <Icon className="size-3" name="check" /> : null}
      </span>
    </button>
  );
}
