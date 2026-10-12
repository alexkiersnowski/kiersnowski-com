import { WorkCards } from "@/components/work-cards";
import { WorkIndex } from "@/components/work-index";

export function WorkList() {
  return (
    <section className="pt-[clamp(5rem,10vw,12rem)] pb-[clamp(6rem,12vw,14rem)]">
      {/* Anchor sits on the list itself so "Selected work" lands on the first project, not the padding. */}
      <div id="selected-work" className="scroll-mt-[clamp(1.5rem,3vw,3rem)]">
        {/* Only one is displayed at a time, so assistive tech never sees duplicate links. */}
        <WorkIndex className="hidden lg:block" />
        <WorkCards className="lg:hidden" />
      </div>
    </section>
  );
}
