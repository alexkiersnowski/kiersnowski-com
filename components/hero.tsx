"use client";

import { useRef } from "react";
import { ArrowDownIcon } from "@phosphor-icons/react/ssr";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RollText } from "@/components/roll-text";
import { introDelay, isFirstLoad } from "@/lib/intro";
import { site } from "@/lib/site";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  const last = rest.join(" ");
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const hero = heroRef.current!;
      const stage = hero.closest<HTMLElement>("[data-anim]");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const finish = () => {
        stage?.setAttribute("data-anim", "done");
        gsap.set(stage?.querySelectorAll("[data-reveal], [data-fade]") ?? [], {
          clearProps: "transform,opacity,visibility",
        });
      };

      if (reduce || !stage) {
        finish();
        return;
      }

      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const fades = gsap.utils.toArray<HTMLElement>(stage.querySelectorAll("[data-fade]"));
      // The nav only fades in on the first load; after navigation it's already on screen.
      const fadeNav = isFirstLoad();
      if (!fadeNav) gsap.set(fades, { autoAlpha: 1 });

      const tl = gsap
        .timeline({ delay: introDelay(), onComplete: finish })
        .fromTo(
          reveals,
          { y: 0, yPercent: 110 },
          { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.07 },
        );

      if (fadeNav) {
        tl.fromTo(
          fades,
          { autoAlpha: 0, y: -6 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.03 },
          0.1,
        );
      }

      // Name drifts up and dims as the work list scrolls in.
      gsap.to("[data-name]", {
        yPercent: -18,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: 0,
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="@container flex flex-1 flex-col justify-between pt-14 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12 short:pt-8 sm:short:pt-10 lg:short:pt-10 lg:short:pb-8"
    >
      <div data-name className="will-change-transform">
        <h1 className="font-display text-mega font-normal -ml-[0.04em] text-foreground max-lg:text-[min(19cqw,9rem)]">
          <span className="mask">
            <span data-reveal className="block">
              {first} <br className="lg:hidden" />
              {last}
            </span>
          </span>
        </h1>

        <h2 className="mt-4 sm:mt-6">
          <span className="mask">
            <span data-reveal className="block font-sans text-heading text-foreground">
              {site.role[0]}
              <br />
              {site.role[1]}
            </span>
          </span>
        </h2>
      </div>

      <div className="mt-24 flex flex-col gap-10 sm:mt-32 short:mt-12 sm:short:mt-12 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="max-w-[26.25em] text-[clamp(1.0625rem,0.9rem+0.35vw,1.25rem)] leading-snug font-normal tracking-[-0.01em] text-foreground">
            <span className="mask">
              <span data-reveal className="block">
                {site.bio}
              </span>
            </span>
          </p>
        </div>

        <span className="mask hidden lg:inline-block">
          <a
            data-reveal
            href="#selected-work"
            className="group inline-flex items-center gap-3 text-sm text-foreground"
          >
            <RollText>Selected work</RollText>
            <span className="flex size-8 items-center justify-center overflow-clip rounded-full border border-foreground/20 transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
              <ArrowDownIcon size={14} className="animate-[nudge_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
            </span>
          </a>
        </span>
      </div>
    </section>
  );
}
