"use client";

import * as React from "react";

export function useAnimatedNumber(targetValue: number, duration: number = 500): number {
  const [current, setCurrent] = React.useState(targetValue);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const initialValue = current;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      setCurrent(initialValue + (targetValue - initialValue) * easeOut);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return current;
}

export default useAnimatedNumber;