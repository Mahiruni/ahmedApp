"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterOptions = {
  typingMs?: number;
  deletingMs?: number;
  pauseMs?: number;
  nextDelayMs?: number;
};

type Phase = "typing" | "paused" | "deleting";

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
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (!items.length) {
      setText("");
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const current = items[index % items.length] ?? items[0];

    if (reducedMotion) {
      setText(current);
      setPhase("paused");
      return;
    }

    let delay = typingMs;
    let nextPhase = phase;
    let nextText = text;
    let nextIndex = index;

    if (phase === "typing") {
      if (text.length < current.length) {
        nextText = current.slice(0, text.length + 1);
      } else {
        nextPhase = "paused";
        delay = pauseMs;
      }
    } else if (phase === "paused") {
      nextPhase = "deleting";
      delay = deletingMs;
    } else if (text.length > 0) {
      nextText = text.slice(0, -1);
      delay = deletingMs;
    } else {
      nextIndex = (index + 1) % items.length;
      nextPhase = "typing";
      delay = nextDelayMs;
    }

    const timeout = window.setTimeout(() => {
      setText(nextText);
      setIndex(nextIndex);
      setPhase(nextPhase);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [
    deletingMs,
    index,
    items,
    nextDelayMs,
    pauseMs,
    phase,
    text,
    typingMs,
  ]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [index, items.length]);

  return {
    index,
    text,
    fullText: items[index % Math.max(items.length, 1)] ?? "",
    phase,
  };
}
