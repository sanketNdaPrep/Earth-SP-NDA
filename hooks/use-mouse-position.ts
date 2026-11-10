"use client";

import * as React from "react";

export function useMousePosition(
  targetRef: React.RefObject<HTMLElement | null>,
  callback?: (pos: { x: number; y: number }) => void
) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const updateMousePosition = (ev: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const pos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      };
      setMousePosition(pos);
      if (callback) {
        callback(pos);
      }
    };

    element.addEventListener("mousemove", updateMousePosition);

    return () => {
      element.removeEventListener("mousemove", updateMousePosition);
    };
  }, [targetRef, callback]);

  return mousePosition;
}

export default useMousePosition;