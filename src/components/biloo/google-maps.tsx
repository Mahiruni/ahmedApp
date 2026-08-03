"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "./ui";

const ADDIS_CENTER = { lat: 9.03, lng: 38.74 };
const ADDIS_SEARCH_RADIUS_METERS = 90000;
const GOOGLE_MAPS_SCRIPT_ID = "biloo-google-maps-script";

export type RouteMetrics = {
  distanceMeters: number;
  durationMillis: number;
  distanceText: string;
  durationText: string;
};

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type GooglePolyline = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleMap = {
  fitBounds: (bounds: unknown, padding?: number) => void;
  setCenter: (center: LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
};

type GoogleRoute = {
  distanceMeters?: number;
  durationMillis?: number;
  viewport?: unknown;
  createPolylines: (options?: {
    polylineOptions?: {
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    };
  }) => GooglePolyline[];
};

type RouteLibrary = {
  Route: {
    computeRoutes: (request: {
      origin: string;
      destination: string;
      travelMode: "DRIVING";
      routingPreference: "TRAFFIC_AWARE";
      departureTime: Date;
      region: "ET";
      language: "en";
      units: "METRIC";
      fields: string[];
    }) => Promise<{ routes?: GoogleRoute[] }>;
  };
};

type MapsLibrary = {
  Map: new (
    element: HTMLElement,
    options: {
      center: LatLngLiteral;
      zoom: number;
      mapTypeControl: boolean;
      fullscreenControl: boolean;
      streetViewControl: boolean;
      zoomControl: boolean;
      gestureHandling: "greedy";
      clickableIcons: boolean;
      styles: Array<Record<string, unknown>>;
    },
  ) => GoogleMap;
  TrafficLayer: new (options?: { autoRefresh?: boolean }) => {
    setMap: (map: GoogleMap | null) => void;
  };
};

type GooglePlace = {
  displayName?: string;
  formattedAddress?: string;
  fetchFields: (request: { fields: string[] }) => Promise<void>;
};

type PlacePrediction = {
  toPlace: () => GooglePlace;
};

type PlacePredictionSelectEvent = Event & {
  placePrediction?: PlacePrediction;
};

type PlaceAutocompleteElement = HTMLElement & {
  value: string;
  placeholder: string;
  includedRegionCodes: string[];
  locationBias: { center: LatLngLiteral; radius: number };
};

type PlacesLibrary = {
  PlaceAutocompleteElement: new (options?: {
    includedRegionCodes?: string[];
    locationBias?: { center: LatLngLiteral; radius: number };
    placeholder?: string;
  }) => PlaceAutocompleteElement;
};

type GeocodingLibrary = {
  Geocoder: new () => {
    geocode: (request: { location: LatLngLiteral }) => Promise<{
      results?: Array<{ formatted_address?: string }>;
    }>;
  };
};

type GoogleMapsNamespace = {
  maps: {
    importLibrary: (name: string) => Promise<unknown>;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __bilooGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

function mapsKey() {
  return process.env.NEXT_PUBLIC_BILOO_MAPS_KEY?.trim() ?? "";
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function formatDuration(milliseconds: number) {
  const minutes = Math.max(1, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
  if (window.__bilooGoogleMapsPromise) return window.__bilooGoogleMapsPromise;

  window.__bilooGoogleMapsPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const finish = () => {
      if (window.google?.maps?.importLibrary) resolve(window.google);
      else reject(new Error("Google Maps loaded without the expected API."));
    };

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google Maps failed to load.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&language=en&region=ET`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Google Maps failed to load.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return window.__bilooGoogleMapsPromise;
}

export function GooglePlaceField({
  label,
  value,
  onChange,
  tone,
  allowCurrentLocation = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tone: "pickup" | "destination";
  allowCurrentLocation?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<PlaceAutocompleteElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const [locating, setLocating] = useState(false);
  const apiKey = mapsKey();

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!apiKey || !hostRef.current) {
      setStatus("fallback");
      return;
    }

    let cancelled = false;
    let element: PlaceAutocompleteElement | null = null;
    let selectHandler: ((event: Event) => void) | null = null;
    setStatus("loading");

    void loadGoogleMaps(apiKey)
      .then(async (google) => {
        const places = (await google.maps.importLibrary("places")) as PlacesLibrary;
        if (cancelled || !hostRef.current) return;

        element = new places.PlaceAutocompleteElement({
          includedRegionCodes: ["et"],
          locationBias: {
            center: ADDIS_CENTER,
            radius: ADDIS_SEARCH_RADIUS_METERS,
          },
          placeholder:
            tone === "pickup"
              ? "Pickup location in Addis Ababa"
              : "Where are you going?",
        });
        element.className = "biloo-google-place";
        element.value = value;
        element.setAttribute("aria-label", label);

        selectHandler = (event: Event) => {
          const selection = event as PlacePredictionSelectEvent;
          const prediction = selection.placePrediction;
          if (!prediction) return;

          void (async () => {
            const place = prediction.toPlace();
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });
            const nextValue = place.formattedAddress ?? place.displayName;
            if (nextValue) onChangeRef.current(nextValue);
          })();
        };

        element.addEventListener("gmp-select", selectHandler);
        hostRef.current.replaceChildren(element);
        autocompleteRef.current = element;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });

    return () => {
      cancelled = true;
      if (element && selectHandler) element.removeEventListener("gmp-select", selectHandler);
      autocompleteRef.current = null;
    };
  }, [apiKey, label, tone]);

  useEffect(() => {
    if (autocompleteRef.current && autocompleteRef.current.value !== value) {
      autocompleteRef.current.value = value;
    }
  }, [value]);

  async function useCurrentLocation() {
    if (!navigator.geolocation || locating) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            if (!apiKey) throw new Error("Maps key unavailable");
            const google = await loadGoogleMaps(apiKey);
            const geocoding = (await google.maps.importLibrary(
              "geocoding",
            )) as GeocodingLibrary;
            const geocoder = new geocoding.Geocoder();
            const response = await geocoder.geocode({ location });
            const address = response.results?.[0]?.formatted_address;
            onChangeRef.current(
              address ?? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            );
          } catch {
            onChangeRef.current(
              `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            );
          } finally {
            setLocating(false);
          }
        })();
      },
      () => setLocating(false),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
  }

  return (
    <div className="flex min-h-[58px] items-center gap-3 rounded-lg bg-[#f3f3f3] px-3">
      <span
        className={`size-2.5 shrink-0 ${
          tone === "pickup" ? "rounded-sm bg-black" : "rounded-full bg-black"
        }`}
      />
      <div className="min-w-0 flex-1 py-2">
        <span className="block text-[10px] font-medium text-[#6b6b6b]">{label}</span>
        {status === "fallback" ? (
          <input
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-[#8a8a8a]"
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              tone === "pickup" ? "Pickup location" : "Enter destination"
            }
            value={value}
          />
        ) : (
          <div
            aria-busy={status === "loading"}
            className="mt-0.5 min-h-6"
            ref={hostRef}
          >
            {status === "loading" ? (
              <span className="text-sm font-medium text-[#8a8a8a]">
                Loading Google Places…
              </span>
            ) : null}
          </div>
        )}
      </div>
      {allowCurrentLocation ? (
        <button
          aria-label="Use current GPS location"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black shadow-sm transition active:scale-95"
          disabled={locating}
          onClick={useCurrentLocation}
          type="button"
        >
          <Icon
            className={`size-4 ${locating ? "animate-pulse" : ""}`}
            name="navigation"
          />
        </button>
      ) : null}
    </div>
  );
}

