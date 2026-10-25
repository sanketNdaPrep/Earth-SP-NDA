'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Seconds left until `endsAt` (a wall-clock time), or null before the first tick and for untimed modules.
 * Remaining time is always worked out from the clock, never counted down, so throttled background tabs,
 * a sleeping laptop and a page reload cannot make the timer drift or reset.
 * `onExpire` runs once the time reaches zero while `active` is true.
 */
export function useCountdown(endsAt: number | null, active: boolean, onExpire: () => void): number | null {
  const [now, setNow] = useState<number | null>(null);
  const expireRef = useRef(onExpire);

  useEffect(() => {
    expireRef.current = onExpire;
  });

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [active]);

  const remaining = endsAt === null || now === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    if (active && remaining === 0) expireRef.current();
  }, [active, remaining]);

  return remaining;
}