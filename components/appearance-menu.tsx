"use client";

import { Check, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ICON_SIZE = 16;
const LABEL = "Appearance";
const WARSAW_TZ = "Europe/Warsaw";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match system" },
] as const;

function formatWarsawTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: WARSAW_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function AppearanceMenu({ expanded }: { expanded: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [warsawTime, setWarsawTime] = useState(() => formatWarsawTime(new Date()));

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!expanded) return;
    const tick = () => setWarsawTime(formatWarsawTime(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [expanded]);

  const currentValue = mounted ? (theme ?? "system") : "system";

  const trigger = (
    <button
      type="button"
      aria-label={LABEL}
      className={cn(
        "text-tertiary hover:bg-muted flex cursor-pointer items-center rounded-md",
        expanded
          ? "size-11 md:size-10 shrink-0 justify-center"
          : "h-11 md:h-10 w-full",
      )}
    >
      <span
        className={cn(
          "flex flex-none items-center justify-center",
          expanded ? "size-11 md:size-10" : "h-11 w-11 md:h-10 md:w-10",
        )}
      >
        <Sun size={ICON_SIZE} weight="regular" aria-hidden />
      </span>
      {!expanded ? (
        <span className="pointer-events-none truncate text-base md:text-sm opacity-0 transition-opacity duration-150">
          {LABEL}
        </span>
      ) : null}
    </button>
  );

  return (
    <DropdownMenu>
      {expanded ? (
        <div className="text-tertiary flex min-h-11 w-full items-center gap-2 pl-3 text-xs">
          <span className="truncate">Warsaw, Poland</span>
          <time
            className="flex-1 text-center whitespace-nowrap tabular-nums"
            dateTime={new Date().toISOString()}
            suppressHydrationWarning
          >
            {warsawTime}
          </time>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </div>
      ) : (
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {LABEL}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={8}
        className="min-w-44"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Appearance
        </DropdownMenuLabel>
        {THEME_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
            className="min-h-11 justify-between text-base md:text-sm"
          >
            {option.label}
            {currentValue === option.value ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
