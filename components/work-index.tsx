"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ProjectMedia } from "@/components/project-media";
import { projects } from "@/lib/projects";

gsap.registerPlugin(useGSAP);

/** Large-screen work list: editorial rows with a cursor-following preview. */
export function WorkIndex({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const list = listRef.current!;
      const frame = frameRef.current!;
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", frame);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rows = gsap.utils.toArray<HTMLAnchorElement>("[data-row]", list);

      gsap.set(frame, { xPercent: -50, yPercent: -50, scale: 0.85, autoAlpha: 0 });

      const follow = (duration: number) => ({ duration: reduce ? 0 : duration, ease: "power3.out" });
      // The preview stands in for the cursor, so it tracks the pointer near-instantly.
      const frameX = gsap.quickTo(frame, "x", follow(0.12));
      const frameY = gsap.quickTo(frame, "y", follow(0.12));

      const moveTo = (x: number, y: number) => {
        frameX(x);
        frameY(y);
      };

      // Snappy pop: both directions ease out so the motion starts immediately.
      let shown = false;
      const toggle = (visible: boolean) => {
        if (visible === shown) return;
        shown = visible;
        gsap.to(frame, {
          scale: visible ? 1 : 0.85,
          autoAlpha: visible ? 1 : 0,
          duration: reduce ? 0 : visible ? 0.25 : 0.18,
          ease: visible ? "power3.out" : "power2.out",
          overwrite: "auto",
        });
      };

      // Crossfade: the new preview fades in on top of the old one, which is
      // hidden once covered so there's no dip to the background.
      let current = -1;
      let depth = 1;
      const select = (index: number) => {
        if (index === current) return;
        setActive(index);
        const incoming = layers[index];
        gsap.set(incoming, { zIndex: ++depth });
        gsap.fromTo(
          incoming,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: reduce ? 0 : 0.3,
            ease: "power1.inOut",
            overwrite: "auto",
            onComplete: () => {
              layers.forEach((layer, i) => {
                if (i !== current) gsap.set(layer, { autoAlpha: 0 });
              });
            },
          },
        );
        current = index;
      };

      // Mouse and hovering Apple Pencil (iPadOS reports pen hover as pointer events) get the
      // preview; fingers don't, so tapping a row on a tablet just opens the project.
      const hovers = (event: PointerEvent) => event.pointerType === "mouse" || event.pointerType === "pen";

      const point = (event: PointerEvent) => {
        const rect = list.getBoundingClientRect();
        moveTo(event.clientX - rect.left, event.clientY - rect.top);
        // Re-show after a scroll hid it, once the pointer moves over the list again.
        if (!shown && hovers(event)) toggle(true);
      };

      // Scrolling doesn't move the pointer, so no leave event fires; close right away instead.
      const onScroll = () => {
        if (shown && !list.contains(document.activeElement)) toggle(false);
      };

      const onEnter = (event: PointerEvent) => {
        if (!hovers(event)) return;
        const rect = list.getBoundingClientRect();
        // Jump into place first so the frame doesn't fly in from its last position.
        gsap.set(frame, { x: event.clientX - rect.left, y: event.clientY - rect.top });
        toggle(true);
      };

      const onLeave = () => {
        toggle(false);
        setActive(null);
      };

      const cleanups = rows.map((row, index) => {
        const onRowEnter = () => select(index);
        // Keyboard focus mirrors hover: anchor the preview in the gap before Services.
        const onFocus = () => {
          if (!row.matches(":focus-visible")) return;
          const listRect = list.getBoundingClientRect();
          const rowRect = row.getBoundingClientRect();
          moveTo(rowRect.width * 0.42, rowRect.top - listRect.top + rowRect.height / 2);
          select(index);
          toggle(true);
        };
        const onBlur = () => onLeave();

        row.addEventListener("pointerenter", onRowEnter);
        row.addEventListener("focus", onFocus);
        row.addEventListener("blur", onBlur);
        return () => {
          row.removeEventListener("pointerenter", onRowEnter);
          row.removeEventListener("focus", onFocus);
          row.removeEventListener("blur", onBlur);
        };
      });

      list.addEventListener("pointerenter", onEnter);
      list.addEventListener("pointermove", point);
      list.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        list.removeEventListener("pointerenter", onEnter);
        list.removeEventListener("pointermove", point);
        list.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("scroll", onScroll);
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      <h2 className="sr-only">Selected work</h2>

      <div className="relative">
        <ul ref={listRef} className="border-t border-foreground/10 [@media(hover:hover)_and_(pointer:fine)]:cursor-none">
          {projects.map((project) => (
            <li key={project.slug} className="border-b border-foreground/10">
              <Link
                data-row
                href={`/work/${project.slug}`}
                aria-labelledby={`work-index-${project.slug}`}
                aria-describedby={`work-index-${project.slug}-meta`}
                className="group grid grid-cols-12 [@media(hover:hover)_and_(pointer:fine)]:cursor-none items-center gap-8 px-10 py-[clamp(2.5rem,5.5vw,6rem)] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-foreground"
              >
                <span className="col-span-7 type-title text-[clamp(2.5rem,4.5vw,5rem)] text-foreground transition-[color,translate] duration-250 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-translate-x-2 group-hover:text-foreground/40 group-focus-visible:-translate-x-2 group-focus-visible:text-foreground/40"
                  id={`work-index-${project.slug}`}
                >
                  {project.title}
                </span>
                <span id={`work-index-${project.slug}-meta`} className="col-span-5 grid grid-cols-5 gap-8">
                  <span className="col-span-3 text-lg text-foreground">{project.services}</span>
                  <span className="col-span-2 text-right text-lg text-foreground tabular-nums">
                    {project.year}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-10">
          <div
            ref={frameRef}
            className="invisible absolute top-0 left-0 aspect-[4/3] w-[min(26vw,30rem)] overflow-clip rounded-xl opacity-0"
          >
            <div className="absolute inset-0">
              {projects.map((project, index) => (
                <div key={project.slug} data-layer className="invisible absolute inset-0 opacity-0">
                  <ProjectMedia
                    project={project}
                    index={index}
                    active={active === index}
                    sizes="min(26vw, 30rem)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
