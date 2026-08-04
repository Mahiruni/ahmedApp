"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  searchAddisPlaces,
  type AddisPlace,
} from "@/data/addis-places";

import { Icon } from "./ui";

const ADDIS_CENTER = { lat: 9.03, lng: 38.74 };
const ADDIS_SEARCH_RADIUS_METERS = 140000;
const GOOGLE_MAPS_SCRIPT_ID = "biloo-google-maps-script";

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleText = {
  toString: () => string;
};

type GooglePlace = {
  displayName?: string;
  formattedAddress?: string;
  fetchFields: (request: { fields: string[] }) => Promise<void>;
};

type GooglePlacePrediction = {
  mainText?: GoogleText;
  secondaryText?: GoogleText;
  text?: GoogleText;
  toPlace: () => GooglePlace;
};

type GoogleSuggestion = {
  placePrediction?: GooglePlacePrediction;
};

type PlacesLibrary = {
  AutocompleteSessionToken: new () => unknown;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      sessionToken: unknown;
      locationBias: { center: LatLngLiteral; radius: number };
      origin: LatLngLiteral;
      includedRegionCodes: string[];
      language: string;
      region: string;
    }) => Promise<{ suggestions?: GoogleSuggestion[] }>;
  };
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

type MapsWindow = Window & {
  google?: GoogleMapsNamespace;
  __bilooGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
};

type LocalResult = {
  kind: "local";
  id: string;
  label: string;
  context: string;
  value: string;
};

type GoogleResult = {
  kind: "google";
  id: string;
  label: string;
  context: string;
  value: string;
  prediction: GooglePlacePrediction;
};

type PlaceResult = LocalResult | GoogleResult;

function mapsKey() {
  return process.env.NEXT_PUBLIC_BILOO_MAPS_KEY?.trim() ?? "";
}

