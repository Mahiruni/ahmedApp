"use client";

import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  rideTypes,
  services,
  type ActiveOrder,
  type CartLine,
  type CatalogItem,
  type IconName,
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

type HeroService = {
  key: ServiceKey;
  label: string;
  detail: string;
  icon: IconName;
};

type CustomerGoogleMaps = {
  maps: {
    importLibrary: (name: string) => Promise<unknown>;
  };
};

type CustomerGeocodingLibrary = {
  Geocoder: new () => {
    geocode: (request: {
      location: { lat: number; lng: number };
    }) => Promise<{
      results?: Array<{ formatted_address?: string }>;
    }>;
  };
};

const heroServices: HeroService[] = [
  {
    key: "taxi",
    label: "Taxi booking",
    detail: "Fast rides with live driver tracking",
    icon: "taxi",
  },
  {
    key: "food",
    label: "Food delivery",
    detail: "Local meals delivered while they are fresh",
    icon: "food",
  },
  {
    key: "market",
    label: "Supermarket delivery",
    detail: "Groceries and essentials at your door",
    icon: "market",
  },
  {
    key: "construction",
    label: "Construction materials",
    detail: "Verified supplies for every project",
    icon: "construction",
  },
  {
    key: "parts",
    label: "Car parts",
    detail: "Trusted parts matched to your vehicle",
    icon: "parts",
  },
];

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

const customerMapsScriptId = "biloo-google-maps-script";

