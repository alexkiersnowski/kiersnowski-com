"use client";

import { forwardRef, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { RollText } from "@/components/roll-text";

gsap.registerPlugin(useGSAP);

type MenuButtonProps = {
  open: boolean;
  onToggle: () => void;
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ open, onToggle }, ref) {
    const iconRef = useRef<HTMLSpanElement>(null);

    useGSAP(
      () => {
        const [top, bottom] = gsap.utils.toArray<HTMLElement>("[data-line]");
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const vars = { duration: reduce ? 0 : 0.35, ease: "power3.inOut" };

        gsap.to(top, { y: open ? 3 : 0, rotate: open ? 45 : 0, ...vars });
        gsap.to(bottom, { y: open ? -3 : 0, rotate: open ? -45 : 0, ...vars });
      },
      { scope: iconRef, dependencies: [open] },
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="group/menu inline-flex h-10 cursor-pointer items-center gap-3 rounded-full pl-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RollText alt="Close" active={open} className="hidden sm:inline-grid">
          Menu
        </RollText>
        <span
          ref={iconRef}
          className="relative flex size-10 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors duration-300 group-hover/menu:bg-foreground group-hover/menu:text-background"
        >
          <span className="flex w-4 flex-col gap-[5px]">
            <span data-line className="h-px w-full origin-center bg-current" />
            <span data-line className="h-px w-full origin-center bg-current" />
          </span>
        </span>
      </button>
    );
  },
);
