"use client";

import { type ChangeEvent } from "react";

import { rideTypes } from "@/data/biloo";

import { formatETB, Icon, StatusPill, Surface } from "./ui";

export function TaxiBooking({
  pickup,
  dropoff,
  rideId,
  setPickup,
  setDropoff,
  setRideId,
  onBook,
}: {
  pickup: string;
  dropoff: string;
  rideId: (typeof rideTypes)[number]["id"];
  setPickup: (value: string) => void;
  setDropoff: (value: string) => void;
  setRideId: (value: (typeof rideTypes)[number]["id"]) => void;
  onBook: () => void;
}) {
  const selectedRide = rideTypes.find((ride) => ride.id === rideId) ?? rideTypes[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Surface className="overflow-hidden p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="biloo-pulse size-2 rounded-full bg-[#55e6b1]" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">BILOO mobility</p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.05em] text-[#101828] sm:text-4xl">Where should we take you?</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Upfront pricing, verified drivers and a connected trip timeline from pickup to destination.</p>
          </div>
          <span className="hidden size-12 place-items-center rounded-2xl bg-[#0a1b31] text-[#55e6b1] sm:grid">
            <Icon name="taxi" />
          </span>
        </div>

        <div className="relative mt-7 space-y-3 before:absolute before:left-[21px] before:top-10 before:h-[58px] before:border-l before:border-dashed before:border-slate-300">
          <LocationField
            color="bg-[#55e6b1]"
            label="Pickup"
            onChange={(event) => setPickup(event.target.value)}
            value={pickup}
          />
          <LocationField
            color="bg-rose-500"
            label="Destination"
            onChange={(event) => setDropoff(event.target.value)}
            value={dropoff}
          />
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black text-[#101828]">Choose your ride</p>
            <span className="text-[10px] font-bold text-slate-400">Live estimate</span>
          </div>
          <div className="mt-3 space-y-3">
            {rideTypes.map((ride) => {
              const selected = rideId === ride.id;
              return (
                <button
                  className={`group flex w-full items-center gap-4 rounded-[1.35rem] border p-4 text-left transition duration-300 ${
                    selected
                      ? "border-[#0a1b31] bg-[#0a1b31] text-white shadow-[0_18px_45px_rgba(7,17,31,0.18)]"
                      : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  }`}
                  key={ride.id}
                  onClick={() => setRideId(ride.id)}
                  type="button"
                >
                  <span className={`grid size-12 place-items-center rounded-2xl ${selected ? "bg-white/10 text-[#55e6b1]" : "bg-amber-50 text-amber-700"}`}>
                    <Icon name="taxi" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{ride.name}</span>
                    <span className={`mt-1 block text-xs ${selected ? "text-white/45" : "text-slate-500"}`}>{ride.description} · {ride.eta}</span>
                  </span>
                  <span className="text-sm font-black">{formatETB(ride.fare)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 rounded-[1.35rem] bg-[#f0f4f8] p-4">
          <div className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Estimated fare</span>
              <span className="mt-1.5 block text-2xl font-black tracking-[-0.04em] text-[#0a1b31]">{formatETB(selectedRide.fare)}</span>
            </span>
            <StatusPill tone="success">{selectedRide.eta} away</StatusPill>
          </div>
        </div>

        <button
          className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-r from-[#0a1b31] to-[#123b66] px-5 text-sm font-black text-white shadow-[0_18px_42px_rgba(7,17,31,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(7,17,31,0.28)]"
          onClick={onBook}
          type="button"
        >
          <Icon name="navigation" />
          Confirm {selectedRide.name}
        </button>
      </Surface>

      <Surface className="relative min-h-[580px] overflow-hidden !bg-[#dfe8ef]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(85,230,177,.34),transparent_18rem),radial-gradient(circle_at_20%_80%,rgba(255,202,104,.3),transparent_19rem)]" />
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(10,27,49,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(10,27,49,.12)_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="absolute left-[12%] top-[24%] h-2.5 w-[55%] rotate-[17deg] rounded-full bg-white/80 shadow-[0_0_0_5px_rgba(10,27,49,.08)]" />
        <div className="absolute left-[44%] top-[43%] h-2.5 w-[40%] -rotate-[31deg] rounded-full bg-white/80 shadow-[0_0_0_5px_rgba(10,27,49,.08)]" />

        <MapPin className="left-[14%] top-[20%] bg-[#55e6b1] text-[#07111f]" />
        <MapPin className="right-[12%] top-[53%] bg-rose-500 text-white" />

        <div className="biloo-float absolute left-[52%] top-[37%] grid size-16 place-items-center rounded-[1.35rem] border-4 border-white bg-[#07111f] text-[#ffca68] shadow-[0_18px_45px_rgba(7,17,31,.25)]">
          <Icon className="size-7" name="taxi" />
        </div>

        <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#0a1b31] shadow-lg backdrop-blur-xl sm:left-6 sm:top-6">
          Addis live map
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[1.7rem] border border-white/80 bg-white/88 p-5 shadow-[0_28px_75px_rgba(24,39,65,0.16)] backdrop-blur-2xl sm:inset-x-6 sm:bottom-6 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusPill tone="success">14 drivers nearby</StatusPill>
              <h3 className="mt-3 text-xl font-black tracking-[-0.035em] text-[#101828]">Fast pickup around Bole</h3>
              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">The estimate includes the current route and booking fee. Your connected timeline starts the moment you confirm.</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0a1b31] text-[#55e6b1]">
              <Icon name="map" />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["3 min", "Pickup"],
              ["4.93", "Driver rating"],
              ["24/7", "Support"],
            ].map(([value, label]) => (
              <div className="rounded-xl bg-slate-50 p-3" key={label}>
                <p className="text-sm font-black text-[#101828]">{value}</p>
                <p className="mt-1 text-[9px] font-bold text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Surface>
    </div>
  );
}

function LocationField({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  color: string;
}) {
  return (
    <label className="relative flex items-center gap-3 rounded-[1.3rem] border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-[#123b66]/35 focus-within:shadow-md">
      <span className={`relative z-10 size-3 shrink-0 rounded-full ring-4 ring-white ${color}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <input
          className="mt-1.5 w-full bg-transparent text-sm font-black text-slate-800 outline-none"
          onChange={onChange}
          value={value}
        />
      </span>
    </label>
  );
}

function MapPin({ className }: { className: string }) {
  return (
    <div className={`absolute grid size-12 place-items-center rounded-full border-4 border-white shadow-xl ${className}`}>
      <Icon className="size-5" name="location" />
    </div>
  );
}
