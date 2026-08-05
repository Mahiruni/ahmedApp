"use client";

import { useEffect } from "react";

import {
  ETHIOPIAN_COUNTRY_CODE,
  formatEthiopianNationalPhone,
} from "@/lib/biloo/phone";

const PHONE_SELECTOR = [
  'input[type="tel"]',
  'input[inputmode="tel"]',
  'input[name*="phone" i]',
  'input[name*="mobile" i]',
].join(",");

function formattedFullPhone(value: string) {
  const national = formatEthiopianNationalPhone(value);
  return national
    ? `${ETHIOPIAN_COUNTRY_CODE} ${national}`
    : `${ETHIOPIAN_COUNTRY_CODE} `;
}

function enhancePhoneInput(input: HTMLInputElement) {
  if (
    input.type === "hidden" ||
    input.dataset.ethiopianPhoneLocal === "true" ||
    input.dataset.bilooPhoneIgnore === "true" ||
    input.dataset.bilooPhoneEnhanced === "true"
  ) {
    return;
  }

  input.dataset.bilooPhoneEnhanced = "true";
  input.type = "tel";
  input.inputMode = "numeric";
  input.autocomplete = "tel";
  input.maxLength = 17;
  input.placeholder = "+251 912 345 678";
  input.value = formattedFullPhone(input.value);

  const maintainPrefix = () => {
    const nextValue = formattedFullPhone(input.value);
    if (input.value !== nextValue) input.value = nextValue;
  };

  const protectPrefix = (event: KeyboardEvent) => {
    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    const prefixEnd = `${ETHIOPIAN_COUNTRY_CODE} `.length;

    if (
      (event.key === "Backspace" && selectionStart <= prefixEnd && selectionEnd <= prefixEnd) ||
      (event.key === "Delete" && selectionStart < prefixEnd)
    ) {
      event.preventDefault();
      input.setSelectionRange(prefixEnd, prefixEnd);
    }
  };

  const placeCaretAfterPrefix = () => {
    const prefixEnd = `${ETHIOPIAN_COUNTRY_CODE} `.length;
    if ((input.selectionStart ?? 0) < prefixEnd) {
      input.setSelectionRange(prefixEnd, prefixEnd);
    }
  };

  input.addEventListener("input", maintainPrefix);
  input.addEventListener("change", maintainPrefix);
  input.addEventListener("keydown", protectPrefix);
  input.addEventListener("click", placeCaretAfterPrefix);
  input.addEventListener("focus", placeCaretAfterPrefix);
}

function scanPhoneInputs(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>(PHONE_SELECTOR).forEach(enhancePhoneInput);
}

export function EthiopianPhoneController() {
  useEffect(() => {
    scanPhoneInputs();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(PHONE_SELECTOR) && node instanceof HTMLInputElement) {
            enhancePhoneInput(node);
          }
          scanPhoneInputs(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
