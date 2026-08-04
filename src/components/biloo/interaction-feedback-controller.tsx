"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "./ui";

type FeedbackSound = "cart-add" | "cart-remove" | "payment-success";
type ConfirmationState = {
  title: string;
  message: string;
  confirmLabel: string;
  cartRemoval: boolean;
};
type PaymentPhase = "authorizing" | "finalizing";

let sharedAudioContext: AudioContext | null = null;

function audioIsEnabled() {
  try {
    return window.localStorage.getItem("biloo:sound") !== "off";
  } catch {
    return true;
  }
}

function getAudioContext() {
  if (typeof window === "undefined" || !audioIsEnabled()) return null;
  if (sharedAudioContext) return sharedAudioContext;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as unknown as {
      webkitAudioContext?: new () => AudioContext;
    }).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  try {
    sharedAudioContext = new AudioContextConstructor();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

function primeAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
}

function scheduleTone(
  context: AudioContext,
  startAt: number,
  startFrequency: number,
  endFrequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(40, endFrequency),
    startAt + duration,
  );

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.025);
}

function playFeedbackSound(sound: FeedbackSound) {
  const context = getAudioContext();
  if (!context || document.visibilityState === "hidden") return;

  const play = () => {
    const now = context.currentTime + 0.012;

    if (sound === "cart-add") {
      scheduleTone(context, now, 520, 620, 0.075, 0.026, "sine");
      scheduleTone(context, now + 0.065, 660, 760, 0.085, 0.022, "sine");
      return;
    }

    if (sound === "cart-remove") {
      scheduleTone(context, now, 430, 300, 0.12, 0.022, "triangle");
      return;
    }

    scheduleTone(context, now, 523, 620, 0.105, 0.028, "sine");
    scheduleTone(context, now + 0.09, 659, 780, 0.12, 0.032, "sine");
    scheduleTone(context, now + 0.185, 784, 920, 0.15, 0.026, "sine");
  };

  if (context.state === "suspended") {
    void context.resume().then(play).catch(() => undefined);
  } else {
    play();
  }
}

function cartCountFromDocument() {
  const openCartCount = document.querySelector<HTMLElement>(
    ".biloo-cart-count",
  )?.textContent;
  const openMatch = openCartCount?.match(/\d+/);
  if (openMatch) return Number(openMatch[0]);

  const cartButton = document.querySelector<HTMLButtonElement>(
    '[data-biloo-header] button[aria-label="Open cart"]',
  );
  if (!cartButton) return 0;

  const badge = Array.from(cartButton.querySelectorAll("span"))
    .map((element) => element.textContent?.trim() ?? "")
    .find((value) => /^\d+$/.test(value));

  return badge ? Number(badge) : 0;
}

