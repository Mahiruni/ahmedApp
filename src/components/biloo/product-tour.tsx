"use client";

import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "./ui";

const tourStorageKey = "biloo.product-tour.v1";
const tourStartEvent = "biloo:product-tour:start";

type TourStep = {
  eyebrow: string;
  title: string;
  description: string;
  selector?: string;
  tip: string;
};

type TourRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

const tourSteps: TourStep[] = [
  {
    eyebrow: "WELCOME TO BILOO",
    title: "One app for every everyday move.",
    description:
      "This guided tour takes about 60–90 seconds and shows the controls you will use most for rides, delivery, shopping and account activity.",
    tip: "Nothing will be ordered or changed during the tour.",
  },
  {
    eyebrow: "YOUR LOCATION",
    title: "Start every service from the right place.",
    description:
      "BILOO uses your saved place or current location to prepare nearby stores, pickup points, delivery addresses and route estimates.",
    selector: '[data-biloo-customer-home] .biloo-compact-location',
    tip: "Location is requested only when a nearby service or route needs it.",
  },
  {
    eyebrow: "SMART SEARCH",
    title: "Search naturally across the active service.",
    description:
      "Look for a destination, restaurant, grocery item, construction material or vehicle part. The search language changes with the selected service.",
    selector: '[data-biloo-customer-home] .biloo-standard-search',
    tip: "Switch services first when you need a different type of result.",
  },
  {
    eyebrow: "FIVE CONNECTED SERVICES",
    title: "Move, order and shop from one familiar home.",
    description:
      "Choose taxi, food, supermarket, construction materials or car parts. Your account, notifications, activity and support stay connected.",
    selector: '[data-biloo-customer-home] + section',
    tip: "The highlighted service controls the search and content below it.",
  },
  {
    eyebrow: "AT-A-GLANCE ACTIVITY",
    title: "See what needs attention without digging.",
    description:
      "Your wallet, active requests and cart summary remain close to the service area so you can continue an order or review current activity quickly.",
    selector: '[data-biloo-customer-home] + section + section',
    tip: "Open an active order to follow its progress and estimated arrival.",
  },
  {
    eyebrow: "YOUR CART",
    title: "Review everything before checkout.",
    description:
      "The header cart follows you across the customer experience. Check quantities, fees, delivery details and payment method before confirming.",
    selector: '[data-biloo-header] button[aria-label="Open cart"]',
    tip: "BILOO prevents products from unrelated services being mixed accidentally.",
  },
  {
    eyebrow: "QUICK NAVIGATION",
    title: "Move around BILOO without losing your place.",
    description:
      "Use the customer navigation for Home, Explore, Cart and Account. On larger screens it becomes a side rail; on mobile it stays within easy thumb reach.",
    selector: "[data-biloo-role-rail]",
    tip: "Your current section is always visually marked.",
  },
  {
    eyebrow: "YOUR ACCOUNT",
    title: "Keep your identity, preferences and security together.",
    description:
      "Account settings contain your contact details, notification choices, language preferences, privacy controls and secure sign-out action.",
    selector:
      '[data-biloo-role-rail] a[href="/account"], [data-biloo-role-rail] a[href="/auth/login"]',
    tip: "You are ready. Explore BILOO at your own pace.",
  },
];

