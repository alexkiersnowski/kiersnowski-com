# kiersnowski.com — Project Context

## What this is

A personal portfolio site for Alex Kiersnowski, Lead Product Designer.
The site is a single AI-powered chat interface where visitors —
hiring managers, clients, collaborators — can query Alex directly.
It is not a traditional portfolio. It is a queryable human.

## Site structure

- `/` — Landing page with AI chat interface
- `/cv` — Rendered CV page from cv.md

## Design language

- Clean, minimal, off-white background
- Left sidebar, icon-only, narrow
- Centred main content, max-width 680px
- Inter font
- Tailwind CSS + shadcn/ui + Radix
- No gradients, no decorative elements
- Personality comes from copy and interaction, not visual noise

## Tech stack

- Next.js 15, App Router, TypeScript strict
- Supabase (Postgres) — for storing chat sessions if needed
- Tailwind CSS, shadcn/ui, Radix
- Anthropic Claude API — powers the AI persona
- Vercel — deployment

## Alex Kiersnowski — who he is

- Lead Product Designer, 10+ years experience
- Based in Warsaw, Poland
- Operates at the intersection of design leadership, product
  strategy, and engineering
- Founded Fiive — B2B SaaS agency-client operations platform
- Built Braza — full-stack nutrition operations platform with
  Anthropic Claude API integration
- Stack: Anthropic · OpenAI · Claude Code · Cursor · Figma ·
  Next.js · TypeScript · Supabase · Vercel · Tailwind CSS ·
  shadcn/ui · Radix
- Available for contract, freelance, and full-time engagements

## AI persona

The AI responds as Alex in first person. Opinionated, direct,
no corporate language, no bullet points in responses.
Short paragraphs. Sounds like a person, not a product.
The full system prompt lives in `/lib/persona.ts`.

## Key files

- `CONTEXT.md` — this file, project context for Claude Code
- `app/page.tsx` — landing page and chat interface
- `app/cv/page.tsx` — CV page
- `content/cv.md` — CV source of truth
- `lib/persona.ts` — Alex AI persona system prompt
- `lib/chat.ts` — Anthropic API chat logic
- `components/` — shared components
