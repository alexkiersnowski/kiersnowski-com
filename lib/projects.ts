/** Media files live in public/work/<slug>/. Anything left unset renders the grain placeholder. */
export type Media = {
  src?: string;
  poster?: string;
  video?: string;
  alt: string;
  /** Click-to-play demo with sound and controls (instead of a muted ambient loop). */
  demo?: boolean;
};

/** A captioned visual. */
export type Figure = Media & { caption: string };

/** One row of the case study: a single full-width key visual, or two side by side. */
export type MediaBlock =
  | { kind: "full"; figure: Figure }
  | { kind: "pair"; figures: [Figure, Figure] };

export type Project = {
  slug: string;
  title: string;
  services: string;
  year: string;
  /** Home-page list preview. */
  poster?: string;
  video?: string;

  /** Case study. Copy below is drafted from the CV; refine before launch. */
  /** Short "About" paragraph beside Role and Year: what the product is. */
  about: string;
  /** The pitch paragraph, shown before the hero visual. */
  scope: string;
  meta: {
    role: string;
    link?: { label: string; href: string };
  };
  /** Proof it worked: shown as bullets between the overview and the stack. */
  outcomes?: string[];
  stack: { label: string; items: string[] }[];
  blocks: MediaBlock[];
};

export const projects: Project[] = [
  {
    slug: "fiive",
    title: "Fiive",
    services: "Product Design & Full-Stack Build",
    year: "2024–2026",
    poster: "/images/fiive/fiive-preview.jpg",
    about:
      "Two-way multi-tenant platform for agencies and clients to manage their work together",
    scope:
      "Agencies and clients operate in different tools with no shared visibility. Requests get lost in email, status lives in agency-only tools, clients have little transparency. Fiive centralised everything in one shared workspace for both sides to manage work together.",
    meta: {
      role: "Founder & Design Engineer",
    },
    outcomes: [
      "Launched to 20+ organisations across the UK and EU",
      "Cut a 6–12 month build to 12 weeks with AI-assisted development",
      "Performance-tested to 10,000+ tasks and requests per organisation",
      "Built solo, removing an estimated €250–500K funding requirement",
    ],
    stack: [
      { label: "Front-end", items: ["Next.js", "React", "TypeScript", "Tailwind", "Radix", "React Hook Form", "Zod", "TanStack"] },
      { label: "Back-end", items: ["Supabase (Postgres, Auth, RLS)", "Stripe", "Resend", "Vercel"] },
    ],
    blocks: [
      {
        kind: "full",
        figure: {
          alt: "Fiive product demo: the shared agency–client workspace",
          poster: "/images/fiive/fiive-hero.jpg",
          video: "/videos/fiive/fiive-demo-1080.mp4",
          demo: true,
          caption: "Agency home: client health, request pipeline and task status across all accounts.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/fiive/fiive-clients.jpg",
            alt: "Fiive clients list",
            caption: "Clients: account status, contract dates and health scoring per organisation.",
          },
          {
            src: "/images/fiive/fiive-workspace.jpg",
            alt: "Fiive client workspace",
            caption: "Shared workspace: client view scoped by role and organisation via RLS.",
          },
        ],
      },
      {
        kind: "full",
        figure: {
          src: "/images/fiive/fiive-requests.jpg",
          alt: "Fiive requests list grouped by status and client",
          caption: "Global requests: incoming client requests across all accounts, by status, client, project, and due date.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/fiive/fiive-request-detail.jpg",
            alt: "Fiive request detail with brief, status and comments",
            caption: "Request detail: client brief, status, comments and client details in one thread.",
          },
          {
            src: "/images/fiive/fiive-convert.jpg",
            alt: "Fiive menu to convert a request into a task",
            caption: "Convert to task: Promotes an approved request to an assigned task, preserving the discussion thread.",
          },
        ],
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/fiive/fiive-supabase.jpg",
            alt: "Fiive Supabase schema for organisations, memberships and requests",
            caption: "Data model: Relational database schema with Row Level Security (RLS) policies mapping multi-tenant organization boundaries, memberships, and request entities.",
          },
          {
            src: "/images/fiive/fiive-cursor.jpg",
            alt: "Fiive clients page in Cursor, checking organisation context before data loads",
            caption: "Application architecture: Domain-driven Next.js App Router directory structure paired with server-side context validation for tenant isolation.",
          },
        ],
      },
    ],
  },
  {
    slug: "braza",
    title: "Braza",
    services: "Full-Stack Build & AI",
    year: "2026",
    poster: "/images/braza/braza-preview.jpg",
    about:
      "Operations platform for a high-protein meal prep service, turning each client's biometrics into meal plans, pricing and kitchen production.",
    scope:
      "Braza was a planned meal prep service for gym-goers and athletes, delivering high-protein meals portioned to each client's body and goals. That level of personalisation breaks down when done manually, with biometric calculations for every client and hours of planning, pricing and kitchen prep every week. The platform runs the whole workflow, combining a macro engine, yield-adjusted production sheets and a bilingual AI command bar for rapid order entry. It was paused before launch given the scale of the physical operations.",
    meta: {
      role: "Design Engineer",
    },
    outcomes: [
      "Eliminated manual bottlenecks to make personalised meal prep scalable",
      "Automated meal planning and weekly pricing from 8 biometric inputs",
      "Generated yield-adjusted production sheets, cutting hours of manual math per batch",
      "Built an EN/PL interface & AI command bar capable of processing 100+ weekly orders in under an hour",
    ],
    stack: [
      { label: "Front-end", items: ["Next.js", "React", "TypeScript", "Tailwind", "shadcn/ui", "next-intl"] },
      { label: "Back-end", items: ["Supabase (Postgres)", "Anthropic Claude API", "Vercel"] },
    ],
    blocks: [
      {
        kind: "full",
        figure: {
          src: "/images/braza/braza-hero.jpg",
          alt: "Braza customers list with a command bar for creating a customer",
          caption: "Customers: client database with an AI command bar that turns plain-language prompts into customer records and weekly orders.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/braza/braza-add-customer.jpg",
            alt: "Braza add customer form with calculated calories, protein and price",
            caption: "Macro engine: biometrics resolved into calorie targets, protein requirements, portion scaling and pricing.",
          },
          {
            src: "/images/braza/braza-add-order.jpg",
            alt: "Braza add order form with meals, delivery and weekly total",
            caption: "New order: weekly meal count priced automatically from the client's biometric requirements.",
          },
        ],
      },
      {
        kind: "full",
        figure: {
          src: "/images/braza/braza-production.jpg",
          alt: "Braza production sheet for the week, with meals, portions and allergy notes",
          caption: "Production sheet: active orders aggregated into prep lists with portion weights and allergy flags.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/braza/braza-meals.jpg",
            alt: "Braza meals built from a protein, base and side",
            caption: "Recipes: ingredients composed into protein, base and side components for each meal.",
          },
          {
            src: "/images/braza/braza-shopping.jpg",
            alt: "Braza shopping list with raw purchase weights for proteins, bases and sides",
            caption: "Shopping list: raw ingredients needed for the week, calculated from yields and every customer's portions.",
          },
        ],
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/braza/braza-supabase.jpg",
            alt: "Braza Supabase schema for meals, orders, production and the weekly plan",
            caption: "Database schema: Postgres relational model mapping client profiles, biometric state, modular recipes, order lines, and weekly production batches.",
          },
          {
            src: "/images/braza/braza-cursor.jpg",
            alt: "Braza customers page in Cursor, with locale routes and Claude Code",
            caption: "Architecture: Next.js App Router with next-intl routing, server-rendered Supabase queries and a single shared library for all macro and pricing calculations.",
          },
        ],
      },
    ],
  },
  {
    slug: "nord-security",
    title: "Nord Security",
    services: "Design Engineering & AI Prototyping",
    year: "2026",
    poster: "/images/nord/nord-preview.jpg",
    about:
      "Production accurate NordVPN iOS and macOS front-end templates for Aurora Riff, Nord's internal AI prototyping platform.",
    scope:
      "Designers at Nord Security prototyped with AI by generating NordVPN UI from scratch each time. This burned tokens, took design effort, and produced screens that didn't match the live apps. Production-accurate front-end baselines of the iOS and macOS apps gave every Aurora Riff prototype a real starting point, cutting token consumption, keeping prototypes true to the shipped product and saving hundreds of hours of prototyping time across the design organisation.",
    meta: {
      role: "Senior Design Engineer",
    },
    outcomes: [
      "Coded NordVPN iOS and macOS baselines across Connect, Real-Time Protection, Dark Web Monitor and Settings",
      "Replaced repetitive UI generation with a pre-built code baseline, cutting AI token consumption",
      "Shipped production code via GitLab merge requests to Aurora Riff and Aurora AppKit",
      "Built for Nord Security's 60+ person design team and its product owners",
    ],
    stack: [
      { label: "Front-end", items: ["React", "TypeScript", "Tailwind", "Aurora AppKit"] },
    ],
    blocks: [
      {
        kind: "full",
        figure: {
          src: "/images/nord/nord-hero.jpg",
          alt: "NordVPN macOS home screen in Aurora Riff, connected in Saint Louis",
          caption: "Template preview: NordVPN macOS home, coded as a production-accurate baseline in Aurora Riff.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/nord/nord-use-template.jpg",
            alt: "Use this template button on a NordVPN prototype in Aurora Riff",
            caption: "Use template: the baseline loads straight into a new prototype, with no UI generated from scratch.",
          },
          {
            src: "/images/nord/nord-chat.jpg",
            alt: "Aurora Riff chat for describing a change, with a model picker open",
            caption: "Model selection: approved LLM providers and internal models, chosen before prompting.",
          },
        ],
      },
      {
        kind: "full",
        figure: {
          src: "/images/nord/nord-prototype-before.jpg",
          alt: "Aurora Riff prompt for a Dark Web Monitor alert, with the iPhone home still unchanged",
          caption: "Before: NordVPN mobile home template, prompted to add a Dark Web Monitor alert card.",
        },
      },
      {
        kind: "full",
        figure: {
          src: "/images/nord/nord-prototype-after.jpg",
          alt: "The same prompt after it adds a leaked-credentials alert to the NordVPN iPhone home",
          caption: "After: the alert card built with Aurora components, matching the rest of the screen.",
        },
      },
      {
        kind: "pair",
        figures: [
          {
            src: "/images/nord/nord-search.jpg",
            alt: "NordVPN location search listing countries and how many cities each has",
            caption: "Location search: real countries and servers, pulled from Nord's server API.",
          },
          {
            src: "/images/nord/nord-search-expanded.jpg",
            alt: "NordVPN location search with the United States expanded to its cities",
            caption: "Expanded country: live city list and fastest-server selection from the same API.",
          },
        ],
      },
      {
        kind: "full",
        figure: {
          src: "/images/nord/nord-protect.jpg",
          alt: "NordVPN Protect desktop screen in Aurora Riff, with security issues and protection activity",
          caption: "Protect: Threat Protection overview with real-time protection, scam detection and activity charts.",
        },
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** The project after `slug`, wrapping to the first, for the "Next project" link. */
export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
