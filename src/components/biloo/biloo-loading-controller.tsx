"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BilooLoadingVisual } from "./biloo-loading-visual";

const routeDelayMs = 90;
const routeSafetyMs = 12000;
const manualProcessMs = 1000;

type ActiveRequest = {
  id: number;
  label: string;
};

function isVisible(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function readableBusyLabel(element: Element) {
  const explicit = element.getAttribute("data-biloo-loading-label")?.trim();
  if (explicit) return explicit;

  const ariaLabel = element.getAttribute("aria-label")?.trim();
  if (ariaLabel && ariaLabel.length <= 80) return ariaLabel;

  const text = element.textContent?.replace(/\s+/g, " ").trim();
  return text && text.length <= 80 ? text : "Processing with BILOO…";
}

function requestLabel(input: RequestInfo | URL, init?: RequestInit) {
  const method = (
    init?.method ?? (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const rawUrl =
    input instanceof Request
      ? input.url
      : typeof input === "string"
        ? input
        : input.toString();
  const url = new URL(rawUrl, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/biloo/")) {
    return null;
  }

  if (url.pathname.includes("/orders")) {
    try {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
      return body?.service === "taxi"
        ? "Matching your BILOO ride…"
        : "Placing your secure order…";
    } catch {
      return "Processing your BILOO request…";
    }
  }

  if (url.pathname.includes("/notifications")) return "Syncing your BILOO updates…";
  return "Processing with BILOO…";
}

export function BilooLoadingController() {
  const pathname = usePathname();
  const [routeVisible, setRouteVisible] = useState(false);
  const [manualLabel, setManualLabel] = useState<string | null>(null);
  const [networkLabel, setNetworkLabel] = useState<string | null>(null);
  const [observedLabel, setObservedLabel] = useState<string | null>(null);
  const routeDelayRef = useRef<number | null>(null);
  const routeSafetyRef = useRef<number | null>(null);
  const manualTimerRef = useRef<number | null>(null);
  const requestSequenceRef = useRef(0);
  const activeRequestsRef = useRef<ActiveRequest[]>([]);

  const processLabel = useMemo(
    () => networkLabel ?? observedLabel ?? manualLabel,
    [manualLabel, networkLabel, observedLabel],
  );

  function clearRouteTimers() {
    if (routeDelayRef.current) window.clearTimeout(routeDelayRef.current);
    if (routeSafetyRef.current) window.clearTimeout(routeSafetyRef.current);
    routeDelayRef.current = null;
    routeSafetyRef.current = null;
  }

  function beginRoute() {
    clearRouteTimers();
    routeDelayRef.current = window.setTimeout(() => setRouteVisible(true), routeDelayMs);
    routeSafetyRef.current = window.setTimeout(() => {
      setRouteVisible(false);
      clearRouteTimers();
    }, routeSafetyMs);
  }

  function showManualProcess(label: string) {
    if (manualTimerRef.current) window.clearTimeout(manualTimerRef.current);
    setManualLabel(label);
    manualTimerRef.current = window.setTimeout(() => {
      setManualLabel(null);
      manualTimerRef.current = null;
    }, manualProcessMs);
  }

  useEffect(() => {
    setRouteVisible(false);
    clearRouteTimers();
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        const rawHref = anchor.getAttribute("href");
        if (
          !rawHref ||
          rawHref.startsWith("#") ||
          rawHref.startsWith("mailto:") ||
          rawHref.startsWith("tel:") ||
          anchor.target === "_blank" ||
          anchor.hasAttribute("download")
        ) {
          return;
        }

        const destination = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        const sameDocument =
          destination.pathname === current.pathname &&
          destination.search === current.search;

        if (destination.origin === current.origin && !sameDocument) beginRoute();
        return;
      }

      const payment = target?.closest(".biloo-payment-submit");
      if (payment && !payment.hasAttribute("disabled")) {
        showManualProcess("Securing your BILOO order…");
        return;
      }

      const taxi = target?.closest("#biloo-taxi-booking .biloo-primary-button");
      if (taxi && !taxi.hasAttribute("disabled")) {
        showManualProcess("Matching your BILOO ride…");
      }
    }

    function handlePopState() {
      beginRoute();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let scanFrame = 0;

    function scanBusyElements() {
      scanFrame = 0;
      const busy = Array.from(
        document.querySelectorAll('[aria-busy="true"], [data-biloo-loading="true"]'),
      ).find(isVisible);
      setObservedLabel(busy ? readableBusyLabel(busy) : null);
    }

    function scheduleScan() {
      if (scanFrame) return;
      scanFrame = window.requestAnimationFrame(scanBusyElements);
    }

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["aria-busy", "data-biloo-loading", "data-biloo-loading-label"],
      childList: true,
      subtree: true,
    });
    scheduleScan();

    return () => {
      observer.disconnect();
      if (scanFrame) window.cancelAnimationFrame(scanFrame);
    };
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch;

    const wrappedFetch: typeof window.fetch = async (input, init) => {
      const label = requestLabel(input, init);
      if (!label) return originalFetch(input, init);

      const id = ++requestSequenceRef.current;
      activeRequestsRef.current = [...activeRequestsRef.current, { id, label }];
      setNetworkLabel(label);

      try {
        return await originalFetch(input, init);
      } finally {
        window.setTimeout(() => {
          activeRequestsRef.current = activeRequestsRef.current.filter(
            (request) => request.id !== id,
          );
          setNetworkLabel(activeRequestsRef.current.at(-1)?.label ?? null);
        }, 240);
      }
    };

    window.fetch = wrappedFetch;
    return () => {
      if (window.fetch === wrappedFetch) window.fetch = originalFetch;
    };
  }, []);

  useEffect(
    () => () => {
      clearRouteTimers();
      if (manualTimerRef.current) window.clearTimeout(manualTimerRef.current);
    },
    [],
  );

  return (
    <>
      {routeVisible ? (
        <div className="biloo-route-loader" role="status" aria-live="polite">
          <span aria-hidden="true" className="biloo-route-loader-progress" />
          <BilooLoadingVisual />
        </div>
      ) : null}

      {!routeVisible && processLabel ? (
        <div className="biloo-process-loader" role="status" aria-live="polite">
          <BilooLoadingVisual
            compact
            detail="Please keep this screen open"
            label={processLabel}
          />
        </div>
      ) : null}
    </>
  );
}
