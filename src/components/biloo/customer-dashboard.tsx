"use client";

import { type ChangeEvent, useMemo, useState } from "react";

import {
  rideTypes,
  services,
  type ActiveOrder,
  type CartLine,
  type CatalogItem,
  type ServiceKey,
} from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill, Surface } from "./ui";
import { OrdersPanel } from "./orders-panel";
import { TaxiBooking } from "./taxi-booking";

interface CustomerDashboardProps {
  service: ServiceKey;
  setService: (service: ServiceKey) => void;
  search: string;
  setSearch: (value: string) => void;
  catalogItems: CatalogItem[];
  cart: CartLine[];
  orders: ActiveOrder[];
  locationLabel: string;
  onLocate: () => void;
  onAddToCart: (item: CatalogItem) => void;
  onOpenCart: () => void;
  onBookTaxi: (booking: {
    pickup: string;
    dropoff: string;
    rideName: string;
    fare: number;
  }) => void;
  onTrackOrder: (order: ActiveOrder) => void;
}

export function CustomerDashboard({
  service,
  setService,
  search,
  setSearch,
  catalogItems,
  cart,
  orders,
  locationLabel,
  onLocate,
  onAddToCart,
  onOpenCart,
  onBookTaxi,
  onTrackOrder,
}: CustomerDashboardProps) {
  const [pickup, setPickup] = useState("Bole, Addis Ababa");
  const [dropoff, setDropoff] = useState("Bole International Airport");
  const [rideId, setRideId] = useState<(typeof rideTypes)[number]["id"]>(
    "standard",
  );

  const selectedRide =
    rideTypes.find((ride) => ride.id === rideId) ?? rideTypes[0];

  const serviceDetails =
    services.find((candidate) => candidate.key === service) ?? services[0];

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const featuredTitle = useMemo(() => {
    if (service === "food") return "Meals people love nearby";
    if (service === "market") return "Everyday essentials, delivered";
    if (service === "construction") return "Trusted materials and tools";
    if (service === "parts") return "Parts matched to your vehicle";
    return "Choose your ride";
  }, [service]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#082640] px-5 py-6 text-white shadow-[0_28px_80px_rgba(8,38,64,0.22)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#f2bd4b]/14 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 size-80 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.16fr_0.84fr] xl:items-center">
          <div>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-left text-xs font-bold text-white/72 transition hover:bg-white/12"
              onClick={onLocate}
              type="button"
            >
              <Icon className="size-4 text-[#f2bd4b]" name="location" />
              <span className="max-w-[230px] truncate">{locationLabel}</span>
              <span className="text-[#f2bd4b]">Change</span>
            </button>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl lg:text-[3.6rem] lg:leading-[1.02]">
              Everything Addis needs, moving through one app.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              Book a taxi, order dinner, restock your home, source building
              materials or find the right car part—with one identity, one
              wallet and live tracking.
            </p>

            <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
              <Icon className="size-5 shrink-0 text-slate-400" name="search" />
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                placeholder="Search food, groceries, cement, brake pads..."
                value={search}
              />
              <button
                className="hidden min-h-11 rounded-xl bg-[#f2bd4b] px-5 text-sm font-black text-[#082640] transition hover:bg-[#ffd272] sm:block"
                type="button"
              >
                Search
              </button>
            </label>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/9 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/45">
                  BILOO balance
                </p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em]">
                  ETB 3,840.00
                </p>
                <p className="mt-2 text-xs text-white/48">
                  Ready for rides, deliveries and refunds
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-[#f2bd4b]">
                <Icon name="wallet" />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: "plus" as const, label: "Add money" },
                { icon: "card" as const, label: "Cards" },
                { icon: "receipt" as const, label: "History" },
              ].map((action) => (
                <button
                  className="rounded-2xl bg-white/8 px-2 py-4 text-center transition hover:bg-white/13"
                  key={action.label}
                  type="button"
                >
                  <Icon
                    className="mx-auto size-5 text-[#f2bd4b]"
                    name={action.icon}
                  />
                  <span className="mt-2 block text-[10px] font-bold text-white/65 sm:text-[11px]">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="mt-3 flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 text-sm font-black text-[#082640] transition hover:-translate-y-0.5"
              onClick={onOpenCart}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Icon name="cart" />
                Open cart
              </span>
              <span className="rounded-full bg-[#082640] px-2.5 py-1 text-xs text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {services.map((item) => {
          const active = service === item.key;
          return (
            <button
              className={`group min-h-[132px] rounded-[1.55rem] border p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                active
                  ? "border-[#082640] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.09)]"
                  : "border-slate-200 bg-white"
              }`}
              key={item.key}
              onClick={() => {
                setService(item.key);
                setSearch("");
              }}
              type="button"
            >
              <span
                className="grid size-11 place-items-center rounded-2xl"
                style={{ backgroundColor: item.soft, color: item.accent }}
              >
                <Icon name={item.icon} />
              </span>
              <span className="mt-4 block text-base font-black text-[#10243a]">
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </section>

      {service === "taxi" ? (
        <TaxiBooking
          dropoff={dropoff}
          onBook={() =>
            onBookTaxi({
              pickup,
              dropoff,
              rideName: selectedRide.name,
              fare: selectedRide.fare,
            })
          }
          pickup={pickup}
          rideId={rideId}
          setDropoff={setDropoff}
          setPickup={setPickup}
          setRideId={setRideId}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]">
          <Surface className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{ color: serviceDetails.accent }}
                >
                  {serviceLabel(service)}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  {featuredTitle}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Verified providers, upfront pricing and tracked fulfillment.
                </p>
              </div>
              <StatusPill tone="success">Available now</StatusPill>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {catalogItems.map((item) => (
                <article
                  className="group flex min-h-[250px] flex-col rounded-[1.45rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                  key={item.id}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="grid size-16 shrink-0 place-items-center rounded-2xl text-3xl"
                      style={{ backgroundColor: serviceDetails.soft }}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                          {item.merchant}
                        </p>
                        {item.badge ? (
                          <span className="rounded-full bg-[#fff8e6] px-2 py-1 text-[9px] font-black text-amber-700">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-lg font-black tracking-[-0.025em] text-[#10243a]">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <Icon className="size-3" name="star" />
                      {item.rating}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon className="size-3.5" name="clock" />
                      {item.eta}
                    </span>
                    <span>{item.category}</span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Price
                      </p>
                      <p className="mt-1 text-xl font-black tracking-[-0.03em]">
                        {formatETB(item.price)}
                      </p>
                    </div>
                    <button
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#082640] px-4 text-xs font-black text-white transition hover:bg-[#0d365b]"
                      onClick={() => onAddToCart(item)}
                      type="button"
                    >
                      <Icon className="size-4" name="plus" />
                      Add
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {catalogItems.length === 0 ? (
              <div className="mt-6 rounded-[1.45rem] bg-slate-50 px-6 py-14 text-center">
                <Icon className="mx-auto size-8 text-slate-300" name="search" />
                <p className="mt-4 text-sm font-black text-slate-600">
                  No matching results
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Try another product, merchant or category.
                </p>
              </div>
            ) : null}
          </Surface>

          <OrdersPanel onTrackOrder={onTrackOrder} orders={orders} />
        </div>
      )}
    </div>
  );
}
