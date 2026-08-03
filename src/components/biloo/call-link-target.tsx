"use client";

import { useEffect } from "react";

export const BILOO_CALL_NUMBER_LOCAL = "0924093037";
export const BILOO_CALL_NUMBER_E164 = "+251924093037";

const placeholderCallSelector = 'a[href="tel:+251911000000"]';

function connectOwnerCallLinks(root: ParentNode = document) {
  root
    .querySelectorAll<HTMLAnchorElement>(placeholderCallSelector)
    .forEach((link) => {
      link.href = `tel:${BILOO_CALL_NUMBER_E164}`;
      link.setAttribute("aria-label", `Call ${BILOO_CALL_NUMBER_LOCAL}`);
      link.dataset.bilooCallNumber = BILOO_CALL_NUMBER_LOCAL;
    });
}

export function BilooCallLinkTarget() {
  useEffect(() => {
    connectOwnerCallLinks();

    const observer = new MutationObserver(() => connectOwnerCallLinks());
    observer.observe(document.body, { childList: true, subtree: true });

    const prepareCall = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(placeholderCallSelector);
      if (!link) return;

      link.href = `tel:${BILOO_CALL_NUMBER_E164}`;
      link.setAttribute("aria-label", `Call ${BILOO_CALL_NUMBER_LOCAL}`);
    };

    document.addEventListener("pointerdown", prepareCall, true);
    document.addEventListener("click", prepareCall, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", prepareCall, true);
      document.removeEventListener("click", prepareCall, true);
    };
  }, []);

  return null;
}
