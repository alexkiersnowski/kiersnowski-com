# kiersnowski.com

Personal site for Alex Kiersnowski. Instead of a traditional portfolio, the homepage is an AI chat that answers questions about Alex's work, background, and approach.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (New York / neutral)
- Anthropic Claude API via the Vercel AI SDK
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

Create `.env.local` with:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check

## Routes

- `/` — chat interface
- `/cv` — CV page with direct PDF download (`public/cv/alex-kiersnowski-cv-2026.pdf`)
- `/api/chat` — streaming chat endpoint

## Project layout

```
app/            App Router pages and API routes
components/     UI, sidebar, chat input, theme + appearance
lib/            persona prompt and shared utilities
public/cv/     CV page assets and PDF
```
