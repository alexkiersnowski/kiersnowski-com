# kiersnowski.com

Portfolio of Alex Kiersnowski, Senior Product Designer & Design Engineer: [kiersnowski.com](https://kiersnowski.com).

The site is a small, editorial Next.js app: a home page with selected work and capabilities, a reusable case-study template, and a standalone printable CV.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router, static generation) with **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **[GSAP](https://gsap.com)** for intros, scroll reveals and cursor-following previews
- **React `<ViewTransition>`** for page-to-page transitions
- **Inter, Inter Tight and Geist Mono** via `next/font`
- **[Phosphor Icons](https://phosphoricons.com)**

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev     # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run cv:css` | Rebuild the CV stylesheet (see [CV](#cv)) |

## Project structure

```
app/
  page.tsx              Home: hero, selected work, capabilities, contact
  work/[slug]/page.tsx  Case-study route, statically generated per project
  not-found.tsx         Branded 404
  layout.tsx            Fonts, metadata, icons, no-JS fallback
  globals.css           Design tokens, type scale, page-transition styles
components/             UI: header and menu, work list, case study, demo player…
lib/
  projects.ts           All project data: copy, metadata and media
  site.ts               Name, role, bio, contact and socials
  intro.ts              Shared timing so page intros line up with transitions
public/
  images/<project>/     Case-study images and home-page previews
  videos/<project>/     Compressed demo videos
  cv/                   Standalone CV page, its compiled CSS, font and PDF
scripts/cv/             Build tooling for the CV stylesheet
```

## Editing content

Everything content-related lives in two files:

- **`lib/site.ts`:** name, role, bio, availability, email and social links.
- **`lib/projects.ts`:** one entry per project. The order sets the order on the home page, and the first project is the featured card on tablet.

### Adding a project

Add an object to `projects` in `lib/projects.ts`:

```ts
{
  slug: "my-project",              // URL: /work/my-project
  title: "My Project",
  services: "Product Design & Build",
  year: "2026",
  poster: "/images/my-project/my-project-preview.jpg", // home-page preview, 4:3
  about: "One-sentence description of the product.",
  scope: "The overview paragraph: the problem and what was built.",
  meta: { role: "Design Engineer" },
  outcomes: ["Proof it worked", "…"],
  stack: [{ label: "Front-end", items: ["Next.js", "TypeScript"] }],
  blocks: [
    { kind: "full", figure: { src: "/images/my-project/hero.jpg", alt: "…", caption: "…" } },
    { kind: "pair", figures: [{ src: "…", alt: "…", caption: "…" }, { src: "…", alt: "…", caption: "…" }] },
  ],
}
```

- **Pages:** the case-study page, its metadata and the "Next project" link are generated automatically.
- **Blocks:** a `full` block is one wide visual and a `pair` sits two side by side; mix them in any order.
- **Hero:** the first `full` block becomes the hero.
- **Demo video:** add `video` and `demo: true` to a figure to turn it into a click-to-play demo.

### Media guidelines

All images are served through `next/image`, which resizes them and converts them to AVIF/WebP on request. Commit high-quality JPG masters and don't pre-compress them.

| Use | Ratio | Recommended size |
| --- | --- | --- |
| Home-page preview (`poster`) | 4:3 | 1600×1200 |
| Full-width figure / hero | 16:9 | 2000×1125 |
| Pair figure | 4:5 | 1600×2000 |

Videos are self-hosted. Compress screen recordings to 1080p H.264 before committing, for example with macOS's built-in encoder:

```bash
avconvert --preset Preset1920x1080 --source master.mp4 --output public/videos/<project>/<name>-1080.mp4
```

Masters named `*_web.mp4` are gitignored.

## CV

`/cv` is a standalone, print-ready HTML page in `public/cv/index.html`, served through a rewrite in `next.config.ts`. It ships with a PDF download and has no third-party requests.

- **Styling:** its styles are Tailwind **v3** with the typography plugin, compiled to `public/cv/cv.css`. It uses v3 because the page was authored against v3's defaults.
- **Rebuilding:** after editing the CV markup, run `npm run cv:css`. The script installs v3 in a temporary folder, so the app's Tailwind v4 dependency is untouched.
- **Font:** Inter is self-hosted in `public/cv/fonts/`.

## Accessibility and motion

- Every animation respects `prefers-reduced-motion`.
- Content stays visible without JavaScript (a `noscript` fallback).
- Small text meets WCAG AA contrast.
- The menu and demo player are fully keyboard-operable.
- Page transitions use the View Transitions API. Browsers without it switch pages instantly.

## Deployment

The site is fully static and deploys to [Vercel](https://vercel.com) or any Node host with no configuration (`npm run build && npm run start`). No environment variables are required.
