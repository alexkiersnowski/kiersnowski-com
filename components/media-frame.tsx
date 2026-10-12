"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { placeholderBackground } from "@/lib/placeholder";
import type { Media } from "@/lib/projects";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "cn";

type MediaFrameProps = {
  media: Media;
  /** Varies the placeholder gradient so neighbouring frames don't look identical. */
  seed: number;
  sizes: string;
  /** Preload as the page's LCP image (the case-study hero). */
  preload?: boolean;
  className?: string;
};

/** Case-study visual: video (played only while in view), poster image, or grain placeholder. */
export function MediaFrame({ media, seed, sizes, preload = false, className }: MediaFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = usePrefersReducedMotion();
  const showVideo = Boolean(media.video) && !reduce;
  const still = media.poster ?? media.src;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(frameRef.current!);
    return () => observer.disconnect();
  }, [showVideo]);

  return (
    <div ref={frameRef} className={cn("relative overflow-clip rounded-2xl bg-muted", className)}>
      {still ? (
        <Image
          src={still}
          alt={showVideo ? "" : media.alt}
          fill
          sizes={sizes}
          quality={90}
          preload={preload}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={media.alt}
          className="absolute inset-0"
          style={{ backgroundImage: placeholderBackground(seed) }}
        />
      )}

      {showVideo ? (
        <video
          ref={videoRef}
          src={media.video}
          // No poster: the optimised <Image> beneath already shows the frame (avoids a raw JPG download).
          aria-label={media.alt}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </div>
  );
}
