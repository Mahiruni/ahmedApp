"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterOptions = {
  typingMs?: number;
  deletingMs?: number;
  pauseMs?: number;
  nextDelayMs?: number;
};

type Phase = "typing" | "paused" | "deleting";

type TypewriterState = {
  signature: string;
  index: number;
  text: string;
  phase: Phase;
};

export function useTypewriterCycle(
  values: readonly string[],
  {
    typingMs = 46,
    deletingMs = 28,
    pauseMs = 1450,
    nextDelayMs = 180,
  }: TypewriterOptions = {},
) {
  const items = useMemo(
    () => values.filter((value) => value.trim().length > 0),
    [values],
  );
  const signature = items.join("\u0000");
  const [state, setState] = useState<TypewriterState>({
    signature,
    index: 0,
    text: "",
    phase: "typing",
  });

  const currentState: TypewriterState =
    state.signature === signature
      ? state
      : { signature, index: 0, text: "", phase: "typing" };

  useEffect(() => {
    if (state.signature !== signature) {
      const reset = window.setTimeout(() => {
        setState({ signature, index: 0, text: "", phase: "typing" });
      }, 0);
      return () => window.clearTimeout(reset);
    }

    if (!items.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const safeIndex = state.index % items.length;
    const current = items[safeIndex] ?? items[0];

    if (reducedMotion) {
      if (state.text === current && state.phase === "paused") return;
      const settle = window.setTimeout(() => {
        setState({
          signature,
          index: safeIndex,
          text: current,
          phase: "paused",
        });
      }, 0);
      return () => window.clearTimeout(settle);
    }

    let delay = typingMs;
    let nextPhase = state.phase;
    let nextText = state.text;
    let nextIndex = safeIndex;

    if (state.phase === "typing") {
      if (state.text.length < current.length) {
        nextText = current.slice(0, state.text.length + 1);
      } else {
        nextPhase = "paused";
        delay = pauseMs;
      }
    } else if (state.phase === "paused") {
      nextPhase = "deleting";
      delay = deletingMs;
    } else if (state.text.length > 0) {
      nextText = state.text.slice(0, -1);
      delay = deletingMs;
    } else {
      nextIndex = (safeIndex + 1) % items.length;
      nextPhase = "typing";
      delay = nextDelayMs;
    }

    const timeout = window.setTimeout(() => {
      setState({
        signature,
        index: nextIndex,
        text: nextText,
        phase: nextPhase,
      });
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [
    deletingMs,
    items,
    nextDelayMs,
    pauseMs,
    signature,
    state,
    typingMs,
  ]);

  return {
    index: currentState.index,
    text: currentState.text,
    fullText:
      items[currentState.index % Math.max(items.length, 1)] ?? "",
    phase: currentState.phase,
  };
}
