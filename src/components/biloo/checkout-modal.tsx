"use client";

import { useState } from "react";

import type { CartLine, PaymentMethod } from "@/data/biloo";

import { Modal } from "./overlay-primitives";
import { formatETB, Icon } from "./ui";

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
  const subtotal = cart.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );
  const total = subtotal + (cart.length ? 75 : 0) + Math.round(subtotal * 0.025);

  if (!open) return null;

  return (
    <Modal onClose={onClose} title="Checkout">
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl bg-[#f5f8fa] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Deliver to
          </p>
          <div className="mt-3 flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-[#082640] shadow-sm">
              <Icon name="home" />
            </span>
            <div>
              <p className="text-sm font-black">Home</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Bole, Addis Ababa · Call on arrival
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Payment method
        </p>
        <div className="mt-3 space-y-3">
          {[
            {
              key: "wallet" as const,
              icon: "wallet" as const,
              title: "BILOO Wallet",
              detail: "Balance ETB 3,840.00",
            },
            {
              key: "card" as const,
              icon: "card" as const,
              title: "Bank card / online payment",
              detail: "Provider integration ready",
            },
            {
              key: "cash" as const,
              icon: "cash" as const,
              title: "Cash on delivery",
              detail: "Pay the driver or courier",
            },
          ].map((method) => (
            <button
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                payment === method.key
                  ? "border-[#082640] bg-[#f2f7fb]"
                  : "border-slate-200"
              }`}
              key={method.key}
              onClick={() => setPayment(method.key)}
              type="button"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-[#082640] shadow-sm">
                <Icon name={method.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">{method.title}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {method.detail}
                </span>
              </span>
              <span
                className={`grid size-5 place-items-center rounded-full border ${
                  payment === method.key
                    ? "border-[#082640] bg-[#082640] text-white"
                    : "border-slate-300"
                }`}
              >
                {payment === method.key ? (
                  <Icon className="size-3" name="check" />
                ) : null}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#082640] p-5 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
              Amount due
            </p>
            <p className="mt-2 text-2xl font-black">{formatETB(total)}</p>
          </div>
          <Icon className="size-7 text-[#f2bd4b]" name="shield" />
        </div>

        <button
          className="mt-5 min-h-13 w-full rounded-2xl bg-[#f2bd4b] text-sm font-black text-[#082640]"
          onClick={() => onConfirm(payment)}
          type="button"
        >
          Place order
        </button>
        <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">
          This MVP executes the complete front-end order flow. A payment
          provider and secure webhook verification are required before real
          charges are enabled.
        </p>
      </div>
    </Modal>
  );
}
