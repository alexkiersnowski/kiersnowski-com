import { ViewTransition } from "react";
import { CapabilitiesSection } from "@/components/capabilities-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkList } from "@/components/work-list";

export default function Home() {
  return (
    // Page-level transition: blur out to white, rise in from white (see globals.css).
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <PageShell>
        <div data-anim="pending" className="flex min-h-svh flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            <Hero />
          </main>
        </div>
        <WorkList />
        <CapabilitiesSection />
        <ContactSection />
        <SiteFooter />
      </PageShell>
    </ViewTransition>
  );
}
