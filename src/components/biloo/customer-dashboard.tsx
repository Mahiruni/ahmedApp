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

const serviceCopy: Record<ServiceKey, { title: string; description: string }> = {
  food: {
    title: "Food near you",
    description: "Local kitchens with clear prices and reliable delivery times.",
  },
  taxi: {
    title: "Book a ride",
    description: "Upfront fares, nearby drivers and live trip progress.",
  },
  market: {
    title: "Groceries and essentials",
    description: "Everyday shopping from trusted local stores.",
  },
  construction: {
    title: "Construction materials",
    description: "Verified cement, steel, blocks and tools for your project.",
  },
  parts: {
    title: "Car parts",
    description: "Trusted suppliers, clear pricing and compatibility support.",
  },
};

const searchPlaceholders: Record<ServiceKey, string> = {
  food: "Search restaurants or meals",
  taxi: "Where to?",
  market: "Search groceries and stores",
  construction: "Search cement, steel or tools",
  parts: "Search vehicle parts",
};

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
  const [rideId, setRideId] =
    useState<(typeof rideTypes)[number]["id"]>("standard");

  const selectedRide =
    rideTypes.find((ride) => ride.id === rideId) ?? rideTypes[0];
  const copy = serviceCopy[service];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const serviceStats = useMemo(() => {
    const active = orders.filter((order) => order.progress < 100).length;
    const completed = orders.filter((order) => order.progress >= 100).length;
    return { active, completed };
  }, [orders]);

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="pt-1" data-biloo-customer-home>
        <button
          className="inline-flex max-w-full items-center gap-1.5 text-[12px] font-medium text-[#545454] transition hover:text-black"
          onClick={onLocate}
          type="button"
        >
          <Icon className="size-4 shrink-0" name="location" />
          <span className="truncate">{locationLabel}</span>
        </button>

        <h1 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-black sm:text-[40px]">
          What do you need?
        </h1>

        <label className="mt-5 flex h-14 items-center gap-3 rounded-xl bg-[#f3f3f3] px-4 transition focus-within:ring-2 focus-within:ring-black/10">
          <Icon className="size-5 shrink-0 text-black" name="search" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-normal text-black outline-none placeholder:text-[#777777] focus:shadow-none"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
            placeholder={searchPlaceholders[service]}
            value={search}
          />
          <button
            aria-label="Use current location"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:bg-[#e8e8e8]"
            onClick={(event) => {
              event.preventDefault();
              onLocate();
            }}
            type="button"
          >
            <Icon className="size-4" name="navigation" />
          </button>
        </label>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-black">
            Services
          </h2>
          <span className="text-[11px] text-[#777777]">All in BILOO</span>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
          {services.map((item) => {
            const active = service === item.key;
            return (
              <button
                aria-pressed={active}
                className="group min-w-0 text-center"
                key={item.key}
                onClick={() => {
                  setService(item.key);
                  setSearch("");
                }}
                type="button"
              >
                <span
                  className={`mx-auto grid aspect-square w-full max-w-[68px] place-items-center rounded-xl transition ${
                    active
                      ? "bg-black text-white"
                      : "bg-[#f3f3f3] text-black group-hover:bg-[#e8e8e8]"
                  }`}
                >
                  <Icon className="size-5 sm:size-6" name={item.icon} />
                </span>
                <span
                  className={`mt-2 block truncate text-[10px] font-medium sm:text-[11px] ${
                    active ? "text-black" : "text-[#545454]"
                  }`}
                >
                  {serviceLabel(item.key)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#e4e4e4] bg-white">
        <button
          className="min-w-0 border-r border-[#eeeeee] px-3 py-3.5 text-left transition hover:bg-[#f8f8f8]"
          type="button"
        >
          <span className="block truncate text-[10px] text-[#777777]">Wallet</span>
          <span className="mt-1 block truncate text-[14px] font-semibold text-black sm:text-[16px]">
            ETB 3,840
          </span>
        </button>
        <button
          className="min-w-0 border-r border-[#eeeeee] px-3 py-3.5 text-left transition hover:bg-[#f8f8f8]"
          type="button"
        >
          <span className="block truncate text-[10px] text-[#777777]">Active</span>
          <span className="mt-1 block text-[14px] font-semibold text-black sm:text-[16px]">
            {serviceStats.active}
          </span>
        </button>
        <button
          className="min-w-0 px-3 py-3.5 text-left transition hover:bg-[#f8f8f8]"
          onClick={onOpenCart}
          type="button"
        >
          <span className="block truncate text-[10px] text-[#777777]">Cart</span>
          <span className="mt-1 flex items-center justify-between gap-1 text-[14px] font-semibold text-black sm:text-[16px]">
            {cartCount}
            <Icon className="size-4 shrink-0" name="arrow" />
          </span>
        </button>
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Surface className="overflow-hidden p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#777777]">
                  {serviceLabel(service)}
                </p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-black sm:text-[26px]">
                  {copy.title}
                </h2>
                <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-[#6b6b6b] sm:text-[13px]">
                  {copy.description}
                </p>
              </div>
              <StatusPill tone="success">Available</StatusPill>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {catalogItems.map((item) => (
                <article
                  className="group flex min-h-[132px] gap-3 rounded-xl border border-[#e4e4e4] bg-white p-3 transition hover:border-[#cfcfcf] hover:shadow-[0_3px_12px_rgba(0,0,0,0.06)]"
                  key={item.id}
                >
                  <span className="grid size-[72px] shrink-0 place-items-center rounded-lg bg-[#f3f3f3] text-[30px]">
                    {item.icon}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] text-[#777777]">
                          {item.merchant}
                        </p>
                        <h3 className="mt-1 truncate text-[14px] font-semibold text-black">
                          {item.name}
                        </h3>
                      </div>
                      {item.badge ? (
                        <span className="shrink-0 rounded-full bg-[#f3f3f3] px-2 py-1 text-[9px] font-medium text-[#545454]">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[#6b6b6b]">
                      {item.description}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] text-[#777777]">
                          {item.rating} ★ · {item.eta}
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold text-black">
                          {formatETB(item.price)}
                        </p>
                      </div>
                      <button
                        aria-label={`Add ${item.name} to cart`}
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-black text-white transition hover:bg-[#333333] active:scale-95"
                        onClick={() => onAddToCart(item)}
                        type="button"
                      >
                        <Icon className="size-4" name="plus" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {catalogItems.length === 0 ? (
              <div className="mt-5 rounded-xl bg-[#f3f3f3] px-5 py-12 text-center">
                <Icon className="mx-auto size-5 text-[#777777]" name="search" />
                <p className="mt-3 text-[13px] font-semibold text-black">
                  No matching results
                </p>
                <p className="mt-1 text-[11px] text-[#777777]">
                  Try another product, store or category.
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
