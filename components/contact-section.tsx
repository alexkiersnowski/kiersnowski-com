import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { RollText } from "@/components/roll-text";
import { mailto, site } from "@/lib/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      // aria-label, not aria-labelledby: the heading holds the roll's duplicate copy, which
      // would be read twice in a name computed from it.
      aria-label="Contact"
      // @container so text-mega resolves against the section width, exactly as it does in the hero.
      className="@container pt-[clamp(7rem,16vw,18rem)] pb-[clamp(6rem,12vw,14rem)]"
    >
      <h2>
        <a
          href={mailto}
          className="group inline-flex items-end gap-[0.04em] font-display text-mega -ml-[0.04em] text-foreground max-lg:text-[min(19cqw,9rem)] lg:items-center"
        >
          {/* Same size and stacking as the hero name on phones; one line from tablet up. */}
          <RollText>
            Let’s <br className="sm:hidden" />
            build
          </RollText>
          <ArrowUpRightIcon weight="bold" className="size-[1em] shrink-0" />
        </a>
      </h2>

      <a
        href={mailto}
        className="group mt-10 inline-flex items-center gap-2 text-lg text-foreground sm:mt-12"
      >
        <RollText>{site.email}</RollText>
        <ArrowUpRightIcon size={16} />
      </a>
    </section>
  );
}
