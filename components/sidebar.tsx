"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { EnvelopeSimple, FigmaLogo, FileText, SidebarSimple } from "@phosphor-icons/react";
import { siGithub } from "simple-icons";
import { AppearanceMenu } from "@/components/appearance-menu";
import { linkedInBrand, SimpleBrandIcon } from "@/components/simple-brand-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ICON_SIZE = 20;
const BRAND_ICON_SIZE = 16;
const ICON_WEIGHT = "regular" as const;

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function sidebarToggleShortcutLabel(): string {
  if (typeof navigator === "undefined") return "⌘.";
  return /Mac|iPhone|iPad/i.test(navigator.userAgent) ? "⌘." : "Ctrl+.";
}

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
};

const FIGMA_WORK_URL =
  "https://www.figma.com/proto/l9Icgz8X910ZBSOIfvA9eO/Alex-Kiersnowski-%E2%80%94-Latest-Work-%E2%80%94-2026?node-id=1-2&p=f&viewport=224%2C440%2C0.03&t=PhpNhl1Jtiu2pJWL-1&scaling=contain&content-scaling=fixed&starting-point-node-id=1%3A2&page-id=0%3A1";

const topItems: NavItem[] = [
  {
    label: "Latest work",
    href: FIGMA_WORK_URL,
    external: true,
    icon: <FigmaLogo size={ICON_SIZE} weight={ICON_WEIGHT} aria-hidden />,
  },
  {
    label: "Download CV",
    href: "/cv",
    external: true,
    icon: <FileText size={ICON_SIZE} weight={ICON_WEIGHT} aria-hidden />,
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Email",
    href: "mailto:alex.kiersnowski@gmail.com",
    external: true,
    icon: <EnvelopeSimple size={ICON_SIZE} weight={ICON_WEIGHT} aria-hidden />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/alexkiersnowski/",
    external: true,
    icon: <SimpleBrandIcon data={linkedInBrand} size={BRAND_ICON_SIZE} />,
  },
  {
    label: "GitHub",
    href: "https://github.com/alexkiersnowski",
    external: true,
    icon: <SimpleBrandIcon data={siGithub} size={BRAND_ICON_SIZE} />,
  },
];

type SidebarProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const [toggleShortcutLabel, setToggleShortcutLabel] = useState("⌘.");

  useEffect(() => {
    setToggleShortcutLabel(sidebarToggleShortcutLabel());
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "." || e.altKey || e.shiftKey) return;
      const mac = /Mac|iPhone|iPad/i.test(navigator.userAgent);
      if (mac ? !e.metaKey : !e.ctrlKey) return;
      if (isTypingInField(e.target)) return;
      e.preventDefault();
      onToggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggle]);

  const toggleActionLabel = expanded ? "Close sidebar" : "Open sidebar";
  const toggleAriaLabel = `${toggleActionLabel} ${toggleShortcutLabel}`;

  const toggleButton = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={toggleAriaLabel}
      className={cn(
        "text-tertiary flex size-11 md:size-10 shrink-0 cursor-pointer items-center justify-center",
        // Mobile: circle with elevation; Desktop: plain rounded square
        "rounded-full bg-white shadow-sm dark:bg-zinc-800 md:rounded-md md:bg-transparent md:dark:bg-transparent md:shadow-none md:hover:bg-muted md:dark:hover:bg-muted",
      )}
    >
      <SidebarSimple size={16} weight="regular" />
    </button>
  );

  return (
    <aside
      className={cn(
        "border-border bg-background flex h-full flex-col justify-between border-r py-3",
        // Mobile: fixed slide-over
        "fixed left-0 top-0 z-50 w-[280px] transition-transform duration-300 ease-out",
        expanded ? "translate-x-0" : "-translate-x-full",
        // Desktop: relative, width transition, no transform
        "md:relative md:h-screen md:translate-x-0 md:transition-[width] md:duration-200 md:ease-out",
        expanded ? "md:w-56" : "md:w-14",
      )}
    >
      <div className="flex flex-col gap-1 px-2">
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="flex max-w-none items-baseline gap-2"
            >
              <span>{toggleActionLabel}</span>
              <span className={cn("shrink-0 tabular-nums", "text-secondary")}>
                {toggleShortcutLabel}
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
        {topItems.map((item) => (
          <SidebarLink key={item.label} item={item} expanded={expanded} />
        ))}
      </div>
      <div className="flex flex-col gap-1 px-2">
        {bottomItems.map((item) => (
          <SidebarLink key={item.label} item={item} expanded={expanded} />
        ))}
        <AppearanceMenu expanded={expanded} />
      </div>
    </aside>
  );
}

function SidebarLink({ item, expanded }: { item: NavItem; expanded: boolean }) {
  const link = (
    <a
      href={item.href}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-primary hover:bg-muted flex h-11 md:h-10 cursor-pointer items-center rounded-md"
    >
      <span className="flex h-11 w-11 md:h-10 md:w-10 flex-none items-center justify-center [&_svg]:shrink-0">
        {item.icon}
      </span>
      <span
        className={cn(
          "truncate text-base md:text-sm transition-opacity duration-150",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {item.label}
      </span>
    </a>
  );

  return (
    <SidebarIconTooltip expanded={expanded} label={item.label}>
      {link}
    </SidebarIconTooltip>
  );
}

function SidebarIconTooltip({
  expanded,
  label,
  children,
}: {
  expanded: boolean;
  label: string;
  children: ReactElement;
}) {
  if (expanded) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
