"use client";

import { useState } from "react";

import { rideTypes } from "@/data/biloo";

import {
  GooglePlaceField,
  GoogleRouteMap,
  type RouteMetrics,
} from "./google-maps";
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
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
      <Surface className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#6b6b6b]">BILOO Ride</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-black">
              Request a ride
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b6b6b]">
              Live Google traffic, verified drivers and upfront BILOO pricing.
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white">
            <Icon className="size-4.5" name="taxi" />
          </span>
        </div>

        <div className="mt-5 space-y-2">
          <GooglePlaceField
            allowCurrentLocation
            label="Pickup"
            onChange={setPickup}
            tone="pickup"
            value={pickup}
          />
          <GooglePlaceField
            label="Destination"
            onChange={setDropoff}
            tone="destination"
            value={dropoff}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black">Choose a ride</p>
          <span className="text-xs text-[#6b6b6b]">
            {routeMetrics
              ? `${routeMetrics.distanceText} · ${routeMetrics.durationText}`
              : "Live estimate"}
          </span>
        </div>

        <div className="mt-2 divide-y divide-black/8 border-y border-black/8">
          {rideTypes.map((ride) => {
            const selected = rideId === ride.id;
            return (
              <button
                className={`flex w-full items-center gap-3 px-1 py-3 text-left transition ${
                  selected ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
                }`}
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
                  <span className="block text-sm font-semibold text-black">{ride.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#6b6b6b]">
                    {ride.description} · {ride.eta}
                  </span>
                </span>
                <span className="text-sm font-semibold text-black">
                  {formatETB(ride.fare)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-[#f3f3f3] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#6b6b6b]">Estimated fare</p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-black">
                {formatETB(selectedRide.fare)}
              </p>
            </div>
            <div className="text-right">
              <StatusPill tone="success">
                {routeMetrics?.durationText ?? `${selectedRide.eta} away`}
              </StatusPill>
              {routeMetrics ? (
                <p className="mt-1.5 text-xs text-[#6b6b6b]">
                  {routeMetrics.distanceText} with live traffic
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
          onClick={onBook}
          type="button"
        >
          <Icon className="size-4" name="navigation" />
          Confirm {selectedRide.name}
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-[#777777]">
          Route, traffic and ETA are provided by Google Maps. Final fare may change
          if the destination or route changes.
        </p>
      </Surface>

      <Surface className="overflow-hidden p-2 sm:p-3">
        <GoogleRouteMap
          dropoff={dropoff}
          onMetricsChange={setRouteMetrics}
          pickup={pickup}
        />
      </Surface>
    </div>
  );
}
