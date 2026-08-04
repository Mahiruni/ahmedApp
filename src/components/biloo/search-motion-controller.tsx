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
  paused: boolean;
};

function promptsFor(input: HTMLInputElement) {
  const purpose = `${input.getAttribute("aria-label") ?? ""} ${
    input.closest("label")?.textContent ?? ""
  }`.toLowerCase();

  return purpose.includes("pickup") ? pickupPrompts : destinationPrompts;
}

function clearLegacyDestination(input: HTMLInputElement) {
  if (input.value.trim().toLowerCase() !== "bole international airport") return;

  const nativeValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  nativeValueSetter?.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function markTransientFieldActions() {
  document
    .querySelectorAll<HTMLButtonElement>(
      ".biloo-place-search button, .biloo-search-premium button",
    )
    .forEach((button) => {
      const label = button.getAttribute("aria-label")?.trim();
      if (!label || !/^Clear\b/i.test(label)) return;

      button.setAttribute("aria-label", label.replace(/^Clear\b/i, "Reset"));
      button.dataset.transientFieldAction = "true";
    });
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
      const heroCopyCandidate = hero.querySelector<HTMLElement>(
        ".biloo-service-loop-copy",
      );
      if (!heroCopyCandidate) return;
      const heroCopy: HTMLElement = heroCopyCandidate;

      function animateServiceChange() {
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
      if (prompts === destinationPrompts) clearLegacyDestination(input);

      const stablePrompt = prompts[0] ?? "Search";
      if (reducedMotion) {
        input.placeholder = stablePrompt;
        return;
      }

      const animation: InputAnimation = {
        timer: null,
        stopped: false,
        paused: false,
      };
      let promptIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      function clearTimer() {
        if (animation.timer === null) return;
        window.clearTimeout(animation.timer);
        animation.timer = null;
      }

      function schedule(delay: number) {
        clearTimer();
        if (animation.stopped || animation.paused) return;
        animation.timer = window.setTimeout(step, delay);
      }

      function pauseForEditing() {
        animation.paused = true;
        clearTimer();
        input.dataset.searchEditing = "true";
        input.placeholder = input.value ? "" : stablePrompt;
      }

      function resumeIdlePrompt() {
        animation.paused = false;
        delete input.dataset.searchEditing;
        if (input.value) {
          input.placeholder = "";
          return;
        }
        characterIndex = 0;
        deleting = false;
        input.placeholder = "";
        schedule(320);
      }

      function handleInput() {
        if (input.value) {
          input.placeholder = "";
          return;
        }
        input.placeholder = animation.paused ? stablePrompt : "";
        if (!animation.paused) schedule(260);
      }

      function step() {
        animation.timer = null;
        if (animation.stopped || animation.paused) return;
        const prompt = prompts[promptIndex] ?? stablePrompt;

        if (input.value) {
          input.placeholder = "";
          schedule(180);
          return;
        }

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
      }

      input.addEventListener("focus", pauseForEditing);
      input.addEventListener("blur", resumeIdlePrompt);
      input.addEventListener("input", handleInput);

      if (document.activeElement === input) pauseForEditing();
      else schedule(280);

      cleanups.add(() => {
        animation.stopped = true;
        clearTimer();
        input.removeEventListener("focus", pauseForEditing);
        input.removeEventListener("blur", resumeIdlePrompt);
        input.removeEventListener("input", handleInput);
      });
    }

    function scan() {
      prepareHero();
      markTransientFieldActions();
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
