import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useStreamText(fullText, active, wordsPerTick = 3, intervalMs = 35) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || !fullText) {
      setDisplayed(fullText || "");
      setDone(true);
      return;
    }

    if (reduced) {
      setDisplayed(fullText);
      setDone(true);
      return;
    }

    const words = fullText.split(/(\s+)/);
    let index = 0;
    setDisplayed("");
    setDone(false);

    const timer = setInterval(() => {
      index = Math.min(index + wordsPerTick, words.length);
      setDisplayed(words.slice(0, index).join(""));
      if (index >= words.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [fullText, active, wordsPerTick, intervalMs, reduced]);

  return { displayed, done };
}
