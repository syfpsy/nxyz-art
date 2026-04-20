"use client";

import { useEffect, useState } from "react";
import { STUDIO } from "@/content/studio";

/**
 * Live UTC clock + studio coordinates.
 * Renders nothing until mounted to avoid hydration mismatch.
 */
export function StudioClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const clock = now
    ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`
    : "— — : — — : — — UTC";

  return (
    <span className="t-label" style={{ color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>
      {clock} · {STUDIO.coords}
    </span>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
