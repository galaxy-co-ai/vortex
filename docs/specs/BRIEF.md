# Vortex — Project Brief

## One-Liner

A free, real-time tornado tracking platform where anyone can become a virtual storm tracker.

---

## The Opportunity

Tornado Alley has 30+ million residents and a deep storm culture. Moore, Oklahoma alone has been hit by seven significant tornadoes since 1998. Storm spotting is civic duty. People go outside when sirens sound. They want to understand the threat, not just hide from it.

Yet the tools available are either:
- **Pro-grade and expensive** (RadarScope, WSV3) — great data, zero community
- **Free and shallow** (MyRadar, Windy) — pretty but useless for severe analysis
- **Antiquated** (Skywarn HAM radio, NWS phone lines) — critical but stuck in the 1970s

Nobody serves the enthusiast in the middle — the person who wants real radar data, community connection, historical context, and intelligent alerts, without paying $10/month or getting a meteorology degree.

---

## What We're Building

A Next.js web app (PWA) that combines:

1. **Professional radar** — IEM NEXRAD tiles on MapLibre, free, 5-min updates, with warning polygons and SPC outlooks
2. **Community spotting** — structured reports, GPS positioning, verification scoring, live event chat
3. **Smart alerts** — custom watch zones (draw a polygon around your house), storm-based notifications with ETA
4. **Historical context** — 100+ years of tornado paths overlaid on live radar
5. **Gamification** — achievements, Elo-rated forecast contests, seasonal leaderboards

---

## Why Now

- **Free APIs are better than ever** — NWS API, NEXRAD on AWS, GOES satellite, SPC MapServer all freely accessible with no keys
- **MapLibre v5** just shipped globe view — beautiful, free, WebGL map renderer
- **Web Push** now works on iOS (since 16.4) — true cross-platform push alerts from a PWA
- **AI models for tornado prediction** exist (MIT, STORM-Net, CSU) but nobody has put them in a consumer product
- **Storm chaser content is exploding** — weather influencers, live streams, TikTok chasers. The audience exists and is growing.

---

## Tech Stack

Next.js 15, React 19, TypeScript, MapLibre GL JS, deck.gl, Neon/PostGIS, Drizzle, Clerk, Tailwind CSS 4, Vercel.

All data sources are free government APIs (NWS, SPC, IEM, NEXRAD/AWS, GOES/AWS, Blitzortung, Spotter Network).

---

## Target User

**Primary:** Moore, OK residents and Tornado Alley enthusiasts who love storm season and want more than a basic weather app gives them.

**Expansion:** The 400K+ trained Skywarn spotters nationwide, virtual storm chasers, weather hobbyists, forecast enthusiasts.

---

## Monetization

Free core (radar + warnings + alerts + basic community). Paid tiers at $5/mo (enthusiast) and $15/mo (pro) for advanced radar products, historical overlays, unlimited watch zones, forecast contests, and API access.

---

## Competitive Moat

Integration. RadarScope has the best radar. SevereStudios has the best streams. Skywarn has the best ground truth. Tornado Archive has the best history. SPC has the best forecasts. Nobody combines them. That's our play.

---

## Timeline

| Phase | Scope | Target |
|-------|-------|--------|
| 1 — MVP | Live radar + warnings + SPC overlays + storm reports + basic alerts | 2 weeks |
| 2 — Community | Auth, profiles, spotter reports, event chat | 2 weeks |
| 3 — Smart Alerts | Watch zones, PostGIS geofencing, Web Push | 1 week |
| 4 — Gamification | Achievements, leaderboards, forecast contests | 2 weeks |
| 5 — Advanced | Historical overlay, virtual chase, lightning, satellite | Ongoing |

---

## Key Decision: Name

**Vortex** — clean, tornado-specific, memorable, available as a project name. Domain TBD.
