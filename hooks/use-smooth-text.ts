"use client";

import { useEffect, useRef, useState } from "react";

export type UseSmoothTextOptions = {
  /**
   * Target reveal rate in characters per second. Default 120, which maps
   * closely to ChatGPT/Claude. Bump higher for faster reveal, lower for a
   * more deliberate typewriter feel.
   */
  charsPerSecond?: number;
  /**
   * Whether the underlying stream is still producing tokens. When this flips
   * to false, any remaining buffered characters are flushed immediately so
   * the UI never appears stuck mid-reveal after the stream completes.
   */
  isStreaming?: boolean;
  /**
   * When the buffer falls more than this many characters ahead of the
   * displayed text, the reveal rate speeds up proportionally to catch up.
   * Prevents the typewriter from trailing far behind reality on fast
   * streams or long chunks. Default 220.
   */
  catchUpThreshold?: number;
};

/**
 * Decouples the visible text cadence from the stream arrival cadence.
 *
 * The raw stream writes to `buffer` in whatever chunks the server and
 * network hand us (often a full sentence at a time). This hook reveals
 * characters at a consistent per-second rate via `requestAnimationFrame`,
 * producing the smooth typing effect used by Claude and ChatGPT.
 *
 * The revealed length is tracked in a ref so that an append to `buffer`
 * does not reset progress; it just extends the target.
 *
 * Returns the currently-visible substring of `buffer`.
 */
export function useSmoothText(
  buffer: string,
  { charsPerSecond = 120, isStreaming = true, catchUpThreshold = 220 }: UseSmoothTextOptions = {},
): string {
  const [displayed, setDisplayed] = useState("");
  const revealedRef = useRef(0);
  const lastTickRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Reset revealed position when the buffer is cleared (e.g. new assistant turn).
  useEffect(() => {
    if (buffer.length === 0) {
      revealedRef.current = 0;
      setDisplayed("");
    } else if (revealedRef.current > buffer.length) {
      // Buffer was shortened/replaced. Re-sync.
      revealedRef.current = 0;
      setDisplayed("");
    }
  }, [buffer]);

  // When the stream ends, flush any remaining buffer instantly so the final
  // message is always shown in full even if the user scrolled away.
  useEffect(() => {
    if (isStreaming) return;
    if (revealedRef.current < buffer.length) {
      revealedRef.current = buffer.length;
      setDisplayed(buffer);
    }
  }, [isStreaming, buffer]);

  useEffect(() => {
    if (!isStreaming) return;
    if (revealedRef.current >= buffer.length) return;

    const tick = (now: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const elapsedSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      let step = Math.max(1, Math.ceil(elapsedSec * charsPerSecond));
      const lag = buffer.length - (revealedRef.current + step);
      if (lag > catchUpThreshold) {
        step += Math.ceil(lag / 10);
      }

      const next = Math.min(revealedRef.current + step, buffer.length);
      revealedRef.current = next;
      setDisplayed(buffer.slice(0, next));

      if (next < buffer.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        lastTickRef.current = 0;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTickRef.current = 0;
    };
  }, [buffer, isStreaming, charsPerSecond, catchUpThreshold]);

  return displayed;
}
