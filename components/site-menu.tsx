"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { RollText } from "@/components/roll-text";
import { WarsawTime } from "@/components/warsaw-time";
import { mailto, site } from "@/lib/site";

gsap.registerPlugin(useGSAP);

// Diameter of the circle the panel grows out of, centred on the menu icon.
const ORIGIN = 64;

type NavItem = {
  label: string;
  href: string;
  /** Plain anchor with an arrow; `newTab` opens it in a new tab (e.g. the CV). */
  external?: boolean;
  newTab?: boolean;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "CV / Resume", href: site.cv, external: true, newTab: true },
  { label: "Contact", href: mailto, external: true },
];

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function SiteMenu({ open, onClose, triggerRef }: SiteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const closeRef = useRef<gsap.core.Timeline | null>(null);
  const unlockRef = useRef<number | undefined>(undefined);
  const keyboardRef = useRef(false);

  // Track input modality: programmatic focus always shows a ring on iOS Safari, so focus is only
  // moved for keyboard users (who need it) and left alone after taps and clicks.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.altKey && !event.ctrlKey) keyboardRef.current = true;
    };
    const onPointer = () => {
      keyboardRef.current = false;
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);

  useGSAP(
    () => {
      const panel = panelRef.current!;
      const scrim = "[data-menu-scrim]";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = tlRef.current;

      // Close: blur-fade out in place, then reset the open timeline offstage.
      if (!open) {
        if (!tl) return;
        tl.pause();
        if (reduce) {
          tl.progress(0);
          return;
        }
        closeRef.current = gsap
          .timeline({
            onComplete: () => {
              tl.progress(0);
              gsap.set(panel, { clearProps: "filter,scale" });
            },
          })
          .to(panel, {
            autoAlpha: 0,
            filter: "blur(10px)",
            scale: 0.98,
            transformOrigin: "top right",
            duration: 0.45,
            ease: "power2.out",
          })
          .to(scrim, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 0);
        return;
      }

      // Open: always rebuild from the panel's current size.
      closeRef.current?.kill();
      tl?.kill();
      gsap.set(panel, { clearProps: "filter,scale" });

      const next = gsap.timeline({ paused: true });
      next.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0);

      if (window.matchMedia("(max-width: 639px)").matches) {
        // Phones: the sheet is near full screen, so a blur fade reads better than growing from
        // the button, and links fade up rather than rising through masks that clip large type.
        gsap.set(panel, { clipPath: "none" });
        next
          .fromTo(
            panel,
            { autoAlpha: 0, filter: "blur(8px)" },
            { autoAlpha: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out", clearProps: "filter" },
            0,
          )
          .fromTo(
            "[data-menu-reveal]",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.04 },
            0.08,
          );
      } else {
        const { width, height } = panel.getBoundingClientRect();
        const from = `inset(0px 0px ${height - ORIGIN}px ${width - ORIGIN}px round ${ORIGIN / 2}px)`;
        const to = "inset(0px 0px 0px 0px round 24px)";
        next
          .fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0)
          .fromTo(panel, { clipPath: from }, { clipPath: to, duration: 0.5, ease: "power4.inOut" }, 0)
          .fromTo(
            "[data-menu-reveal]",
            { yPercent: 115 },
            { yPercent: 0, duration: 0.55, ease: "expo.out", stagger: 0.03 },
            0.18,
          );
      }

      next.fromTo(
        "[data-menu-fade]",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.03 },
        0.3,
      );
      tlRef.current = next;

      if (reduce) next.progress(1);
      else next.play();
    },
    { scope: rootRef, dependencies: [open] },
  );

  // Lock scroll, make the rest of the page inert, and wire up Escape.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    window.clearTimeout(unlockRef.current);
    root.style.overflow = "hidden";

    const inerted: HTMLElement[] = [];
    let node = rootRef.current?.closest("header") as HTMLElement | null;
    while (node && node !== document.body) {
      for (const sibling of Array.from(node.parentElement?.children ?? [])) {
        if (sibling !== node && sibling instanceof HTMLElement && !sibling.inert) {
          sibling.inert = true;
          inerted.push(sibling);
        }
      }
      node = node.parentElement;
    }

    // Wait until GSAP has made the panel visible before moving focus.
    const viaKeyboard = keyboardRef.current;
    const focusTimer = window.setTimeout(() => {
      if (!viaKeyboard) return;
      panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    }, 80);

    const trigger = triggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      // Unlock scroll only after the close fade (0.45s): changing <html> overflow mid-fade makes
      // iOS Safari re-layout and skip repainting the fixed scrim, so it hangs and then cuts out.
      unlockRef.current = window.setTimeout(() => {
        root.style.overflow = "";
      }, 460);
      inerted.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKeyDown);
      // Closing by Escape counts as keyboard too, so check modality at close time.
      if (keyboardRef.current) trigger?.focus({ preventScroll: true });
    };
  }, [open, onClose, triggerRef]);

  return (
    <div ref={rootRef}>
      {/* iOS Safari tints its toolbars from fixed layers at the screen edges and can't animate it,
          so a dark scrim flashes them on phones. There the scrim is page-white instead: it hides the
          content behind the bordered sheet and gives Safari nothing to change colour to. */}
      <div
        data-menu-scrim
        aria-hidden="true"
        onClick={onClose}
        className="invisible fixed inset-0 z-[5] transform-gpu bg-background opacity-0 will-change-[opacity] sm:bg-foreground/50"
      />

      <div
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="invisible fixed inset-0 z-10 flex flex-col overflow-y-auto bg-popover px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground opacity-0 sm:absolute sm:inset-auto sm:-top-3 sm:-right-3 sm:max-h-[calc(100dvh-0.5rem)] sm:w-[min(40rem,calc(100%+1.5rem))] sm:rounded-3xl sm:p-8 sm:pt-5"
      >
        <div
          data-menu-fade
          className="flex h-10 items-center pr-16 sm:pr-28"
        >
          <WarsawTime />
        </div>

        <nav aria-label="Primary" className="group/nav mt-12 sm:mt-16">
          <ul className="flex flex-col gap-6">
            {navItems.map((item) => {
              const { external, newTab } = item;
              const className =
                "group flex type-title text-[clamp(2.75rem,5vw,3rem)] leading-[1.1] text-foreground transition-opacity duration-300 group-hover/nav:opacity-35 hover:opacity-100! focus-visible:opacity-100! outline-none";
              const inner = (
                <span className="mask">
                  <span data-menu-reveal className="flex items-center gap-[0.18em]">
                    <RollText>{item.label}</RollText>
                    {external ? (
                      <ArrowUpRightIcon weight="bold" className="size-[1em]" />
                    ) : null}
                  </span>
                </span>
              );

              return (
                <li key={item.href}>
                  {external ? (
                    <a
                      href={item.href}
                      onClick={onClose}
                      className={className}
                      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link href={item.href} onClick={onClose} className={className}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-6 pt-14 sm:mt-0 sm:flex-row sm:items-end sm:justify-between sm:pt-20">
          <a
            data-menu-fade
            href={mailto}
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 self-start text-sm text-foreground"
          >
            <RollText>{site.email}</RollText>
            <ArrowUpRightIcon size={14} />
          </a>
          <ul className="flex gap-5">
            {site.socials.map((social) => (
              <li key={social.label} data-menu-fade>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-sm text-foreground"
                >
                  <RollText>{social.label}</RollText>
                  <ArrowUpRightIcon size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
