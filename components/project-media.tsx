"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { placeholderBackground } from "@/lib/placeholder";
import type { Project } from "@/lib/projects";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "cn";

type ProjectMediaProps = {
  project: Project;
  index: number;
  /** Plays the video while true; pauses and rewinds when it turns false. */
  active: boolean;
  sizes: string;
  className?: string;
};

export function ProjectMedia({ project, index, active, sizes, className }: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = usePrefersReducedMotion();
  const showVideo = Boolean(project.video) && !reduce;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active, showVideo]);

  return (
    <div className={cn("relative size-full overflow-clip bg-muted", className)}>
      {project.poster ? (
        <Image src={project.poster} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundImage: placeholderBackground(index) }}
        >
          <span className="type-title text-[clamp(1.5rem,3vw,3rem)] text-white/70">
            {project.title}
          </span>
        </div>
      )}

      {showVideo ? (
        <video
          ref={videoRef}
          src={project.video}
          poster={project.poster}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </div>
  );
}