function targetRect(element: HTMLElement): TourRect {
  const rect = element.getBoundingClientRect();
  const padding = 8;
  const left = Math.max(8, rect.left - padding);
  const top = Math.max(8, rect.top - padding);
  const right = Math.min(window.innerWidth - 8, rect.right + padding);
  const bottom = Math.min(window.innerHeight - 8, rect.bottom + padding);

  return {
    top,
    right,
    bottom,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function cardPosition(rect: TourRect | null): CSSProperties | undefined {
  if (!rect || typeof window === "undefined" || window.innerWidth <= 720) return undefined;

  const cardWidth = Math.min(390, window.innerWidth - 32);
  const estimatedHeight = 330;
  const gap = 18;
  const edge = 16;
  let left = Math.min(
    Math.max(edge, rect.left + rect.width / 2 - cardWidth / 2),
    window.innerWidth - cardWidth - edge,
  );
  let top = rect.bottom + gap;

  if (window.innerHeight - rect.bottom < estimatedHeight + gap) {
    top = rect.top - estimatedHeight - gap;
  }

  if (top < edge) {
    if (window.innerWidth - rect.right >= cardWidth + gap) {
      left = rect.right + gap;
      top = Math.min(
        Math.max(edge, rect.top),
        window.innerHeight - estimatedHeight - edge,
      );
    } else if (rect.left >= cardWidth + gap) {
      left = rect.left - cardWidth - gap;
      top = Math.min(
        Math.max(edge, rect.top),
        window.innerHeight - estimatedHeight - edge,
      );
    } else {
      top = Math.max(edge, window.innerHeight - estimatedHeight - edge);
    }
  }

  return { left, top, width: cardWidth };
}

export function ProductTour() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const step = tourSteps[stepIndex] ?? tourSteps[0];
  const finalStep = stepIndex === tourSteps.length - 1;
  const position = useMemo(() => cardPosition(rect), [rect]);

  function startTour() {
    setStepIndex(0);
    setOpen(true);
  }

  function closeTour(status: "complete" | "skipped") {
    try {
      window.localStorage.setItem(tourStorageKey, status);
    } catch {
      // The tour can still close when storage is unavailable.
    }
    setOpen(false);
    setRect(null);
  }

  useEffect(() => {
    function replayTour() {
      startTour();
    }

    window.addEventListener(tourStartEvent, replayTour);
    return () => window.removeEventListener(tourStartEvent, replayTour);
  }, []);

  useEffect(() => {
    if (pathname !== "/biloo") {
      setOpen(false);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const customerHome = document.querySelector("[data-biloo-customer-home]");
      if (!customerHome && attempts < 12) return;
      window.clearInterval(timer);
      if (!customerHome) return;

      try {
        if (window.localStorage.getItem(tourStorageKey)) return;
      } catch {
        // A blocked storage API should not prevent first-run guidance.
      }

      window.setTimeout(startTour, 650);
    }, 250);

    return () => window.clearInterval(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    let target: HTMLElement | null = null;
    let settleTimer = 0;
    let frame = 0;

    function measure() {
      frame = 0;
      if (!step.selector) {
        setRect(null);
        return;
      }
      target = document.querySelector<HTMLElement>(step.selector);
      setRect(target && target.offsetParent !== null ? targetRect(target) : null);
    }

    function scheduleMeasure() {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    }

    if (step.selector) {
      target = document.querySelector<HTMLElement>(step.selector);
      if (target) {
        const current = target.getBoundingClientRect();
        const outsideViewport =
          current.top < 92 || current.bottom > window.innerHeight - 48;
        if (outsideViewport) {
          target.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
            block: "center",
          });
        }
      }
      settleTimer = window.setTimeout(measure, 360);
    }

    measure();
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      window.clearTimeout(settleTimer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTour("skipped");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (finalStep) closeTour("complete");
        else setStepIndex((current) => Math.min(current + 1, tourSteps.length - 1));
      } else if (event.key === "ArrowLeft" && stepIndex > 0) {
        event.preventDefault();
        setStepIndex((current) => Math.max(0, current - 1));
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [finalStep, open, stepIndex]);

  if (!open || pathname !== "/biloo") return null;

  return (
    <div className="biloo-tour" data-target={Boolean(rect)}>
      {rect ? (
        <>
          <div
            aria-hidden="true"
            className="biloo-tour-shade biloo-tour-shade-top"
            style={{ height: rect.top }}
          />
          <div
            aria-hidden="true"
            className="biloo-tour-shade biloo-tour-shade-left"
            style={{ height: rect.height, top: rect.top, width: rect.left }}
          />
          <div
            aria-hidden="true"
            className="biloo-tour-shade biloo-tour-shade-right"
            style={{
              height: rect.height,
              left: rect.right,
              right: 0,
              top: rect.top,
            }}
          />
          <div
            aria-hidden="true"
            className="biloo-tour-shade biloo-tour-shade-bottom"
            style={{ top: rect.bottom }}
          />
          <div
            aria-hidden="true"
            className="biloo-tour-spotlight"
            style={{
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            }}
          />
        </>
      ) : (
        <div aria-hidden="true" className="biloo-tour-shade biloo-tour-shade-full" />
      )}

      <section
        ref={dialogRef}
        aria-describedby="biloo-tour-description"
        aria-labelledby="biloo-tour-title"
        aria-modal="true"
        className="biloo-tour-card"
        role="dialog"
        style={position}
        tabIndex={-1}
      >
        <div className="biloo-tour-card-top">
          <span className="biloo-tour-brand">
            <i aria-hidden="true">B</i>
            <span>
              <strong>BILOO TOUR</strong>
              <small>One app. Every move.</small>
            </span>
          </span>
          <button
            aria-label="Skip BILOO product tour"
            className="biloo-tour-skip"
            onClick={() => closeTour("skipped")}
            type="button"
          >
            Skip
          </button>
        </div>

        <div className="biloo-tour-copy">
          <span>{step.eyebrow}</span>
          <h2 id="biloo-tour-title">{step.title}</h2>
          <p id="biloo-tour-description">{step.description}</p>
          <aside>
            <Icon name="star" />
            <span>{step.tip}</span>
          </aside>
        </div>

        <div
          aria-label={`Step ${stepIndex + 1} of ${tourSteps.length}`}
          className="biloo-tour-progress"
        >
          {tourSteps.map((tourStep, index) => (
            <i
              data-active={index <= stepIndex}
              key={`${tourStep.eyebrow}-${index}`}
            />
          ))}
        </div>

        <footer className="biloo-tour-actions">
          <span>
            {stepIndex + 1} / {tourSteps.length}
          </span>
          <div>
            {stepIndex > 0 ? (
              <button
                className="biloo-tour-back"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                type="button"
              >
                Back
              </button>
            ) : null}
            <button
              className="biloo-tour-next"
              onClick={() => {
                if (finalStep) closeTour("complete");
                else setStepIndex((current) => current + 1);
              }}
              type="button"
            >
              {finalStep ? "Start exploring" : "Next"}
              <Icon name={finalStep ? "check" : "arrow"} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
