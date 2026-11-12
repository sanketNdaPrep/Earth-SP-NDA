import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Eases a displayed number towards `target`. With reduced motion it returns the
 * target immediately. State is only updated inside animation-frame callbacks.
 */
export function useAnimatedNumber(target: number, duration = 700): number {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = React.useState(target);
  const current = React.useRef(target);

  React.useEffect(() => {
    if (reduceMotion) {
      current.current = target;
      return;
    }

    const from = current.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      current.current = from + (target - from) * eased;
      setValue(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduceMotion]);

  return reduceMotion ? target : value;
}