"use client";

import type { CartLine } from "@/data/biloo";

import { Drawer } from "./overlay-primitives";
import { formatETB, Icon } from "./ui";

export function CartDrawer({
  open,
  cart,
  onClose,
  onUpdateQuantity,
  onCheckout,
}: {
  open: boolean;
  cart: CartLine[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onCheckout: () => void;
}) {
  const subtotal = cart.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );
  const delivery = cart.length ? 75 : 0;
  const serviceFee = cart.length ? Math.round(subtotal * 0.025) : 0;

  return (
    <Drawer onClose={onClose} open={open} title="Your cart">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {cart.length ? (
            <div className="space-y-3">
              {cart.map((line) => (
                <article
                  className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                  key={line.item.id}
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f5f8fa] text-2xl">
                    {line.item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">
                      {line.item.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {line.item.merchant}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-black">
                        {formatETB(line.item.price * line.quantity)}
                      </span>
                      <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
                        <button
                          aria-label={`Remove one ${line.item.name}`}
                          className="grid size-8 place-items-center rounded-lg bg-white text-[#082640]"
                          onClick={() =>
                            onUpdateQuantity(line.item.id, line.quantity - 1)
                          }
                          type="button"
                        >
                          <Icon className="size-4" name="minus" />
                        </button>
                        <span className="min-w-5 text-center text-xs font-black">
                          {line.quantity}
                        </span>
                        <button
                          aria-label={`Add one ${line.item.name}`}
                          className="grid size-8 place-items-center rounded-lg bg-[#082640] text-white"
                          onClick={() =>
                            onUpdateQuantity(line.item.id, line.quantity + 1)
                          }
                          type="button"
                        >
                          <Icon className="size-4" name="plus" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <span className="mx-auto grid size-20 place-items-center rounded-[1.7rem] bg-[#f2f7fb] text-[#082640]">
                  <Icon className="size-8" name="cart" />
                </span>
                <h3 className="mt-5 text-xl font-black">Your cart is empty</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Add products from food, supermarket, construction or car
                  parts to begin an order.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-5 sm:p-6">
          <div className="space-y-2 text-sm">
            <SummaryLine label="Subtotal" value={formatETB(subtotal)} />
            <SummaryLine label="Delivery" value={formatETB(delivery)} />
            <SummaryLine label="Service fee" value={formatETB(serviceFee)} />
            <div className="my-3 border-t border-slate-200" />
            <SummaryLine
              bold
              label="Total"
              value={formatETB(subtotal + delivery + serviceFee)}
            />
          </div>
          <button
            className="mt-5 min-h-13 w-full rounded-2xl bg-[#082640] text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!cart.length}
            onClick={onCheckout}
            type="button"
          >
            Continue to payment
          </button>
        </div>
      </div>
    </Drawer>
  );
}


function SummaryLine({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        bold ? "text-base font-black" : "text-slate-500"
      }`}
    >
      <span>{label}</span>
      <span className={bold ? "text-[#082640]" : "font-bold text-slate-700"}>
        {value}
      </span>
    </div>
  );
}
