"use client";

import { useEffect } from "react";

const standardSearchInput = ".biloo-standard-search-input";

function searchInputFrom(target: EventTarget | null) {
  return target instanceof HTMLInputElement && target.matches(standardSearchInput)
    ? target
    : null;
}

function setFocusedState(input: HTMLInputElement, focused: boolean) {
  const container = input.closest<HTMLElement>(".biloo-search-premium");
  if (!container) return;

  if (focused) {
    container.dataset.searchActive = "true";
    if (input.dataset.idlePlaceholder === undefined) {
      input.dataset.idlePlaceholder = input.placeholder;
    }
    input.placeholder = input.getAttribute("aria-label")?.trim() || "Search";
    return;
  }

  delete container.dataset.searchActive;
  if (!input.value) {
    input.placeholder = input.dataset.idlePlaceholder ?? "";
  }
}

export function SearchFocusController() {
  useEffect(() => {
    function handleFocusIn(event: FocusEvent) {
      const input = searchInputFrom(event.target);
      if (input) setFocusedState(input, true);
    }

    function handleFocusOut(event: FocusEvent) {
      const input = searchInputFrom(event.target);
      if (!input) return;

      window.requestAnimationFrame(() => {
        const container = input.closest<HTMLElement>(".biloo-search-premium");
        if (container?.contains(document.activeElement)) return;
        setFocusedState(input, false);
      });
    }

    function handleInput(event: Event) {
      const input = searchInputFrom(event.target);
      if (!input) return;
      const container = input.closest<HTMLElement>(".biloo-search-premium");
      if (container && document.activeElement === input) {
        container.dataset.searchActive = "true";
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("input", handleInput);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("input", handleInput);
    };
  }, []);

  return null;
}
