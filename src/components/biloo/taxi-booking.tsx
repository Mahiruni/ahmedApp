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
    <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.75fr)_minmax(0,1.25fr)]">
      <Surface className="overflow-hidden p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-[#777777]">BILOO Ride</p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.035em] text-black sm:text-[28px]">
              Where to?
            </h2>
          </div>
          <StatusPill tone="success">Drivers nearby</StatusPill>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[#e4e4e4] bg-white">
          <LocationField
            color="bg-black"
            label="Pickup"
            onChange={(event) => setPickup(event.target.value)}
            value={pickup}
          />
          <LocationField
            color="bg-[#06c167]"
            label="Destination"
            onChange={(event) => setDropoff(event.target.value)}
            value={dropoff}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-black">Choose a ride</p>
          <span className="text-[10px] text-[#777777]">Upfront fare</span>
        </div>

        <div className="mt-2 overflow-hidden rounded-xl border border-[#e4e4e4] bg-white">
          {rideTypes.map((ride, index) => {
            const selected = rideId === ride.id;
            return (
              <button
                aria-pressed={selected}
                className={`flex min-h-[72px] w-full items-center gap-3 px-3.5 text-left transition ${
                  selected ? "bg-[#f3f3f3]" : "bg-white hover:bg-[#f8f8f8]"
                } ${index ? "border-t border-[#eeeeee]" : ""}`}
                key={ride.id}
                onClick={() => setRideId(ride.id)}
                type="button"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-lg ${
                    selected ? "bg-black text-white" : "bg-[#eeeeee] text-black"
                  }`}
                >
                  <Icon className="size-5" name="taxi" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-black">
                    {ride.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#777777]">
                    {ride.description} · {ride.eta}
                  </span>
                </span>
                <span className="text-[13px] font-semibold text-black">
                  {formatETB(ride.fare)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f3f3f3] px-4 py-3">
          <div>
            <p className="text-[10px] text-[#777777]">Estimated fare</p>
            <p className="mt-0.5 text-[18px] font-semibold text-black">
              {formatETB(selectedRide.fare)}
            </p>
          </div>
          <span className="text-[11px] font-medium text-[#545454]">
            {selectedRide.eta} away
          </span>
        </div>

        <button
          className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-[14px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.99]"
          onClick={onBook}
          type="button"
        >
          Confirm {selectedRide.name}
          <Icon className="size-4" name="arrow" />
        </button>
      </Surface>

      <Surface className="relative order-first min-h-[310px] overflow-hidden !border-0 !bg-[#e9ecef] xl:order-none xl:min-h-[560px]">
        <div className="absolute inset-0 bg-[#e9ecef]" />
        <div className="absolute -left-[12%] top-[20%] h-3 w-[80%] rotate-[16deg] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]" />
        <div className="absolute left-[28%] top-[47%] h-3 w-[70%] -rotate-[29deg] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]" />
        <div className="absolute left-[42%] top-[-12%] h-[80%] w-3 rotate-[7deg] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]" />
        <div className="absolute bottom-[2%] left-[10%] h-2 w-[90%] rotate-[-8deg] rounded-full bg-[#d7dadd]" />

        <MapPin className="left-[15%] top-[18%] bg-black text-white" />
        <MapPin className="right-[14%] top-[52%] bg-[#06c167] text-white" />

        <div className="absolute left-[52%] top-[38%] grid size-12 -translate-x-1/2 place-items-center rounded-full border-[3px] border-white bg-black text-white shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
          <Icon className="size-5" name="taxi" />
        </div>

        <button
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
          type="button"
        >
          <Icon className="size-4" name="navigation" />
        </button>

        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white p-3.5 shadow-[0_4px_18px_rgba(0,0,0,0.12)] sm:inset-x-4 sm:bottom-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-black">Fast pickup near Bole</p>
              <p className="mt-0.5 text-[10px] text-[#777777]">
                14 verified drivers online
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-black">3 min</p>
              <p className="mt-0.5 text-[10px] text-[#777777]">pickup</p>
            </div>
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
    <label className="flex min-h-[58px] items-center gap-3 border-b border-[#eeeeee] px-3.5 last:border-b-0 focus-within:bg-[#f8f8f8]">
      <span className={`size-2.5 shrink-0 ${color}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] font-medium text-[#777777]">{label}</span>
        <input
          className="mt-0.5 w-full border-0 bg-transparent p-0 text-[13px] font-medium text-black outline-none focus:shadow-none"
          onChange={onChange}
          value={value}
        />
      </span>
    </label>
  );
}

function MapPin({ className }: { className: string }) {
  return (
    <div
      className={`absolute grid size-10 place-items-center rounded-full border-[3px] border-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] ${className}`}
    >
      <Icon className="size-4" name="location" />
    </div>
  );
}
