"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { cn } from "cn";

const timeZone = "Europe/Warsaw";

function formatWarsaw(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "--";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "--";
  const period = parts.find((part) => part.type === "dayPeriod")?.value ?? "";

  return { clock: `${hour}:${minute}`, period };
}

export function WarsawTime({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    // Tick on each minute boundary (not 60s after mount), so the clock flips with the device's.
    const tick = () => {
      const date = new Date();
      setNow(date);
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 60_000 - (date.getTime() % 60_000) + 50);
    };

    // Background tabs throttle timers (especially on iOS), so resync when the tab is visible again.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const formatted = now ? formatWarsaw(now) : { clock: "--:--", period: "" };

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <span>{site.location}</span>{" "}
      <time dateTime={now?.toISOString()} className="text-foreground tabular-nums">
        {formatted.clock}
      </time>
      {formatted.period ? <span> {formatted.period}</span> : null}
    </p>
  );
}
