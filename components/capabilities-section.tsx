const columns = [
  {
    title: "Product & Strategy",
    items: [
      "Product Strategy",
      "Product Scoping & Specs",
      "Product Architecture",
      "Live Market Validation",
      "Feature Prioritisation",
    ],
  },
  {
    title: "Design Systems",
    items: [
      "Figma (Tokens & Variables)",
      "Component Architecture",
      "Shadcn UI · Radix",
      "Storybook",
    ],
  },
  {
    title: "Engineering",
    items: [
      "Next.js · TypeScript",
      "React · React Native",
      "Expo",
      "Supabase (Postgres / RLS)",
      "Stripe · Vercel",
    ],
  },
  {
    title: "AI & Integration",
    items: [
      "Claude Code · Cursor",
      "Anthropic API · OpenAI API",
      "LLM Integration",
      "System Prompting",
    ],
  },
];

const labelClass = "font-mono text-xs tracking-wider text-muted-foreground uppercase";

/** Keeps each tool name and bracketed group intact, so narrow columns only break at "·" or before "(". */
function Item({ text }: { text: string }) {
  const segments = text.split(" · ");

  // Paired tools ("Anthropic API · OpenAI API"): each name stays whole with its trailing dot.
  if (segments.length > 1) {
    return segments.map((segment, index) => (
      <span key={segment}>
        <span className="whitespace-nowrap">
          {segment}
          {index < segments.length - 1 ? " ·" : null}
        </span>{" "}
      </span>
    ));
  }

  // Single items: wrap naturally, but never inside a bracketed group like "(Postgres, RLS)"
  // or across a slash pair like "Outputs / RAG".
  return text.replace(/ \/ /g, " / ").split(/(\(.*?\))/).map((part) =>
    part.startsWith("(") ? (
      <span key={part} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Static technical index: four text-only columns of capabilities, framed by hairlines. */
export function CapabilitiesSection() {
  return (
    <section aria-labelledby="capabilities-title" className="border-y border-foreground/10">
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 py-5">
        <h2 id="capabilities-title" className={labelClass}>
          Capabilities &amp; Stack
        </h2>
        <span aria-hidden="true" className={labelClass}>
          (Technical Index)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 pt-12 pb-16 sm:grid-cols-2 md:pb-20 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className={`mb-4 ${labelClass}`}>{column.title}</h3>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground">
              {column.items.map((item) => (
                <li key={item}>
                  <Item text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
