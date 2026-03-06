# Vortex — Product Requirements Document

Version: 0.1.0
Last updated: 2026-03-05

---

## Product Vision

Vortex turns anyone into a virtual tornado tracker. It's the platform where Oklahoma's storm culture meets modern web technology — professional-grade radar data, community-powered spotting, gamified engagement, and historical context, all free and accessible from any device.

---

## Problem Statement

During active severe weather, storm enthusiasts and spotters are fragmented across 6+ tools:
- RadarScope for radar ($10+, pro-only UX)
- SPC website for outlooks (raw text/images, no consumer UX)
- Twitter/X for real-time reports (noisy, unstructured)
- SevereStudios for chase streams (separate from radar)
- HAM radio for spotter comms (1970s technology)
- Separate GPS app for tracking storm motion

No single platform combines professional radar, community spotting, historical context, and real-time alerts in a free, consumer-friendly package.

---

## Target Users

### Primary: Tornado Alley Enthusiasts
- Moore, OK residents and surrounding areas
- People who go outside when the sirens go off (and they know they shouldn't)
- Want to understand what's happening, not just "take shelter"
- Currently use free weather apps that lack severe weather depth

### Secondary: Storm Spotters / Chasers
- Skywarn-trained volunteers (400K+ in the US)
- Storm chasers who need mobile-friendly tools
- Currently juggle multiple paid apps
- Want community features and recognition

### Tertiary: Weather Enthusiasts Nationwide
- Weather nerds who watch storms from afar
- "Virtual chasers" who follow events in real-time online
- Forecast hobbyists who enjoy prediction challenges

---

## User Stories

### Live Radar (P0 — MVP)
- As a user, I can see a live radar map with reflectivity data updated every 5 minutes
- As a user, I can see NWS tornado and severe thunderstorm warning polygons on the map
- As a user, I can see SPC convective outlook risk areas on the map
- As a user, I can see storm reports (tornado, hail, wind) as markers on the map
- As a user, I can loop the last 30 minutes of radar to see storm motion
- As a user, I can search for and center the map on any location

### Alerts (P0)
- As a user, I can receive browser push notifications for tornado warnings at my location
- As a user, I can see a scrolling feed of active NWS alerts
- As a user, I can tap an alert to see its full text and polygon on the map

### Custom Watch Zones (P1)
- As a user, I can draw polygons on the map to define watch zones (home, parents, work)
- As a user, I receive push alerts when any watch zone intersects a tornado warning
- As a user, I can set alert escalation preferences per zone
- As a user, I can enable wake-up alerts that override Do Not Disturb

### Community Spotting (P1)
- As a spotter, I can submit structured reports (type, location, description, photo)
- As a user, I can see community reports on the map with confidence indicators
- As a spotter, I can see other active spotters' positions on the map
- As a user, I can join per-event chat channels during active severe weather

### Historical Data (P1)
- As a user, I can toggle a historical tornado path overlay on the live radar map
- As a user, I can filter historical paths by EF rating, year range, and proximity
- As a user, I can tap a historical path to see details (date, EF rating, casualties, path width)

### Gamification (P2)
- As a user, I earn achievements for verified reports and forecast accuracy
- As a user, I can see my XP, level, and rank on my profile
- As a user, I can view leaderboards (seasonal, all-time, regional)
- As a user, I can enter forecast contests and build an Elo rating

### Virtual Chase Mode (P2)
- As a user, I can "follow" a storm cell and have the map auto-track it
- As a user, I can see a storm cell's profile (lifecycle, reports, warnings, motion vector)
- As a user, I can see embedded live chase streams alongside the radar view

### Advanced Radar (P3)
- As an enthusiast, I can view velocity radar data
- As an enthusiast, I can view dual-polarization products (CC, ZDR)
- As a user, I can view satellite imagery overlaid on the map
- As a user, I can see real-time lightning strikes on the map

---

## Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Monthly Active Users | 10,000 |
| DAU during severe weather events | 5,000+ |
| Community reports per severe event | 100+ |
| Alert delivery latency | < 60s from NWS issuance |
| User retention (30-day) | 40% |
| App store rating (when native ships) | 4.5+ |
| Spotter reports verified accuracy | > 80% |

---

## Monetization

| Tier | Price | Users (est.) |
|------|-------|-------------|
| Free | $0 | 80% of users |
| Enthusiast | $5/mo | 15% |
| Pro | $15/mo | 5% |

Free tier is generous — full reflectivity radar, warnings, alerts, basic community. Paid tiers add velocity/dual-pol, historical overlays, advanced alerts, forecast contests, and API access.

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Availability | 99.9% (critical during severe events) |
| LCP | < 2.5s |
| Radar frame load | < 500ms |
| Map frame rate | 60fps |
| Mobile responsive | Full functionality on phones |
| Offline | Last 30 min radar cached |
| Accessibility | WCAG 2.1 AA |
| Security | OWASP Top 10 mitigated |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IEM tile service goes down during major event | No radar | Cache recent tiles in R2; fallback to NowCOAST |
| NWS API rate-limited during high traffic | Delayed alerts | Cache alerts in Neon; poll from server not per-client |
| Vercel cron insufficient for 30s polling | Alert latency | Upgrade to Pro plan or use external cron (cron-job.org) |
| Community report spam/trolling | Bad data, liability | Verification pipeline, trusted spotter tiers, rate limits |
| User draws excessive watch zones | DB load | Limit zones per tier (3 free, 10 enthusiast, unlimited pro) |

---

## Out of Scope (V1)

- Native mobile app (PWA first)
- AI tornado prediction overlay (requires ML infrastructure)
- Live streaming infrastructure (embed third-party streams)
- Storm-aware routing/navigation
- Before/after satellite damage assessment
- International coverage (US-only for V1)
