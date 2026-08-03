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
    title: "Great food, without slowing down your day.",
    description:
      "Discover standout kitchens, honest delivery times and meals people are ordering around you.",
  },
  taxi: {
    title: "A calmer way to move across Addis.",
    description:
      "See your fare, choose your ride and follow every stage from driver match to destination.",
  },
  market: {
    title: "Your weekly essentials, beautifully organised.",
    description:
      "Shop trusted local markets with live availability, clear pricing and tracked delivery.",
  },
  construction: {
    title: "Serious materials for serious projects.",
    description:
      "Order verified cement, steel, blocks and tools with site-ready fulfilment.",
  },
  parts: {
    title: "The right part, matched with confidence.",
    description:
      "Browse trusted auto suppliers, compatibility-ready listings and installation support.",
  },
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
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#1d2026] bg-[#000308] px-5 py-6 text-white shadow-[0_28px_76px_rgba(0,3,8,0.24)] sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <div className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-[#f2d019]/14 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#f2d019] px-4 text-[10px] font-black uppercase tracking-[0.17em] text-[#000308]">
                <span className="size-2 rounded-full bg-[#000308]" />
                BILOO Addis
              </span>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/14 bg-white/7 px-3.5 text-xs font-bold text-white/72 transition hover:bg-white/12"
                onClick={onLocate}
                type="button"
              >
                <Icon className="size-4 text-[#f4ff00]" name="location" />
                <span className="max-w-[210px] truncate">{locationLabel}</span>
              </button>
            </div>

            <h1 className="mt-6 max-w-4xl text-[2.7rem] font-black leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-[4.7rem]">
              Everything you need,
              <span className="block text-[#f4ff00]">one move away.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              Food, rides, groceries, construction materials and car parts in one clear, connected BILOO experience.
            </p>

            <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <Icon className="size-5 shrink-0 text-[#747579]" name="search" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm font-bold text-[#090a0c] outline-none placeholder:font-semibold placeholder:text-[#8c8d90] focus:shadow-none"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearch(event.target.value)
                }
                placeholder="Search food, groceries, materials or parts"
                value={search}
              />
              <span className="hidden min-h-11 items-center rounded-xl bg-[#f2d019] px-5 text-[10px] font-black uppercase tracking-[0.14em] text-[#000308] sm:flex">
                Search
              </span>
            </label>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-white/52">
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#f4ff00]" name="shield" />
                Verified providers
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#f4ff00]" name="map" />
                Live tracking
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#f4ff00]" name="wallet" />
                One wallet
              </span>
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-white/12 bg-[#111318] p-3 shadow-[0_22px_56px_rgba(0,0,0,0.24)] sm:p-4">
            <div className="rounded-[1.4rem] bg-[#f2d019] p-5 text-[#000308] shadow-[0_18px_44px_rgba(242,208,25,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-55">
                    BILOO wallet
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.045em]">
                    ETB 3,840
                  </p>
                  <p className="mt-2 text-xs font-semibold opacity-60">
                    Available across every BILOO service
                  </p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#000308] text-[#f4ff00]">
                  <Icon name="wallet" />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { icon: "plus" as const, label: "Top up" },
                  { icon: "card" as const, label: "Cards" },
                  { icon: "receipt" as const, label: "Activity" },
                ].map((action) => (
                  <button
                    className="rounded-xl bg-black/8 px-2 py-3.5 text-center transition hover:bg-black/13"
                    key={action.label}
                    type="button"
                  >
                    <Icon
                      className="mx-auto size-4.5 text-[#000308]"
                      name={action.icon}
                    />
                    <span className="mt-2 block text-[10px] font-black">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/38">
                  Live now
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {serviceStats.active}
                </p>
                <p className="mt-1 text-xs text-white/45">active journeys</p>
              </div>
              <button
                className="flex rounded-[1.2rem] bg-white p-4 text-left text-[#000308] transition hover:bg-[#f4f4f1]"
                onClick={onOpenCart}
                type="button"
              >
                <span className="flex-1">
                  <span className="block text-[9px] font-black uppercase tracking-[0.15em] opacity-50">
                    Your cart
                  </span>
                  <span className="mt-2 block text-2xl font-black">
                    {cartCount}
                  </span>
                  <span className="mt-1 block text-xs font-bold opacity-50">
                    items ready
                  </span>
                </span>
                <Icon className="size-5" name="arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#77787b]">
              BILOO services
            </p>
            <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em] text-[#090a0c]">
              What do you need today?
            </h2>
          </div>
          <p className="hidden text-xs font-semibold text-[#77787b] sm:block">
            One account · one wallet · one timeline
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {services.map((item, index) => {
            const active = service === item.key;
            return (
              <button
                className={`group relative min-h-[138px] overflow-hidden rounded-[1.35rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                  active
                    ? "border-[#f2d019] bg-[#f2d019] text-[#000308] shadow-[0_14px_34px_rgba(242,208,25,0.22)]"
                    : "border-[#deded8] bg-white text-[#090a0c] shadow-sm hover:border-[#bdbdb7] hover:shadow-[0_10px_28px_rgba(0,3,8,0.08)]"
                }`}
                key={item.key}
                onClick={() => {
                  setService(item.key);
                  setSearch("");
                }}
                type="button"
              >
                <span
                  className={`absolute right-3 top-3 text-[10px] font-black ${
                    active ? "text-black/28" : "text-[#b4b4af]"
                  }`}
                >
                  0{index + 1}
                </span>
                <span
                  className={`grid size-12 place-items-center rounded-xl transition ${
                    active
                      ? "bg-[#000308] text-[#f4ff00]"
                      : "bg-[#fff9c8] text-[#000308]"
                  }`}
                >
                  <Icon name={item.icon} />
                </span>
                <span className="mt-5 block text-base font-black tracking-[-0.02em]">
                  {item.label}
                </span>
                <span
                  className={`mt-1.5 block text-xs leading-5 ${
                    active ? "text-black/55" : "text-[#77787b]"
                  }`}
                >
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
          <Surface className="overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#f2d019]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#807000]">
                    {serviceLabel(service)}
                  </p>
                </div>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">
                  {copy.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68696c]">
                  {copy.description}
                </p>
              </div>
              <StatusPill tone="success">Available now</StatusPill>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {catalogItems.map((item) => (
                <article
                  className="group relative flex min-h-[276px] flex-col overflow-hidden rounded-[1.35rem] border border-[#deded8] bg-white p-4.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#bdbdb7] hover:shadow-[0_14px_36px_rgba(0,3,8,0.09)]"
                  key={item.id}
                >
                  <div className="relative flex items-start gap-4">
                    <span className="grid size-[68px] shrink-0 place-items-center rounded-[1.15rem] bg-[#fff9c8] text-3xl">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[10px] font-black uppercase tracking-[0.13em] text-[#77787b]">
                          {item.merchant}
                        </p>
                        {item.badge ? (
                          <span className="rounded-full bg-[#fff9c8] px-2 py-1 text-[9px] font-black text-[#6f6200]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2.5 text-lg font-black leading-6 tracking-[-0.025em] text-[#090a0c]">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#68696c]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5 flex flex-wrap items-center gap-2.5 text-[10px] font-black text-[#68696c]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff9c8] px-2.5 py-1.5 text-[#6f6200]">
                      <Icon className="size-3" name="star" /> {item.rating}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f2ef] px-2.5 py-1.5">
                      <Icon className="size-3.5" name="clock" /> {item.eta}
                    </span>
                    <span className="rounded-full bg-[#f2f2ef] px-2.5 py-1.5">
                      {item.category}
                    </span>
                  </div>

                  <div className="relative mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8b8c8f]">
                        From
                      </p>
                      <p className="mt-1 text-xl font-black tracking-[-0.035em] text-[#090a0c]">
                        {formatETB(item.price)}
                      </p>
                      {typeof item.stock === "number" ? (
                        <p className="mt-1 text-[10px] font-bold text-[#8b8c8f]">
                          {item.stock} available
                        </p>
                      ) : null}
                    </div>
                    <button
                      aria-label={`Add ${item.name} to cart`}
                      className="grid size-12 place-items-center rounded-xl bg-[#f2d019] text-[#000308] shadow-[0_10px_24px_rgba(242,208,25,0.2)] transition hover:bg-[#f4ff00] active:scale-95"
                      onClick={() => onAddToCart(item)}
                      type="button"
                    >
                      <Icon className="size-5" name="plus" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {catalogItems.length === 0 ? (
              <div className="mt-7 rounded-[1.35rem] border border-dashed border-[#deded8] bg-[#f7f7f4] px-6 py-16 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-xl bg-white text-[#a4a4a0] shadow-sm">
                  <Icon className="size-6" name="search" />
                </span>
                <p className="mt-4 text-sm font-black text-[#444548]">
                  No matching results
                </p>
                <p className="mt-2 text-xs text-[#77787b]">
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
