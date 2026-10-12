"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Availability } from "@/components/availability";
import { MenuButton } from "@/components/menu-button";
import { shellClass } from "@/components/page-shell";
import { RollText } from "@/components/roll-text";
import { SiteMenu } from "@/components/site-menu";
import { WarsawTime } from "@/components/warsaw-time";
import { site } from "@/lib/site";
import { cn } from "cn";

/**
 * static: in normal flow at the top of the page.
 * hidden: fixed and slid out of view (scrolling down).
 * shown:  fixed glass bar (scrolling up).
 */
type BarMode = "static" | "hidden" | "shown";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BarMode>("static");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const openRef = useRef(open);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const placeholder = placeholderRef.current!;
    const bar = barRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current: BarMode = "static";
    let lastY = window.scrollY;
    let frame = 0;

    const apply = (next: BarMode) => {
      if (next === current) return;
      const prev = current;
      current = next;
      gsap.killTweensOf(bar);

      if (next === "static") {
        placeholder.style.height = "";
        gsap.set(bar, { clearProps: "transform" });
      } else {
        // Hold the in-flow height so content doesn't jump when the bar goes fixed.
        if (prev === "static") {
          placeholder.style.height = `${placeholder.offsetHeight}px`;
          gsap.set(bar, { yPercent: -100 });
        }
        if (next === "shown") {
          gsap.to(bar, {
            yPercent: 0,
            duration: reduce ? 0 : 0.45,
            ease: "power3.out",
            // A lingering transform would trap the menu's fixed scrim inside the bar.
            onComplete: () => gsap.set(bar, { clearProps: "transform" }),
          });
        } else {
          gsap.to(bar, { yPercent: -100, duration: reduce ? 0 : 0.35, ease: "power2.in" });
        }
      }

      setMode(next);
    };

    const update = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      if (openRef.current) return;
      if (y <= 0) return apply("static");
      if (Math.abs(delta) < 4) return;
      // While in flow, let the header scroll away naturally until it's out of view.
      if (current === "static" && y <= placeholder.offsetHeight) return;
      apply(delta > 0 ? "hidden" : "shown");
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      gsap.killTweensOf(bar);
    };
  }, []);

  const fixed = mode !== "static";

  return (
    // data-site-header: named only during page transitions so the nav stays put (globals.css).
    <div ref={placeholderRef} data-site-header>
      <header
        ref={barRef}
        className={cn("z-[60]", fixed ? "fixed inset-x-0 top-0" : "relative")}
      >
        {/* Glass lives on its own layer: backdrop-filter on the header would trap the menu scrim. */}
        <div
          aria-hidden="true"
          className={cn(
            // Phones get a solid bar: iOS Safari tints its status bar from this layer, and a solid
            // colour keeps that tint identical whether the bar is shown or hidden.
            "pointer-events-none absolute inset-0 -z-10 border-b bg-background transition-opacity duration-300 sm:bg-background/65 sm:backdrop-blur-xl sm:backdrop-saturate-150",
            fixed ? "border-foreground/[0.06] opacity-100" : "border-transparent opacity-0",
          )}
        />

        <div
          className={cn(fixed ? cn(shellClass, "py-3 sm:py-4") : "py-5 sm:py-6 lg:py-8 lg:short:py-5")}
        >
          <div className="relative">
            <SiteMenu open={open} onClose={close} triggerRef={triggerRef} />

            {/* Logo and button sit above the panel; the meta stays beneath it and the scrim. */}
            <div className="flex h-10 items-center justify-between gap-4">
              <Link
                data-fade
                href="/"
                className={cn(
                  "group relative z-20 text-sm font-normal text-foreground transition-[opacity,visibility] duration-300",
                  open && "max-sm:pointer-events-none max-sm:invisible max-sm:opacity-0",
                )}
              >
                <RollText>{site.logo}</RollText>
              </Link>

              <div className="flex items-center gap-8">
                <div data-fade className="hidden items-center gap-10 lg:flex">
                  <Availability />
                  <WarsawTime />
                </div>

                <div data-fade className="relative z-20">
                  <MenuButton ref={triggerRef} open={open} onToggle={() => setOpen((v) => !v)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
