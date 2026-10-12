import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { PageShell } from "@/components/page-shell";
import { RollText } from "@/components/roll-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex min-h-[min(80svh,48rem)] flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col justify-center py-[clamp(4rem,10vw,10rem)]">
          <p className="font-mono text-xs tracking-wider text-secondary-text uppercase">404</p>
          <h1 className="mt-4 font-display text-[clamp(3.5rem,2.6rem+3.6vw,6.5rem)] leading-[0.95] font-[450] tracking-[-0.035em] text-foreground">
            Page not found
          </h1>
          <p className="mt-6 max-w-[30em] text-lg leading-relaxed text-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          </p>
          <Link href="/" className="group mt-10 inline-flex items-center gap-2 self-start text-lg text-foreground">
            <RollText>Back home</RollText>
            <ArrowUpRightIcon size={16} />
          </Link>
        </main>
      </div>
      <SiteFooter />
    </PageShell>
  );
}
