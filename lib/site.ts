export const site = {
  name: "Alex Kiersnowski",
  role: ["Senior Product Designer", "& Design Engineer"],
  logo: "kiersnowski.com",
  availability: "Available UK, EU & US Eastern hours",
  location: "Warsaw, Poland",
  email: "alex.kiersnowski@gmail.com",
  cv: "/cv",
  bio: "10+ years bridging product design and production code. I take a product problem, decide what's worth building, and ship to real users in days. Best in early-stage startups and fast, high-autonomy teams.",
  // Hero highlights only: the most in-demand tools, in rough order of hiring weight.
  stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Claude API", "Cursor", "Figma", "React Native"],
  socials: [
    { label: "GitHub", href: "https://github.com/alexkiersnowski" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexkiersnowski" },
    // X: add `{ label: "X", href: "https://x.com/…" }` back when the profile URL is ready.
  ],
} as const;

export const mailto = `mailto:${site.email}`;
