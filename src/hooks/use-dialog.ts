"use client";

import { useEffect, useRef } from "react";

type DialogEntry = { element: HTMLElement; close: () => void };
const dialogs: DialogEntry[] = [];
const inertElements = new Map<HTMLElement, boolean>();
let previousOverflow = "";

const focusableSelector =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function focusableElements(element: HTMLElement) {
  return Array.from(
    element.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (item) => !item.closest("[inert]") && item.getClientRects().length > 0,
  );
}

function updateBackground() {
  inertElements.forEach((inert, element) => {
    element.inert = inert;
  });
  inertElements.clear();
  let current: HTMLElement | undefined =
    dialogs.at(-1)?.element.parentElement ?? undefined;
  while (current && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    for (const sibling of parent.children) {
      if (
        sibling instanceof HTMLElement &&
        sibling !== current &&
        !["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)
      ) {
        inertElements.set(sibling, sibling.inert);
        sibling.inert = true;
      }
    }
    current = parent;
  }
}

/** Shared stacked-dialog behavior for menus, checkout, drawers and confirmations. */
export function useDialog(
  open: boolean,
  onClose: () => void,
  viewKey?: string,
) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const candidate = ref.current;
    if (!open || !candidate) return;
    const element: HTMLElement = candidate;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const entry: DialogEntry = { element, close: () => closeRef.current() };
    if (!dialogs.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    dialogs.push(entry);
    updateBackground();
    const frame = requestAnimationFrame(() => {
      (focusableElements(element)[0] ?? element).focus({ preventScroll: true });
    });

    function handleKey(event: KeyboardEvent) {
      if (dialogs.at(-1) !== entry) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        entry.close();
      } else if (event.key === "Tab") {
        const items = focusableElements(element);
        const first = items[0];
        const last = items.at(-1);
        if (!first || !last) {
          event.preventDefault();
          element.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !element.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !element.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    function containFocus(event: FocusEvent) {
      if (dialogs.at(-1) === entry && !element.contains(event.target as Node)) {
        (focusableElements(element)[0] ?? element).focus({
          preventScroll: true,
        });
      }
    }
    document.addEventListener("keydown", handleKey, true);
    document.addEventListener("focusin", containFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("focusin", containFocus);
      const wasTop = dialogs.at(-1) === entry;
      const index = dialogs.indexOf(entry);
      if (index >= 0) dialogs.splice(index, 1);
      updateBackground();
      if (!dialogs.length) document.body.style.overflow = previousOverflow;
      if (wasTop && trigger?.isConnected && !trigger.closest("[inert]")) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [open, viewKey]);
  return ref;
}