function normalizedButtonLabel(button: HTMLButtonElement) {
  return (
    button.getAttribute("aria-label") ?? button.textContent ?? ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function InteractionFeedbackController() {
  const [confirmation, setConfirmation] =
    useState<ConfirmationState | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const allowedClicksRef = useRef(new WeakSet<HTMLButtonElement>());
  const paymentObserverRef = useRef<MutationObserver | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((value) => value !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const stopPaymentObserver = useCallback(() => {
    paymentObserverRef.current?.disconnect();
    paymentObserverRef.current = null;
  }, []);

  const cancelConfirmation = useCallback(() => {
    const trigger = pendingButtonRef.current;
    pendingButtonRef.current = null;
    setConfirmation(null);
    addTimer(() => trigger?.focus(), 0);
  }, [addTimer]);

  const trackCartChange = useCallback(
    (before: number, expected: "add" | "remove") => {
      let settled = false;
      let observer: MutationObserver | null = null;

      const finish = () => {
        if (settled) return;
        const after = cartCountFromDocument();
        const changed = expected === "add" ? after > before : after < before;
        if (!changed) return;

        settled = true;
        observer?.disconnect();
        playFeedbackSound(
          expected === "add" ? "cart-add" : "cart-remove",
        );
      };

      observer = new MutationObserver(finish);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      addTimer(finish, 60);
      addTimer(finish, 180);
      addTimer(() => observer?.disconnect(), 900);
    },
    [addTimer],
  );

  const finishPaymentSuccess = useCallback(() => {
    stopPaymentObserver();
    setPaymentPhase(null);
    playFeedbackSound("payment-success");
  }, [stopPaymentObserver]);

  const watchForPaymentCompletion = useCallback(() => {
    stopPaymentObserver();

    const inspect = () => {
      const paymentOverlay = document.querySelector<HTMLElement>(
        ".biloo-payment-overlay",
      );
      if (!paymentOverlay || paymentOverlay.dataset.open !== "true") {
        finishPaymentSuccess();
      }
    };

    const observer = new MutationObserver(inspect);
    paymentObserverRef.current = observer;
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-open", "aria-hidden"],
    });

    addTimer(inspect, 0);
    addTimer(() => {
      stopPaymentObserver();
      setPaymentPhase(null);
    }, 15000);
  }, [addTimer, finishPaymentSuccess, stopPaymentObserver]);

  const runImportantAction = useCallback(
    (button: HTMLButtonElement, message: string, delay: number) => {
      if (actionLoading || paymentPhase) return;
      setActionLoading(message);
      addTimer(() => {
        allowedClicksRef.current.add(button);
        button.click();
        setActionLoading(null);
      }, delay);
    },
    [actionLoading, addTimer, paymentPhase],
  );

  const beginPayment = useCallback(
    (button: HTMLButtonElement) => {
      if (paymentPhase) return;
      primeAudio();
      setPaymentPhase("authorizing");

      addTimer(() => {
        setPaymentPhase("finalizing");
        watchForPaymentCompletion();
        allowedClicksRef.current.add(button);
        button.click();
      }, 950);
    },
    [addTimer, paymentPhase, watchForPaymentCompletion],
  );

  useEffect(() => {
    function interceptClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;

      if (allowedClicksRef.current.has(button)) {
        allowedClicksRef.current.delete(button);
        return;
      }

      const label = normalizedButtonLabel(button);
      const cartRemoval = /^Remove .+ from cart$/i.test(label);
      const explicitDelete =
        button.dataset.confirmDelete === "true" ||
        /^(Delete|Clear)\b/i.test(label);

      if (cartRemoval || explicitDelete) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        pendingButtonRef.current = button;
        const itemName = cartRemoval
          ? label.replace(/^Remove\s+/i, "").replace(/\s+from cart$/i, "")
          : "this item";
        setConfirmation({
          title: cartRemoval ? "Remove item from cart?" : "Confirm deletion",
          message: cartRemoval
            ? `${itemName} will be removed from your cart.`
            : "This action cannot be undone. Please confirm before continuing.",
          confirmLabel: cartRemoval ? "Remove item" : "Delete",
          cartRemoval,
        });
        return;
      }

      if (button.matches(".biloo-payment-submit")) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        beginPayment(button);
        return;
      }

      if (button.matches(".biloo-cart-checkout")) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        runImportantAction(button, "Preparing secure checkout…", 420);
        return;
      }

      if (
        button.closest("#biloo-taxi-booking") &&
        /^Confirm\b/i.test(label)
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        runImportantAction(button, "Requesting a nearby driver…", 650);
        return;
      }

      if (
        /^(Publish campaign|Accept job|Accept delivery|Complete ride|Complete delivery|Mark ready|Start preparing|Dispatch order)$/i.test(
          label,
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        runImportantAction(button, "Updating BILOO…", 420);
        return;
      }

      const addAction =
        /^Add .+ to cart$/i.test(label) || /^Add one\b/i.test(label);
      const removeAction = /^Remove one\b/i.test(label);

      if (addAction || removeAction) {
        primeAudio();
        trackCartChange(
          cartCountFromDocument(),
          addAction ? "add" : "remove",
        );
      }
    }

    document.addEventListener("click", interceptClick, true);
    return () => document.removeEventListener("click", interceptClick, true);
  }, [beginPayment, runImportantAction, trackCartChange]);

  useEffect(() => {
    if (!confirmation) return;
    const timer = window.setTimeout(() => confirmButtonRef.current?.focus(), 0);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") cancelConfirmation();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cancelConfirmation, confirmation]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      stopPaymentObserver();
    },
    [stopPaymentObserver],
  );

  function confirmDeletion() {
    const button = pendingButtonRef.current;
    const currentConfirmation = confirmation;
    if (!button || !currentConfirmation) return;

    const before = cartCountFromDocument();
    pendingButtonRef.current = null;
    setConfirmation(null);
    allowedClicksRef.current.add(button);
    button.click();

    if (currentConfirmation.cartRemoval) {
      trackCartChange(before, "remove");
    }
  }

  return (
    <>
      {actionLoading ? (
        <div
          aria-live="polite"
          className="biloo-action-loading"
          role="status"
        >
          <span className="biloo-feedback-spinner" aria-hidden="true" />
          <span>{actionLoading}</span>
        </div>
      ) : null}

      {paymentPhase ? (
        <div
          aria-live="polite"
          className="biloo-payment-processing-overlay"
          role="status"
        >
          <div className="biloo-payment-processing-card">
            <span className="biloo-payment-processing-mark" aria-hidden="true">
              <span className="biloo-feedback-spinner" />
            </span>
            <span className="biloo-payment-processing-copy">
              <small>Secure BILOO payment</small>
              <strong>
                {paymentPhase === "authorizing"
                  ? "Authorizing payment…"
                  : "Confirming your order…"}
              </strong>
              <span>
                {paymentPhase === "authorizing"
                  ? "Encrypting your payment details."
                  : "Please keep this screen open for a moment."}
              </span>
            </span>
            <span className="biloo-payment-processing-steps" aria-hidden="true">
              <i data-active="true" />
              <i data-active={paymentPhase === "finalizing"} />
              <i />
            </span>
          </div>
        </div>
      ) : null}

      {confirmation ? (
        <div className="biloo-confirmation-overlay">
          <button
            aria-label="Cancel deletion"
            className="biloo-confirmation-backdrop"
            onClick={cancelConfirmation}
            type="button"
          />
          <section
            aria-describedby="biloo-confirmation-message"
            aria-labelledby="biloo-confirmation-title"
            aria-modal="true"
            className="biloo-confirmation-dialog"
            role="alertdialog"
          >
            <span className="biloo-confirmation-icon" aria-hidden="true">
              <Icon className="size-6" name="alert" />
            </span>
            <div className="biloo-confirmation-copy">
              <span>Confirmation required</span>
              <h2 id="biloo-confirmation-title">{confirmation.title}</h2>
              <p id="biloo-confirmation-message">{confirmation.message}</p>
            </div>
            <div className="biloo-confirmation-actions">
              <button
                className="biloo-confirmation-cancel"
                onClick={cancelConfirmation}
                type="button"
              >
                Keep it
              </button>
              <button
                ref={confirmButtonRef}
                className="biloo-confirmation-delete"
                onClick={confirmDeletion}
                type="button"
              >
                {confirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