function cleanAddress(value: string) {
  return value
    .replace(/,\s*Ethiopia$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function localPlaceValue(place: AddisPlace) {
  const contextStartsWithName = place.context
    .toLowerCase()
    .startsWith(place.name.toLowerCase());
  return cleanAddress(
    contextStartsWithName ? place.context : `${place.name}, ${place.context}`,
  );
}

function loadGoogleMaps(apiKey: string) {
  const mapsWindow = window as unknown as MapsWindow;
  if (mapsWindow.google?.maps?.importLibrary) {
    return Promise.resolve(mapsWindow.google);
  }
  if (mapsWindow.__bilooGoogleMapsPromise) {
    return mapsWindow.__bilooGoogleMapsPromise;
  }

  mapsWindow.__bilooGoogleMapsPromise = new Promise<GoogleMapsNamespace>(
    (resolve, reject) => {
      const finish = () => {
        if (mapsWindow.google?.maps?.importLibrary) resolve(mapsWindow.google);
        else reject(new Error("Google Maps loaded without Places support."));
      };

      const existing = document.getElementById(
        GOOGLE_MAPS_SCRIPT_ID,
      ) as HTMLScriptElement | null;
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        apiKey,
      )}&v=weekly&loading=async&language=en&region=ET`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", finish, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Google Maps failed to load.")),
        { once: true },
      );
      document.head.appendChild(script);
    },
  );

  return mapsWindow.__bilooGoogleMapsPromise;
}

function remoteResult(
  prediction: GooglePlacePrediction,
  index: number,
): GoogleResult | null {
  const fullText = prediction.text?.toString().trim() ?? "";
  const label = prediction.mainText?.toString().trim() || fullText;
  const context = prediction.secondaryText?.toString().trim() || "Addis Ababa and nearby";
  if (!label) return null;

  return {
    kind: "google",
    id: `google-${index}-${label}-${context}`,
    label,
    context,
    value: cleanAddress(fullText || `${label}, ${context}`),
    prediction,
  };
}

export function AddisPlaceSearch({
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
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLibraryRef = useRef<PlacesLibrary | null>(null);
  const sessionTokenRef = useRef<unknown>(null);
  const requestIdRef = useRef(0);
  const [focused, setFocused] = useState(false);
  const [remoteResults, setRemoteResults] = useState<GoogleResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const apiKey = mapsKey();

  const localResults = useMemo<LocalResult[]>(
    () =>
      searchAddisPlaces(value, value.trim() ? 6 : 7).map((place) => ({
        kind: "local",
        id: `local-${place.name}`,
        label: place.name,
        context: place.context,
        value: localPlaceValue(place),
      })),
    [value],
  );

  const results = useMemo<PlaceResult[]>(() => {
    const seen = new Set<string>();
    return [...localResults, ...remoteResults]
      .filter((result) => {
        const key = result.value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 9);
  }, [localResults, remoteResults]);

  const listOpen = focused && results.length > 0;

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;

    void loadGoogleMaps(apiKey)
      .then(async (google) => {
        const library = (await google.maps.importLibrary(
          "places",
        )) as PlacesLibrary;
        if (cancelled) return;
        placesLibraryRef.current = library;
        sessionTokenRef.current = new library.AutocompleteSessionToken();
        setMapsReady(true);
      })
      .catch(() => {
        if (!cancelled) setMapsReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    const query = value.trim();
    const library = placesLibraryRef.current;
    if (!mapsReady || !library || query.length < 2) {
      setRemoteResults([]);
      setLoadingRemote(false);
      return;
    }

    const currentRequest = ++requestIdRef.current;
    const timeout = window.setTimeout(() => {
      setLoadingRemote(true);
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new library.AutocompleteSessionToken();
      }

      void library.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken: sessionTokenRef.current,
        locationBias: {
          center: ADDIS_CENTER,
          radius: ADDIS_SEARCH_RADIUS_METERS,
        },
        origin: ADDIS_CENTER,
        includedRegionCodes: ["et"],
        language: "en",
        region: "et",
      })
        .then(({ suggestions }) => {
          if (currentRequest !== requestIdRef.current) return;
          const next = (suggestions ?? [])
            .map((suggestion, index) =>
              suggestion.placePrediction
                ? remoteResult(suggestion.placePrediction, index)
                : null,
            )
            .filter((result): result is GoogleResult => Boolean(result));
          setRemoteResults(next);
        })
        .catch(() => {
          if (currentRequest === requestIdRef.current) setRemoteResults([]);
        })
        .finally(() => {
          if (currentRequest === requestIdRef.current) setLoadingRemote(false);
        });
    }, 190);

    return () => window.clearTimeout(timeout);
  }, [mapsReady, value]);

  async function chooseResult(result: PlaceResult) {
    let nextValue = result.value;

    if (result.kind === "google") {
      try {
        const place = result.prediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location"],
        });
        nextValue = cleanAddress(
          place.formattedAddress ?? place.displayName ?? result.value,
        );
      } catch {
        nextValue = result.value;
      }

      const library = placesLibraryRef.current;
      sessionTokenRef.current = library
        ? new library.AutocompleteSessionToken()
        : null;
    }

    onChange(nextValue);
    setFocused(false);
    setActiveIndex(-1);
    setRemoteResults([]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!listOpen && event.key === "ArrowDown") {
      setFocused(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowDown") {
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setActiveIndex((current) => Math.max(current - 1, 0));
      event.preventDefault();
    } else if (event.key === "Enter" && activeIndex >= 0) {
      const result = results[activeIndex];
      if (result) void chooseResult(result);
      event.preventDefault();
    } else if (event.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation || locating) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            if (!apiKey) throw new Error("Maps key unavailable");
            const google = await loadGoogleMaps(apiKey);
            const geocoding = (await google.maps.importLibrary(
              "geocoding",
            )) as GeocodingLibrary;
            const geocoder = new geocoding.Geocoder();
            const response = await geocoder.geocode({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            });
            const address = response.results?.[0]?.formatted_address;
            if (address) onChange(cleanAddress(address));
          } catch {
            // Preserve the saved place instead of exposing raw coordinates.
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
    <div
      className={`biloo-place-search relative flex min-h-[64px] items-center gap-3 px-3.5 ${
        listOpen ? "z-40" : "z-10"
      }`}
      ref={rootRef}
    >
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 ${
          tone === "pickup"
            ? "biloo-route-dot-pickup"
            : "biloo-route-dot-destination"
        }`}
      />

      <label className="min-w-0 flex-1 py-2.5">
        <span className="biloo-place-search-label block">{label}</span>
        <span className="relative mt-0.5 block min-h-6">
          <input
            aria-autocomplete="list"
            aria-controls={`${tone}-place-results`}
            aria-expanded={listOpen}
            aria-label={`${label} in Addis Ababa and surrounding areas`}
            autoComplete="off"
            className="biloo-place-search-input"
            enterKeyHint="search"
            onChange={(event) => {
              onChange(event.target.value);
              setFocused(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              tone === "pickup"
                ? "Search pickup place"
                : "Search destination, street or landmark"
            }
            ref={inputRef}
            spellCheck={false}
            type="search"
            value={value}
          />
        </span>
      </label>

      <span className="biloo-place-search-side flex shrink-0 items-center gap-1.5">
        {loadingRemote ? (
          <span
            aria-label="Searching detailed places"
            className="biloo-place-search-spinner"
            role="status"
          />
        ) : value ? (
          <button
            aria-label={`Clear ${label.toLowerCase()}`}
            className="biloo-place-search-clear"
            onClick={() => {
              onChange("");
              setRemoteResults([]);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            type="button"
          >
            <Icon className="size-3.5" name="close" />
          </button>
        ) : null}

        {allowCurrentLocation ? (
          <button
            aria-label="Use current GPS location"
            className="biloo-place-search-gps"
            disabled={locating}
            onClick={useCurrentLocation}
            title="Use my current location"
            type="button"
          >
            <Icon
              className={`size-4 ${locating ? "animate-pulse" : ""}`}
              name="navigation"
            />
          </button>
        ) : null}
      </span>

      {listOpen ? (
        <div
          aria-label={`${label} suggestions`}
          className="biloo-place-results"
          id={`${tone}-place-results`}
          role="listbox"
        >
          <div className="biloo-place-results-head">
            <span>{value.trim() ? "Best matches" : "Popular around Addis"}</span>
            <span>Addis + nearby</span>
          </div>

          <div className="biloo-place-results-list">
            {results.map((result, index) => (
              <button
                aria-selected={index === activeIndex}
                className="biloo-place-result"
                data-active={index === activeIndex}
                key={result.id}
                onClick={() => void chooseResult(result)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                <span className="biloo-place-result-icon">
                  <Icon
                    className="size-4"
                    name={result.kind === "google" ? "location" : "map"}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="biloo-place-result-title">
                    {result.label}
                  </span>
                  <span className="biloo-place-result-context">
                    {result.context}
                  </span>
                </span>
                <Icon className="size-3.5 text-[#a4a6ad]" name="arrow" />
              </button>
            ))}
          </div>

          <div className="biloo-place-results-foot">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#5146e5]" />
              Detailed Addis place search
            </span>
            {mapsReady ? <span>Powered by Google Maps</span> : <span>BILOO local index</span>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
