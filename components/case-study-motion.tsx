"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { introDelay } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Case-study motion, in hierarchy order: title rises from its mask, then the meta cells
 * (About → Role → Year) fade up as whole units, then the hero visual. Below-fold blocks fade
 * up once on scroll. Reduced motion renders everything in place.
 */
export function CaseStudyMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const title = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const intro = gsap.utils.toArray<HTMLElement>("[data-intro]");
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]");
      const done = () => root.setAttribute("data-anim", "done");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        done();
        return;
      }

      // Blocks already on screen at load join the end of the intro instead of firing on their own.
      const inView = blocks.filter((block) => block.getBoundingClientRect().top < window.innerHeight * 0.88);
      const later = blocks.filter((block) => !inView.includes(block));

      gsap.set([...intro, ...blocks], { autoAlpha: 0 });
      done();

      gsap
        .timeline({ delay: introDelay() })
        .fromTo(title, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: "expo.out", clearProps: "transform" })
        .fromTo(
          intro.filter((el) => !el.hasAttribute("data-hero")),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, clearProps: "transform" },
          0.15,
        )
        .fromTo(
          intro.filter((el) => el.hasAttribute("data-hero")),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", clearProps: "transform" },
          0.35,
        )
        .fromTo(
          inView,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, clearProps: "transform" },
          0.5,
        );

      later.forEach((block) => {
        gsap.fromTo(
          block,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: block, start: "top 88%", once: true },
          },
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} data-anim="pending">
      {children}
    </div>
  );
}
