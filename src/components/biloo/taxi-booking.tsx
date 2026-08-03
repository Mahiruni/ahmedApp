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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      <Surface className="overflow-hidden p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="biloo-tone-mobility inline-flex min-h-6 items-center rounded-full px-2.5 text-[10px] font-semibold">
                Live mobility
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#777b84]">
                <span className="size-1.5 rounded-full bg-[#11884f]" />
                Traffic aware
              </span>
            </div>
            <h2 className="biloo-display mt-3 text-[1.75rem] font-semibold leading-[1.06] tracking-[-0.045em] text-[#0b0b0d] sm:text-[2rem]">
              Where to?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#6d7078]">
              Search Addis Ababa and surrounding areas with live routes, distance and ETA.
            </p>
          </div>
          <span className="biloo-tone-mobility grid size-11 shrink-0 place-items-center rounded-full">
            <Icon className="size-5" name="navigation" />
          </span>
        </div>

        <div className="relative mt-5 space-y-2.5 before:absolute before:left-[18px] before:top-[56px] before:h-[20px] before:border-l before:border-dashed before:border-[#c9cbd0]">
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

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0b0b0d]">Choose your ride</p>
            <p className="mt-1 text-[11px] text-[#858891]">Upfront estimated pricing</p>
          </div>
          <span className="rounded-full bg-[#f1f2f3] px-2.5 py-1.5 text-[10px] font-semibold text-[#5f636b]">
            {routeMetrics
              ? `${routeMetrics.distanceText} · ${routeMetrics.durationText}`
              : "Waiting for route"}
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-[14px] border border-[#e6e6e3] bg-white">
          {rideTypes.map((ride, index) => {
            const selected = rideId === ride.id;
            return (
              <button
                aria-pressed={selected}
                className={`group flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition ${
                  index ? "border-t border-[#eeeeeb]" : ""
                } ${selected ? "bg-[#f5f8ff]" : "hover:bg-[#fafafa]"}`}
                key={ride.id}
                onClick={() => setRideId(ride.id)}
                type="button"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${
                    selected
                      ? "bg-[#276ef1] text-white shadow-[0_8px_20px_rgba(39,110,241,0.22)]"
                      : "bg-[#f0f1f2] text-[#25262a] group-hover:bg-[#e9eaec]"
                  }`}
                >
                  <Icon className="size-5" name="taxi" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="block text-sm font-semibold text-[#0b0b0d]">
                      {ride.name}
                    </span>
                    {selected ? (
                      <span className="size-1.5 rounded-full bg-[#276ef1]" />
                    ) : null}
                  </span>
                  <span className="mt-1 block truncate text-[11px] leading-4 text-[#747880]">
                    {ride.description} · {ride.eta}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold text-[#0b0b0d]">
                    {formatETB(ride.fare)}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#91949b]">estimate</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[14px] border border-[#e6e6e3] bg-[#fafaf9] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium text-[#747880]">Estimated fare</p>
              <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.035em] text-[#0b0b0d]">
                {formatETB(selectedRide.fare)}
              </p>
            </div>
            <div className="text-right">
              <StatusPill tone="success">
                {routeMetrics?.durationText ?? `${selectedRide.eta} away`}
              </StatusPill>
              <p className="mt-1.5 text-[10px] text-[#777b84]">
                {routeMetrics
                  ? `${routeMetrics.distanceText} · live traffic`
                  : "Updates after route search"}
              </p>
            </div>
          </div>
        </div>

        <button
          className="biloo-primary-button mt-3 flex w-full items-center justify-center gap-2 px-5"
          onClick={onBook}
          type="button"
        >
          <Icon className="size-4" name="navigation" />
          Confirm {selectedRide.name}
        </button>
        <p className="mt-3 text-center text-[10px] leading-4 text-[#858891]">
          Route, traffic and ETA are provided by Google Maps. Final fare can change if the route changes.
        </p>
      </Surface>

      <div className="biloo-map-card p-2 sm:p-3">
        <GoogleRouteMap
          dropoff={dropoff}
          onMetricsChange={setRouteMetrics}
          pickup={pickup}
        />
      </div>
    </div>
  );
}
