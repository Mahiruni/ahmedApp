"use client";

import { useEffect } from "react";

const pickupPrompts = [
  "Enter your pickup street",
  "Search a gate or landmark",
  "Use GPS for your exact place",
];

const destinationPrompts = [
  "Search anywhere in Addis",
  "Enter a street, gate or landmark",
  "Find nearby towns and detailed places",
];

type InputAnimation = {
  timer: number | null;
  stopped: boolean;
};

function promptsFor(input: HTMLInputElement) {
  const purpose = `${input.getAttribute("aria-label") ?? ""} ${
    input.closest("label")?.textContent ?? ""
  }`.toLowerCase();

  return purpose.includes("pickup") ? pickupPrompts : destinationPrompts;
}

export function SearchMotionController() {
  useEffect(() => {
    const cleanups = new Set<() => void>();
    const preparedInputs = new WeakSet<HTMLInputElement>();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function prepareHero() {
      const hero = document.querySelector<HTMLButtonElement>(
        ".biloo-service-loop",
      );
      if (!hero || hero.dataset.motionController === "ready") return;

      hero.dataset.motionController = "ready";
      const heroCopy = hero.querySelector<HTMLElement>(
        ".biloo-service-loop-copy",
      );
      if (!heroCopy) return;

      function animateServiceChange() {
        if (!heroCopy) return;
        heroCopy.classList.remove("biloo-service-motion-enter");
        void heroCopy.offsetWidth;
        heroCopy.classList.add("biloo-service-motion-enter");
      }

      animateServiceChange();
      const observer = new MutationObserver(animateServiceChange);
      observer.observe(hero, {
        attributes: true,
        attributeFilter: ["aria-label"],
      });

      cleanups.add(() => observer.disconnect());
    }

    function prepareInput(input: HTMLInputElement) {
      if (preparedInputs.has(input)) return;
      preparedInputs.add(input);

      const prompts = promptsFor(input);
      if (reducedMotion) {
        input.placeholder = prompts[0];
        return;
      }

      const animation: InputAnimation = { timer: null, stopped: false };
      let promptIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      function schedule(delay: number) {
        animation.timer = window.setTimeout(step, delay);
      }

      function step() {
        if (animation.stopped) return;
        const prompt = prompts[promptIndex] ?? prompts[0];

        if (!input.value) {
          if (!deleting) {
            characterIndex = Math.min(characterIndex + 1, prompt.length);
            input.placeholder = prompt.slice(0, characterIndex);

            if (characterIndex === prompt.length) {
              deleting = true;
              schedule(1350);
              return;
            }
            schedule(48);
            return;
          }

          characterIndex = Math.max(characterIndex - 1, 0);
          input.placeholder = prompt.slice(0, characterIndex);
          if (characterIndex === 0) {
            deleting = false;
            promptIndex = (promptIndex + 1) % prompts.length;
            schedule(260);
            return;
          }
          schedule(27);
          return;
        }

        input.placeholder = "";
        schedule(180);
      }

      schedule(280);
      cleanups.add(() => {
        animation.stopped = true;
        if (animation.timer !== null) window.clearTimeout(animation.timer);
      });
    }

    function scan() {
      prepareHero();
      document
        .querySelectorAll<HTMLInputElement>(".biloo-place-search-input")
        .forEach(prepareInput);
    }

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      cleanups.clear();
    };
  }, []);

  return null;
}