function cleanLocationLabel(value: string) {
  return value
    .replace(/^(Home|Current location)\s*·\s*/i, "")
    .replace(/,\s*Ethiopia$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function coordinatePair(value: string) {
  const match = cleanLocationLabel(value).match(
    /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
  );
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function initialNamedLocation(value: string) {
  if (coordinatePair(value)) return "Bole, Addis Ababa";
  return cleanLocationLabel(value) || "Bole, Addis Ababa";
}

function loadCustomerGoogleMaps(apiKey: string) {
  const mapsWindow = window as unknown as Window & {
    google?: CustomerGoogleMaps;
    __bilooGoogleMapsPromise?: Promise<CustomerGoogleMaps>;
  };

  if (mapsWindow.google?.maps?.importLibrary) {
    return Promise.resolve(mapsWindow.google);
  }
  if (mapsWindow.__bilooGoogleMapsPromise) {
    return mapsWindow.__bilooGoogleMapsPromise;
  }

  mapsWindow.__bilooGoogleMapsPromise = new Promise<CustomerGoogleMaps>(
    (resolve, reject) => {
      const finish = () => {
        if (mapsWindow.google?.maps?.importLibrary) resolve(mapsWindow.google);
        else reject(new Error("Google Maps loaded without geocoding."));
      };

      const existing = document.getElementById(
        customerMapsScriptId,
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
      script.id = customerMapsScriptId;
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

async function resolvePlaceName(lat: number, lng: number) {
  const apiKey = process.env.NEXT_PUBLIC_BILOO_MAPS_KEY?.trim();
  if (!apiKey) return null;

  const google = await loadCustomerGoogleMaps(apiKey);
  const geocoding = (await google.maps.importLibrary(
    "geocoding",
  )) as CustomerGeocodingLibrary;
  const geocoder = new geocoding.Geocoder();
  const response = await geocoder.geocode({ location: { lat, lng } });
  const address = response.results?.[0]?.formatted_address;
  return address ? cleanLocationLabel(address) : null;
}

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
  const [heroServiceIndex, setHeroServiceIndex] = useState(0);
  const [exactLocationLabel, setExactLocationLabel] = useState(() =>
    initialNamedLocation(locationLabel),
  );
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const lastNamedLocationRef = useRef(initialNamedLocation(locationLabel));

  const selectedRide =
    rideTypes.find((ride) => ride.id === rideId) ?? rideTypes[0];
  const copy = serviceCopy[service];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const animatedService = heroServices[heroServiceIndex] ?? heroServices[0];

  const serviceStats = useMemo(() => {
    const active = orders.filter((order) => order.progress < 100).length;
    const completed = orders.filter((order) => order.progress >= 100).length;
    return { active, completed };
  }, [orders]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotion.matches) return;

    const interval = window.setInterval(() => {
      setHeroServiceIndex(
        (current) => (current + 1) % heroServices.length,
      );
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const coordinates = coordinatePair(locationLabel);
    const cleaned = cleanLocationLabel(locationLabel);
    const locating = /locating|finding/i.test(cleaned);

    if (!coordinates) {
      setResolvingLocation(locating);
      if (locating) {
        setExactLocationLabel("Finding your exact place…");
      } else if (cleaned) {
        lastNamedLocationRef.current = cleaned;
        setExactLocationLabel(cleaned);
      }
      return;
    }

    let cancelled = false;
    setResolvingLocation(true);
    setExactLocationLabel("Finding your exact place…");

    void resolvePlaceName(coordinates.lat, coordinates.lng)
      .then((placeName) => {
        if (cancelled) return;
        const nextLocation =
          placeName || lastNamedLocationRef.current || "Bole, Addis Ababa";
        lastNamedLocationRef.current = nextLocation;
        setExactLocationLabel(nextLocation);

        if (placeName) {
          try {
            window.localStorage.setItem(
              "biloo.customer-location",
              JSON.stringify(placeName),
            );
          } catch {
            // The exact name remains visible even when storage is unavailable.
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExactLocationLabel(
            lastNamedLocationRef.current || "Bole, Addis Ababa",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setResolvingLocation(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locationLabel]);

  function openTaxiSearch() {
    const target = document.getElementById("biloo-taxi-booking");
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openAnimatedService() {
    setService(animatedService.key);
    setSearch("");
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="pt-1" data-biloo-customer-home>
        <button
          aria-busy={resolvingLocation}
          aria-label={`Use current location. ${exactLocationLabel}`}
          className="biloo-compact-location inline-flex items-center gap-1.5"
          onClick={onLocate}
          title={exactLocationLabel}
          type="button"
        >
          <span className="biloo-compact-location-icon">
            <Icon className="size-3" name="location" />
          </span>
          <span className="biloo-compact-location-copy">
            {exactLocationLabel}
          </span>
          <span
            aria-hidden="true"
            className={`biloo-compact-location-status ${
              resolvingLocation ? "animate-pulse" : ""
            }`}
          />
        </button>

        <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-black sm:text-[40px]">
          What do you need?
        </h1>

        <button
          aria-label={`Open ${animatedService.label}`}
          className="biloo-service-loop mt-3"
          onClick={openAnimatedService}
          type="button"
        >
          <span className="biloo-service-loop-icon" aria-hidden="true">
            <Icon className="size-5" name={animatedService.icon} />
          </span>
          <span
            className="biloo-service-loop-copy"
            key={animatedService.key}
          >
            <span className="biloo-service-loop-label">
              {animatedService.label}
            </span>
            <span className="biloo-service-loop-detail">
              {animatedService.detail}
            </span>
          </span>
          <span className="biloo-service-loop-dots" aria-hidden="true">
            {heroServices.map((item, index) => (
              <span
                className="biloo-service-loop-dot"
                data-active={index === heroServiceIndex}
                key={item.key}
              />
            ))}
          </span>
        </button>
        <span className="sr-only">
          BILOO services include taxi booking, food delivery, supermarket
          delivery, construction materials and car parts.
        </span>

        {service === "taxi" ? (
          <button
            className="biloo-standard-search mt-4 flex h-[52px] w-full items-center gap-3 px-3.5 text-left"
            onClick={openTaxiSearch}
            type="button"
          >
            <Icon className="size-5 shrink-0 text-[#5f636b]" name="search" />
            <span className="min-w-0 flex-1 truncate text-[16px] font-medium text-[#656971]">
              Where to?
            </span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[#276ef1]">
              <Icon className="size-4" name="arrow" />
            </span>
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-2.5">
            <div className="biloo-standard-search flex h-[52px] min-w-0 flex-1 items-center gap-3 px-3.5">
              <Icon
                className="biloo-search-icon size-5 shrink-0 text-[#6d7078]"
                name="search"
              />
              <input
                aria-label={searchPlaceholders[service]}
                autoComplete="off"
                className="biloo-standard-search-input min-w-0 flex-1"
                enterKeyHint="search"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearch(event.target.value)
                }
                placeholder={searchPlaceholders[service]}
                spellCheck={false}
                type="search"
                value={search}
              />
              {search ? (
                <button
                  aria-label="Clear search"
                  className="biloo-search-clear grid size-8 shrink-0 place-items-center rounded-full text-[#5f636b]"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <Icon className="size-4" name="close" />
                </button>
              ) : null}
            </div>
            <button
              aria-label="Use current location"
              className="biloo-search-location grid size-[52px] shrink-0 place-items-center rounded-[14px]"
              onClick={onLocate}
              type="button"
            >
              <Icon className="size-5" name="navigation" />
            </button>
          </div>
        )}
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
