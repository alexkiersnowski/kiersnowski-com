"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProjectMedia } from "@/components/project-media";
import { projects, type Project } from "@/lib/projects";
import { cn } from "cn";

function WorkCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [inView, setInView] = useState(false);

  // Touch devices have no hover, so play the recording while the card is on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.6,
    });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      aria-labelledby={`work-card-${project.slug}`}
      aria-describedby={`work-card-${project.slug}-meta`}
      className="group block outline-none"
    >
      <div
        className={cn(
          // 4:3 everywhere, matching the desktop hover preview, so one preview image fits every size.
          "aspect-[4/3] overflow-clip rounded-2xl outline-offset-4 outline-foreground group-focus-visible:outline-2",
        )}
      >
        <ProjectMedia
          project={project}
          index={index}
          active={inView}
          sizes="100vw"
          className="transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.025] group-focus-visible:scale-[1.025]"
        />
      </div>
      <h3 id={`work-card-${project.slug}`} className="mt-6 type-title text-4xl text-foreground">
        {project.title}
      </h3>
      <div
        id={`work-card-${project.slug}-meta`}
        className="mt-4 flex items-baseline justify-between gap-4 border-t border-foreground/10 pt-4 text-foreground"
      >
        <span>{project.services}</span>
        <span className="shrink-0 tabular-nums">{project.year}</span>
      </div>
    </Link>
  );
}

/** Small-screen work list: image cards with details underneath. */
export function WorkCards({ className }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className="pb-6 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
        Selected work
      </h2>
      {/* One column on phones and tablets: every project card is the same size. */}
      <ul className="grid gap-y-14">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <WorkCard project={project} index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}
