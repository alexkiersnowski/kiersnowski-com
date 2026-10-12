import type { Metadata } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNextProject, getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Not found" };
  }

  return { title: project.title, description: project.scope };
}

export default async function WorkPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    // Page-level transition: blur out to white, rise in from white (see globals.css).
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <PageShell>
        <SiteHeader />
        <main>
          <CaseStudy project={project} next={getNextProject(slug)} />
        </main>
        <SiteFooter />
      </PageShell>
    </ViewTransition>
  );
}
