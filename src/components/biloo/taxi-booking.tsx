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
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <Surface className="p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
          Book a ride
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
          Where are you going?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Upfront fare estimate, verified driver and live route tracking.
        </p>

        <div className="mt-6 space-y-3">
          <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" /> Pickup
            </span>
            <input
              className="mt-2 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPickup(event.target.value)}
              value={pickup}
            />
          </label>
          <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-rose-700">
              <span className="size-2 rounded-full bg-rose-500" /> Drop-off
            </span>
            <input
              className="mt-2 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setDropoff(event.target.value)}
              value={dropoff}
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {rideTypes.map((ride) => {
            const selected = rideId === ride.id;
            return (
              <button
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#082640] bg-[#f2f7fb]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                key={ride.id}
                onClick={() => setRideId(ride.id)}
                type="button"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-[#fff8e6] text-amber-700">
                  <Icon name="taxi" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">{ride.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {ride.description} · {ride.eta}
                  </span>
                </span>
                <span className="text-sm font-black">
                  {formatETB(ride.fare)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#082640] px-5 text-sm font-black text-white shadow-[0_14px_34px_rgba(8,38,64,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0d365b]"
          onClick={onBook}
          type="button"
        >
          <Icon name="navigation" />
          Confirm ride
        </button>
      </Surface>

      <Surface className="relative min-h-[560px] overflow-hidden bg-[#eaf0f4]">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-[15%] top-[22%] h-2 w-[52%] rotate-[18deg] rounded-full bg-[#082640]/20" />
        <div className="absolute left-[44%] top-[42%] h-2 w-[38%] -rotate-[32deg] rounded-full bg-[#082640]/20" />
        <div className="absolute left-[17%] top-[20%] grid size-12 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-xl">
          <Icon className="size-5" name="location" />
        </div>
        <div className="absolute right-[14%] top-[52%] grid size-12 place-items-center rounded-full border-4 border-white bg-rose-500 text-white shadow-xl">
          <Icon className="size-5" name="location" />
        </div>
        <div className="absolute left-[53%] top-[37%] grid size-14 place-items-center rounded-full border-4 border-white bg-[#082640] text-[#f2bd4b] shadow-2xl">
          <Icon className="size-6" name="taxi" />
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[1.45rem] border border-white/70 bg-white/92 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusPill tone="success">Drivers nearby</StatusPill>
              <h3 className="mt-3 text-xl font-black tracking-[-0.03em]">
                3-minute pickup around Bole
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Estimated fare includes the current route and standard booking
                fee. Final fare may change if the destination changes.
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f2f7fb] text-[#082640]">
              <Icon name="map" />
            </span>
          </div>
        </div>
      </Surface>
    </div>
  );
}
