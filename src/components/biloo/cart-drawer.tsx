"use client";

import type { CartLine } from "@/data/biloo";

import { formatETB, Icon, serviceLabel } from "./ui";

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
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const delivery = cart.length ? 75 : 0;
  const serviceFee = cart.length ? Math.round(subtotal * 0.025) : 0;
  const total = subtotal + delivery + serviceFee;
  const cartService = cart[0]?.item.service;
  const merchant = cart[0]?.item.merchant;

  return (
    <div
      aria-hidden={!open}
      className="biloo-cart-overlay"
      data-open={open}
    >
      <button
        aria-label="Close cart"
        className="biloo-cart-backdrop"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        type="button"
      />

      <section
        aria-label="Your cart"
        aria-modal="true"
        className="biloo-cart-sheet"
        role="dialog"
      >
        <div className="biloo-cart-handle" aria-hidden="true" />

        <header className="biloo-cart-header">
          <div className="biloo-cart-heading">
            <span className="biloo-cart-heading-icon" aria-hidden="true">
              <Icon className="size-[19px]" name="cart" />
            </span>
            <span className="min-w-0">
              <span className="biloo-cart-eyebrow">
                {cartService ? serviceLabel(cartService) : "BILOO shopping"}
              </span>
              <span className="biloo-cart-title">Your cart</span>
            </span>
          </div>

          <div className="biloo-cart-header-actions">
            {itemCount ? (
              <span className="biloo-cart-count">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            ) : null}
            <button
              aria-label="Close cart"
              className="biloo-cart-close"
              onClick={onClose}
              type="button"
            >
              <Icon className="size-[18px]" name="close" />
            </button>
          </div>
        </header>

        {cart.length ? (
          <>
            <div className="biloo-cart-content">
              <div className="biloo-cart-order-context">
                <span className="biloo-cart-context-icon" aria-hidden="true">
                  <Icon className="size-4" name="vendor" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="biloo-cart-context-label">Ordering from</span>
                  <span className="biloo-cart-context-value">
                    {merchant ?? "BILOO partner"}
                  </span>
                </span>
                <span className="biloo-cart-context-status">Available</span>
              </div>

              <div className="biloo-cart-items">
                {cart.map((line) => {
                  const lineTotal = line.item.price * line.quantity;
                  return (
                    <article className="biloo-cart-item" key={line.item.id}>
                      <span className="biloo-cart-item-visual" aria-hidden="true">
                        {line.item.icon}
                      </span>

                      <div className="biloo-cart-item-body">
                        <div className="biloo-cart-item-topline">
                          <div className="min-w-0 flex-1">
                            <h3 className="biloo-cart-item-name">
                              {line.item.name}
                            </h3>
                            <p className="biloo-cart-item-meta">
                              {formatETB(line.item.price)} each
                            </p>
                          </div>
                          <strong className="biloo-cart-item-total">
                            {formatETB(lineTotal)}
                          </strong>
                        </div>

                        <div className="biloo-cart-item-controls">
                          <button
                            aria-label={
                              line.quantity === 1
                                ? `Remove ${line.item.name} from cart`
                                : `Remove one ${line.item.name}`
                            }
                            className="biloo-cart-quantity-button"
                            data-action="decrease"
                            onClick={() =>
                              onUpdateQuantity(
                                line.item.id,
                                line.quantity - 1,
                              )
                            }
                            type="button"
                          >
                            <Icon className="size-4" name="minus" />
                          </button>
                          <span
                            aria-label={`${line.quantity} in cart`}
                            className="biloo-cart-quantity-value"
                          >
                            {line.quantity}
                          </span>
                          <button
                            aria-label={`Add one ${line.item.name}`}
                            className="biloo-cart-quantity-button"
                            data-action="increase"
                            onClick={() =>
                              onUpdateQuantity(
                                line.item.id,
                                line.quantity + 1,
                              )
                            }
                            type="button"
                          >
                            <Icon className="size-4" name="plus" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <footer className="biloo-cart-summary">
              <div className="biloo-cart-summary-lines">
                <SummaryLine label="Subtotal" value={formatETB(subtotal)} />
                <SummaryLine label="Delivery fee" value={formatETB(delivery)} />
                <SummaryLine
                  label="Service fee"
                  value={formatETB(serviceFee)}
                />
              </div>

              <div className="biloo-cart-total-row">
                <span>
                  <span className="biloo-cart-total-label">Total</span>
                  <span className="biloo-cart-total-note">
                    Taxes included where applicable
                  </span>
                </span>
                <strong>{formatETB(total)}</strong>
              </div>

              <button
                className="biloo-cart-checkout"
                onClick={onCheckout}
                type="button"
              >
                <span>Continue to payment</span>
                <span className="biloo-cart-checkout-total">
                  {formatETB(total)}
                </span>
                <Icon className="size-[18px]" name="arrow" />
              </button>
            </footer>
          </>
        ) : (
          <div className="biloo-cart-empty">
            <span className="biloo-cart-empty-icon" aria-hidden="true">
              <Icon className="size-8" name="cart" />
            </span>
            <h3>Your cart is empty</h3>
            <p>
              Browse food, groceries, construction materials or car parts and
              add what you need.
            </p>
            <button onClick={onClose} type="button">
              Browse services
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="biloo-cart-summary-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
