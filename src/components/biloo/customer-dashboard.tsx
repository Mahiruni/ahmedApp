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
    description: "Discover standout kitchens, honest delivery times and meals people are ordering around you.",
  },
  taxi: {
    title: "A calmer way to move across Addis.",
    description: "See your fare, choose your ride and follow every stage from driver match to destination.",
  },
  market: {
    title: "Your weekly essentials, beautifully organised.",
    description: "Shop trusted local markets with live availability, clear pricing and tracked delivery.",
  },
  construction: {
    title: "Serious materials for serious projects.",
    description: "Order verified cement, steel, blocks and tools with site-ready fulfilment.",
  },
  parts: {
    title: "The right part, matched with confidence.",
    description: "Browse trusted auto suppliers, compatibility-ready listings and installation support.",
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
  const [rideId, setRideId] = useState<(typeof rideTypes)[number]["id"]>("standard");

  const selectedRide = rideTypes.find((ride) => ride.id === rideId) ?? rideTypes[0];
  const serviceDetails = services.find((candidate) => candidate.key === service) ?? services[0];
  const copy = serviceCopy[service];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const serviceStats = useMemo(() => {
    const active = orders.filter((order) => order.progress < 100).length;
    const completed = orders.filter((order) => order.progress >= 100).length;
    return { active, completed };
  }, [orders]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="biloo-shine relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#07111f] px-5 py-6 text-white shadow-[0_34px_100px_rgba(7,17,31,0.28)] sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-[#55e6b1]/16 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-[22%] size-96 rounded-full bg-[#ffca68]/12 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:58px_58px] [mask-image:linear-gradient(to_right,black,transparent_72%)]" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                <span className="biloo-pulse size-2 rounded-full bg-[#55e6b1]" />
                Addis super-app
              </span>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3.5 text-xs font-bold text-white/68 transition hover:bg-white/12"
                onClick={onLocate}
                type="button"
              >
                <Icon className="size-4 text-[#ffca68]" name="location" />
                <span className="max-w-[210px] truncate">{locationLabel}</span>
              </button>
            </div>

            <h1 className="mt-6 max-w-4xl text-[2.65rem] font-black leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-[4.6rem]">
              Your city,
              <span className="block bg-gradient-to-r from-[#55e6b1] via-white to-[#ffca68] bg-clip-text text-transparent">
                one beautiful command center.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Food, rides, groceries, building materials and car parts move through one connected BILOO experience.
            </p>

            <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-[1.35rem] border border-white/12 bg-white p-2 pl-4 shadow-[0_22px_70px_rgba(0,0,0,0.26)]">
              <Icon className="size-5 shrink-0 text-slate-400" name="search" />
              <input
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-bold text-slate-900 outline-none placeholder:font-semibold placeholder:text-slate-400"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                placeholder="Search meals, groceries, cement or vehicle parts"
                value={search}
              />
              <span className="hidden rounded-xl bg-[#07111f] px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white sm:block">
                Explore
              </span>
            </label>

            <div className="mt-6 flex flex-wrap gap-5 text-xs font-bold text-white/45">
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#55e6b1]" name="shield" /> Verified providers
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#55e6b1]" name="map" /> Connected tracking
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#55e6b1]" name="wallet" /> One wallet
              </span>
            </div>
          </div>

          <div className="biloo-float rounded-[2rem] border border-white/12 bg-white/9 p-4 shadow-[0_28px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-5">
            <div className="rounded-[1.65rem] bg-white p-5 text-[#101828] shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">BILOO wallet</p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.045em]">ETB 3,840</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">Available across every BILOO service</p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#07111f] text-[#55e6b1] shadow-lg">
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
                    className="rounded-2xl bg-[#f3f6f9] px-2 py-3.5 text-center transition hover:-translate-y-0.5 hover:bg-[#eaf0f5]"
                    key={action.label}
                    type="button"
                  >
                    <Icon className="mx-auto size-4.5 text-[#123b66]" name={action.icon} />
                    <span className="mt-2 block text-[10px] font-black text-slate-500">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-[#07111f]/45 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Live now</p>
                <p className="mt-2 text-2xl font-black">{serviceStats.active}</p>
                <p className="mt-1 text-xs text-white/42">active journeys</p>
              </div>
              <button
                className="flex rounded-[1.35rem] bg-[#55e6b1] p-4 text-left text-[#07111f] transition hover:-translate-y-0.5 hover:bg-[#73efc1]"
                onClick={onOpenCart}
                type="button"
              >
                <span className="flex-1">
                  <span className="block text-[9px] font-black uppercase tracking-[0.16em] opacity-55">Your cart</span>
                  <span className="mt-2 block text-2xl font-black">{cartCount}</span>
                  <span className="mt-1 block text-xs font-bold opacity-55">items ready</span>
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Move through BILOO</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em] text-[#101828]">Choose a service</h2>
          </div>
          <p className="hidden text-xs font-semibold text-slate-400 sm:block">One identity · one wallet · one timeline</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {services.map((item, index) => {
            const active = service === item.key;
            return (
              <button
                className={`group relative min-h-[142px] overflow-hidden rounded-[1.65rem] border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                  active
                    ? "border-[#0a1b31] bg-[#0a1b31] text-white shadow-[0_22px_55px_rgba(7,17,31,0.2)]"
                    : "border-white/90 bg-white/88 text-[#101828] shadow-[0_14px_40px_rgba(24,39,65,0.06)] hover:shadow-[0_24px_60px_rgba(24,39,65,0.1)]"
                }`}
                key={item.key}
                onClick={() => {
                  setService(item.key);
                  setSearch("");
                }}
                type="button"
              >
                <span className={`absolute right-3 top-3 text-[10px] font-black ${active ? "text-white/24" : "text-slate-300"}`}>0{index + 1}</span>
                <span
                  className={`grid size-12 place-items-center rounded-2xl transition ${active ? "bg-white/10 text-[#55e6b1]" : ""}`}
                  style={active ? undefined : { backgroundColor: item.soft, color: item.accent }}
                >
                  <Icon name={item.icon} />
                </span>
                <span className="mt-5 block text-base font-black tracking-[-0.02em]">{item.label}</span>
                <span className={`mt-1.5 block text-xs leading-5 ${active ? "text-white/43" : "text-slate-400"}`}>{item.subtitle}</span>
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
                  <span className="size-2 rounded-full" style={{ backgroundColor: serviceDetails.accent }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: serviceDetails.accent }}>
                    {serviceLabel(service)}
                  </p>
                </div>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{copy.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{copy.description}</p>
              </div>
              <StatusPill tone="success">Available now</StatusPill>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {catalogItems.map((item) => (
                <article
                  className="group relative flex min-h-[276px] flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/70 bg-white p-4.5 shadow-[0_14px_42px_rgba(24,39,65,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_65px_rgba(24,39,65,0.11)]"
                  key={item.id}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-60 blur-2xl" style={{ backgroundColor: serviceDetails.soft }} />
                  <div className="relative flex items-start gap-4">
                    <span className="grid size-[68px] shrink-0 place-items-center rounded-[1.35rem] text-3xl shadow-sm" style={{ backgroundColor: serviceDetails.soft }}>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">{item.merchant}</p>
                        {item.badge ? (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">{item.badge}</span>
                        ) : null}
                      </div>
                      <h3 className="mt-2.5 text-lg font-black leading-6 tracking-[-0.025em] text-[#101828]">{item.name}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                    </div>
                  </div>

                  <div className="relative mt-5 flex flex-wrap items-center gap-2.5 text-[10px] font-black text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-amber-700">
                      <Icon className="size-3" name="star" /> {item.rating}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5">
                      <Icon className="size-3.5" name="clock" /> {item.eta}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1.5">{item.category}</span>
                  </div>

                  <div className="relative mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">From</p>
                      <p className="mt-1 text-xl font-black tracking-[-0.035em] text-[#0a1b31]">{formatETB(item.price)}</p>
                      {typeof item.stock === "number" ? (
                        <p className="mt-1 text-[10px] font-bold text-slate-400">{item.stock} available</p>
                      ) : null}
                    </div>
                    <button
                      aria-label={`Add ${item.name} to cart`}
                      className="grid size-12 place-items-center rounded-2xl bg-[#0a1b31] text-white shadow-[0_12px_28px_rgba(7,17,31,0.18)] transition hover:scale-105 hover:bg-[#123b66]"
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
              <div className="mt-7 rounded-[1.65rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm">
                  <Icon className="size-6" name="search" />
                </span>
                <p className="mt-4 text-sm font-black text-slate-600">No matching results</p>
                <p className="mt-2 text-xs text-slate-400">Try another product, merchant or category.</p>
              </div>
            ) : null}
          </Surface>

          <OrdersPanel onTrackOrder={onTrackOrder} orders={orders} />
        </div>
      )}
    </div>
  );
}
