import * as React from "react";

export type Point = {
  x: number;
  y: number;
};

/**
 * Reports the pointer position relative to `ref`'s element, throttled to one
 * callback per animation frame. The element's rectangle is cached and refreshed
 * on pointer enter, resize and scroll. Client-only: runs in effects.
 */
export function useMousePosition(
  ref: React.RefObject<HTMLElement | null>,
  callback?: (point: Point) => void
) {
  const callbackRef = React.useRef(callback);
  const rectRef = React.useRef<DOMRect | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const latestPointRef = React.useRef<Point | null>(null);

  // Keep callback reference updated without triggering re-effects
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const updateRect = () => {
      rectRef.current = node.getBoundingClientRect();
    };

    const flush = () => {
      frameRef.current = null;
      if (latestPointRef.current) {
        callbackRef.current?.(latestPointRef.current);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!rectRef.current) {
        updateRect();
      }

      const currentRect = rectRef.current;
      if (!currentRect) return;

      latestPointRef.current = {
        x: event.clientX - currentRect.left,
        y: event.clientY - currentRect.top,
      };

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(flush);
      }
    };

    updateRect();

    node.addEventListener("pointerenter", updateRect);
    node.addEventListener("pointermove", handlePointerMove, { passive: true });

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, {
      passive: true,
      capture: true,
    });

    return () => {
      node.removeEventListener("pointerenter", updateRect);
      node.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [ref]);
}