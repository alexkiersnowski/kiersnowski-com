import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { CaseStudyMotion } from "@/components/case-study-motion";
import { DemoPlayer } from "@/components/demo-player";
import { MediaFrame } from "@/components/media-frame";
import { RollText } from "@/components/roll-text";
import type { Figure, MediaBlock, Project } from "@/lib/projects";
import { cn } from "cn";

// Labels use the darker secondary grey so they hold up on low-brightness screens.
const labelClass = "font-mono text-xs tracking-wider text-secondary-text uppercase";

/** Reading measure for all text; images get the wider stage below. */
const textColumn = "mx-auto w-full max-w-[72rem]";
const mediaColumn = "mx-auto w-full max-w-[96rem]";

/** A line that rises out of its mask during the intro. */
function Reveal({ children }: { children: ReactNode }) {
  return (
    <span className="mask block">
      <span data-reveal className="block">
        {children}
      </span>
    </span>
  );
}

/** Agency-style meta cell: label, hairline, value. */
function MetaCell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    // The whole cell (label, hairline, value) enters as one unit in the intro.
    <div data-intro className={className}>
      <p className={cn(labelClass, "border-b border-foreground/10 pb-4")}>{label}</p>
      <div className="mt-4 text-lg leading-snug text-foreground">{children}</div>
    </div>
  );
}

/** One block: mono label above its content. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h2 className={labelClass}>{label}</h2>
      <div className="mt-4 max-w-[48em] text-lg leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function FigureBlock({
  figure,
  number,
  aspect,
  sizes,
  preload = false,
}: {
  figure: Figure;
  number: number;
  aspect: string;
  sizes: string;
  preload?: boolean;
}) {
  return (
    <figure>
      {figure.demo ? (
        // Demos keep 16:9 at every size so app UI isn't cropped on phones.
        <DemoPlayer media={figure} sizes={sizes} className="aspect-video max-h-[85svh] w-full" />
      ) : (
        <MediaFrame media={figure} seed={number} sizes={sizes} preload={preload} className={aspect} />
      )}
      <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">{figure.caption}</figcaption>
    </figure>
  );
}

/** Renders a media row and advances the shared figure counter. */
function Block({ block, next, hero = false }: { block: MediaBlock; next: () => number; hero?: boolean }) {
  if (block.kind === "full") {
    const aspect = block.ratio === "16/9" ? "aspect-video w-full" : "aspect-[4/3] max-h-[85svh] w-full sm:aspect-[16/9]";
    return (
      <FigureBlock
        figure={block.figure}
        number={next()}
        aspect={aspect}
        sizes="(min-width: 1536px) 1536px, 100vw"
        // The hero is the page's LCP image, so it preloads.
        preload={hero}
      />
    );
  }
  return (
    <div className="grid gap-x-[clamp(1rem,2vw,2rem)] gap-y-[clamp(4rem,8vw,8rem)] sm:grid-cols-2">
      {block.figures.map((figure) => {
        const number = next();
        return (
          <FigureBlock key={number} figure={figure} number={number} aspect="aspect-[4/5]" sizes="(min-width: 640px) 50vw, 100vw" />
        );
      })}
    </div>
  );
}

/** Reusable case-study layout. Content, metadata and media order all come from the project data. */
export function CaseStudy({ project, next }: { project: Project; next: Project }) {
  let count = 0;
  const nextNumber = () => ++count;

  // A leading full-width block becomes the hero visual straight after the metadata.
  const [first, ...rest] = project.blocks;
  const hero = first?.kind === "full" ? first : undefined;
  const blocks = hero ? rest : project.blocks;

  return (
    <CaseStudyMotion>
      <header className={cn(textColumn, "pt-[clamp(4rem,10vw,10rem)]")}>
        <h1 className="font-display text-[clamp(3.5rem,2.6rem+3.6vw,6.5rem)] leading-[0.95] font-[450] tracking-[-0.035em] text-foreground">
          <Reveal>{project.title}</Reveal>
        </h1>

        {/* About carries the paragraph, so it takes a little more of the row than Role and Year. */}
        {/* Phones: About full width, Role and Year side by side beneath it. */}
        <div className="mt-[clamp(3rem,7vw,7rem)] grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-8">
          <MetaCell label="About" className="col-span-2 sm:col-span-1">
            {project.about}
          </MetaCell>
          <MetaCell label="Role">{project.meta.role}</MetaCell>
          <MetaCell label="Year">{project.year}</MetaCell>
        </div>
      </header>

      {hero ? (
        <div data-intro data-hero className={cn(mediaColumn, "relative mt-[clamp(4rem,8vw,8rem)]")}>
          {project.meta.link ? (
            <a
              href={project.meta.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group absolute top-0 right-[clamp(1.5rem,6vw,8rem)] z-10 flex size-[clamp(6.5rem,10vw,9rem)] -translate-y-1/2 items-center justify-center gap-1 rounded-full bg-foreground text-sm text-background transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <RollText>{project.meta.link.label}</RollText>
              <ArrowUpRightIcon size={14} />
            </a>
          ) : null}
          <Block block={hero} next={nextNumber} hero />
        </div>
      ) : null}

      {/* Overview and stack share one centred reading column, so the dividers end where the text does. */}
      {/* A centred 768px reading column: each block has its label above and shares one text style. */}
      <section data-block aria-label="Overview" className="mx-auto mt-[clamp(5rem,10vw,10rem)] flex w-full max-w-[48rem] flex-col gap-[clamp(3rem,5vw,4.5rem)]">
        <Row label="Overview">
          <p>{project.scope}</p>
        </Row>

        {project.outcomes?.length ? (
          <Row label="Outcomes">
            <ul className="flex flex-col gap-2">
              {project.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-4">
                  <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-foreground" />
                  {outcome}
                </li>
              ))}
            </ul>
          </Row>
        ) : null}

        {/* Stack rows are one cluster, so they sit tighter than the sections above. */}
        <div className="flex flex-col gap-8">
          {project.stack.map((group) => (
            <Row key={group.label} label={group.label}>
              <p>{group.items.join(" · ")}</p>
            </Row>
          ))}
        </div>
      </section>

      <section aria-label="Visuals" className={cn(mediaColumn, "mt-[clamp(5rem,10vw,10rem)] flex flex-col gap-y-[clamp(4rem,8vw,8rem)]")}>
        {blocks.map((block, index) => (
          <div key={index} data-block>
            <Block block={block} next={nextNumber} />
          </div>
        ))}
      </section>

      {/* Eyebrow above the title, centred as the page's closing statement. */}
      <nav aria-label="Next project" className={cn(textColumn, "mt-[clamp(6rem,12vw,12rem)]")}>
        <Link
          href={`/work/${next.slug}`}
          className="group flex flex-col items-center gap-6 border-t border-foreground/10 py-[clamp(4rem,8vw,8rem)] text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-foreground"
        >
          <span className={labelClass}>Next project</span>
          {/* leading-[1.15]: the hover roll clips to its line box, so descenders (Nord Security's y) need room. */}
          <span className="inline-flex items-center gap-[0.15em] font-display text-[clamp(3.5rem,2.6rem+3.6vw,6.5rem)] leading-[1.15] font-[450] tracking-[-0.035em] text-foreground">
            <RollText>{next.title}</RollText>
            <ArrowUpRightIcon weight="bold" className="size-[0.8em] shrink-0" />
          </span>
        </Link>
      </nav>
    </CaseStudyMotion>
  );
}