export function GoogleRouteMap({
  pickup,
  dropoff,
  onMetricsChange,
}: {
  pickup: string;
  dropoff: string;
  onMetricsChange?: (metrics: RouteMetrics | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const routeLibraryRef = useRef<RouteLibrary | null>(null);
  const polylinesRef = useRef<GooglePolyline[]>([]);
  const metricsChangeRef = useRef(onMetricsChange);
  const [mapReady, setMapReady] = useState(false);
  const [routeState, setRouteState] = useState<
    "idle" | "loading" | "ready" | "unavailable" | "missing-key"
  >("idle");
  const apiKey = mapsKey();

  useEffect(() => {
    metricsChangeRef.current = onMetricsChange;
  }, [onMetricsChange]);

  useEffect(() => {
    if (!apiKey) {
      setRouteState("missing-key");
      return;
    }

    let cancelled = false;

    void loadGoogleMaps(apiKey)
      .then(async (google) => {
        const [mapsLibrary, routeLibrary] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<MapsLibrary>,
          google.maps.importLibrary("routes") as Promise<RouteLibrary>,
        ]);
        if (cancelled || !containerRef.current) return;

        const map = new mapsLibrary.Map(containerRef.current, {
          center: ADDIS_CENTER,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
        const traffic = new mapsLibrary.TrafficLayer({ autoRefresh: true });
        traffic.setMap(map);

        mapRef.current = map;
        routeLibraryRef.current = routeLibrary;
        setMapReady(true);
      })
      .catch(() => {
        if (!cancelled) setRouteState("unavailable");
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
      mapRef.current = null;
      routeLibraryRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !routeLibraryRef.current) return;
    if (!pickup.trim() || !dropoff.trim()) {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
      metricsChangeRef.current?.(null);
      setRouteState("idle");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setRouteState("loading");
      void routeLibraryRef.current?.Route.computeRoutes({
        origin: pickup,
        destination: dropoff,
        travelMode: "DRIVING",
        routingPreference: "TRAFFIC_AWARE",
        departureTime: new Date(),
        region: "ET",
        language: "en",
        units: "METRIC",
        fields: ["path", "viewport", "distanceMeters", "durationMillis"],
      })
        .then(({ routes }) => {
          if (cancelled || !mapRef.current) return;
          const route = routes?.[0];
          if (!route) throw new Error("No route found");

          polylinesRef.current.forEach((polyline) => polyline.setMap(null));
          const polylines = route.createPolylines({
            polylineOptions: {
              strokeColor: "#000000",
              strokeOpacity: 0.92,
              strokeWeight: 5,
            },
          });
          polylines.forEach((polyline) => polyline.setMap(mapRef.current));
          polylinesRef.current = polylines;

          if (route.viewport) mapRef.current.fitBounds(route.viewport, 54);
          const distanceMeters = route.distanceMeters ?? 0;
          const durationMillis = route.durationMillis ?? 0;
          const metrics = {
            distanceMeters,
            durationMillis,
            distanceText: formatDistance(distanceMeters),
            durationText: formatDuration(durationMillis),
          };
          metricsChangeRef.current?.(metrics);
          setRouteState("ready");
        })
        .catch(() => {
          if (cancelled) return;
          metricsChangeRef.current?.(null);
          setRouteState("unavailable");
          mapRef.current?.setCenter(ADDIS_CENTER);
          mapRef.current?.setZoom(12);
        });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [dropoff, mapReady, pickup]);

  return (
    <div className="relative min-h-[480px] overflow-hidden rounded-xl bg-[#e8e8e8] sm:min-h-[560px]">
      <div className="absolute inset-0" ref={containerRef} />

      {routeState === "loading" ? (
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-black shadow-md">
          <span className="size-2 animate-pulse rounded-full bg-black" />
          Finding the fastest route
        </div>
      ) : null}

      {routeState === "idle" ? (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold text-black">Live Addis map</p>
          <p className="mt-1 text-xs leading-5 text-[#6b6b6b]">
            Enter pickup and destination to see traffic-aware distance and ETA.
          </p>
        </div>
      ) : null}

      {routeState === "missing-key" || routeState === "unavailable" ? (
        <div className="absolute inset-0 grid place-items-center bg-[#eeeeee] p-6 text-center">
          <div className="max-w-xs rounded-xl bg-white p-5 shadow-sm">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-black text-white">
              <Icon className="size-5" name="map" />
            </span>
            <p className="mt-4 text-sm font-semibold text-black">
              Google Maps integration is ready
            </p>
            <p className="mt-2 text-xs leading-5 text-[#6b6b6b]">
              Add the restricted production Maps key to enable live Addis traffic,
              place search, routing and ETA.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
