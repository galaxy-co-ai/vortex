# Vortex — Project Instructions

## What Is This

Real-time tornado tracking PWA. Free government weather APIs + community spotting + gamification.

## Stack

- **Framework:** Next.js 15, React 19, TypeScript (strict)
- **Map:** MapLibre GL JS v5 + react-map-gl + deck.gl v9
- **Database:** Neon (PostgreSQL + PostGIS), Drizzle ORM
- **Auth:** Clerk
- **Styling:** Tailwind CSS 4 with semantic tokens
- **Hosting:** Vercel
- **Package manager:** pnpm

## Key Data Sources (All Free)

- NWS API (`api.weather.gov`) — alerts, warnings
- IEM (`mesonet.agron.iastate.edu`) — radar tiles, LSRs, archives
- SPC MapServer — convective outlooks, tornado probabilities
- NEXRAD on AWS — raw Level 2/3 radar
- GOES on AWS — satellite imagery
- Blitzortung — community lightning (WebSocket)
- Spotter Network — real-time chaser positions

## Project Structure

```
vortex/
  docs/
    research/       — API research, competitive analysis
    specs/          — SPEC.md, PRD.md, BRIEF.md
  src/
    app/            — Next.js app router
    components/     — React components
    lib/            — Utilities, API clients, DB queries
    styles/         — globals.css with design tokens
  designs/          — brand.md, .pen files
  drizzle/          — Schema, migrations
  public/           — Static assets
```

## Rules

- Read `designs/CLAUDE.md` (workspace root) before ANY UI work
- Semantic tokens only — no raw Tailwind colors
- PostGIS for all spatial queries (ST_Intersects, ST_Contains)
- SSE for radar/alert updates, WebSocket for lightning/chat
- Cache radar tiles in R2/Blob, never process raw NEXRAD L2 unless building advanced features
- All env vars in `.env.local` AND Vercel dashboard

## Important Docs

- `docs/specs/SPEC.md` — Full technical specification
- `docs/specs/PRD.md` — Product requirements
- `docs/specs/BRIEF.md` — Project brief
- `docs/research/` — API reference, competitive analysis, original research
