import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useStreamText(fullText, active, wordsPerTick = 3, intervalMs = 35) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Single timer handle so EVERY return path below is a cleanup function,
    // never a raw setInterval id. Guarantees React always gets a callable `destroy`.
    let timer = null;
    const cleanup = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (!active || !fullText || reduced) {
      setDisplayed(fullText || "");
      setDone(true);
      return cleanup;
    }

    const words = fullText.split(/(\s+)/);
    let index = 0;
    setDisplayed("");
    setDone(false);

    timer = setInterval(() => {
      index = Math.min(index + wordsPerTick, words.length);
      setDisplayed(words.slice(0, index).join(""));
      if (index >= words.length) {
        cleanup();
        setDone(true);
      }
    }, intervalMs);

    return cleanup;
  }, [fullText, active, wordsPerTick, intervalMs, reduced]);

  return { displayed, done };
}
