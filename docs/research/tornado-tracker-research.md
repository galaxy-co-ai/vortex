# Project Vortex - Virtual Tornado Tracker Platform

## Research Brief (March 2026)

---

## Vision

A real-time tornado tracking web app where anyone can become a virtual storm tracker. Think Flashpoint's threat intelligence model applied to severe weather — persistent storm profiles, AI-generated narratives, community spotting, gamified engagement, and professional-grade radar in a consumer-friendly package.

**Target audience:** Moore, OK and Tornado Alley enthusiasts, storm chasers, weather nerds, Skywarn spotters, and anyone who gets excited when the sky turns green.

---

## Free API & Data Stack

Every data source below is **$0 cost**. No paid tiers, no commercial licenses.

### Tier 1: Core (Must-Have)

| Source | What It Gives You | Format | Update Freq | Endpoint |
|--------|-------------------|--------|-------------|----------|
| **NWS API** | Tornado/severe warnings, watches, alerts with polygon geometry | GeoJSON/JSON-LD | Poll every 30-60s | `api.weather.gov/alerts/active` |
| **SPC MapServer** | Convective outlooks, tornado probabilities, sig-tornado hatching, mesoscale discussions | GeoJSON | Per issuance | `mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer` |
| **IEM Radar Tiles** | Pre-rendered NEXRAD mosaic tiles (reflectivity, echo tops, precip) | PNG tiles (TMS/WMS) | Every 5 min | `mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png` |
| **NWS LSR MapServer** | Local Storm Reports (tornado, hail, wind damage) | GeoJSON | Every 30 min | `mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer` |
| **Spotter Network** | Real-time GPS positions of storm chasers/spotters | JSON (lat/lon/heading) | Real-time | `spotternetwork.org` |

### Tier 2: Enhanced (Adds Depth)

| Source | What It Gives You | Format | Update Freq |
|--------|-------------------|--------|-------------|
| **NEXRAD on AWS** | Raw Level 2/3 radar (velocity, dual-pol, correlation coefficient) | Binary (S3) | Real-time chunks |
| **GOES-16/18 on AWS** | Satellite imagery (visible, IR, mesoscale sectors) | NetCDF/COG (S3) | Every 1-15 min |
| **GOES GLM** | Satellite lightning detection (total lightning: IC + CG + CC) | NetCDF (S3) | Every 20-60s |
| **Blitzortung** | Community lightning network (2,000+ sensors globally) | JSON via WebSocket | Real-time |
| **NowCOAST** | NOAA's pre-rendered MRMS radar mosaic tiles | Map tiles (ArcGIS) | Near real-time |
| **IEM LSR Archive** | Historical storm reports, bulk download | GeoJSON/CSV | Every 5 min |
| **SPC Storm Reports** | Daily filtered storm reports | CSV | Daily |
| **Open-Meteo** | Free weather forecasts, hourly model data (no key needed) | JSON | Hourly |

### Tier 3: Historical & Research

| Source | What It Gives You | Format |
|--------|-------------------|--------|
| **Tornado Archive** | 100+ years of tornado paths with EF rating, width, casualties | Interactive/GIS |
| **MRCC Tornado Tracks** | Every tornado since 1950 with detailed path data | GIS layers |
| **IEM SPC Archive** | Historical convective outlooks searchable by location | Shapefiles |
| **TorNet (MIT)** | ML dataset for tornado detection from radar | Python/ML |
| **mPING** | Crowdsourced precipitation type reports | Database (request access) |

### Auth & Rate Limits

| Source | Auth Required | Rate Limits |
|--------|--------------|-------------|
| NWS API | No key. Set `User-Agent` header with app name + contact | ~1 req/sec recommended |
| SPC MapServer | None | Standard ArcGIS REST |
| IEM | None | Be reasonable |
| NEXRAD AWS | AWS credentials (free tier) | Standard S3 |
| GOES AWS | AWS credentials (free tier) | Standard S3 |
| Blitzortung | None (community) | Via WebSocket feed |
| Spotter Network | None | Respect their bandwidth |
| Open-Meteo | None for non-commercial | 10,000 calls/day |

---

## Recommended Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 15 + React 19 + TypeScript | Your existing stack, SSR + API routes |
| **Map renderer** | MapLibre GL JS v5 + `react-map-gl` | Free, WebGL, globe view, no usage fees |
| **Data viz layers** | deck.gl v9.1 | WebGL2/WebGPU, interleaves with MapLibre |
| **Real-time (radar)** | SSE via Next.js Route Handlers | Auto-reconnect, unidirectional, perfect for weather feeds |
| **Real-time (lightning/chat)** | WebSocket (via Pusher free tier or self-hosted) | Bidirectional, sub-second latency |
| **Database** | Neon + PostGIS | Geofencing (`ST_Contains`), alert polygon queries, your existing stack |
| **Auth** | Clerk | Your existing stack |
| **Tile cache** | Cloudflare R2 (free 10GB/mo) or Vercel Blob | CDN-served radar tile cache |
| **Push notifications** | Web Push API + `web-push` npm | Free, cross-platform, works when tab is closed |
| **Mobile** | PWA first, Capacitor wrapper later | Ship fast, add native for background location later |
| **ORM** | Drizzle | Your existing stack |

### Map Integration (Copy-Paste Ready)

```typescript
// Add IEM NEXRAD radar tiles to MapLibre
map.addSource('nexrad', {
  type: 'raster',
  tiles: [
    'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png'
  ],
  tileSize: 256,
});
map.addLayer({
  id: 'nexrad-layer',
  type: 'raster',
  source: 'nexrad',
  paint: { 'raster-opacity': 0.7 },
});
```

### Data Pipeline Architecture

```
Free Data Sources (NWS, IEM, SPC, AWS)
        |
        v
+---------------------+
|  Ingest Workers      |  Vercel Cron every 2-5 min
|  (Next.js API Routes)|  Poll NWS alerts, fetch radar tiles, pull LSRs
+---------+-----------+
          |
          v
+---------------------+
|  Processing          |  Parse CAP alerts, compute geofences,
|  (Edge Functions)    |  match alerts to user polygons (PostGIS)
+---------+-----------+
          |
          v
+---------------------+
|  Storage             |  Neon/PostGIS: alerts, user locations, reports
|                      |  R2: radar tile cache
|                      |  KV/Redis: real-time state, pub/sub
+---------+-----------+
          |
          v
+---------------------+
|  Serving             |  SSE: radar updates
|  (Next.js 15)        |  WebSocket: lightning, alerts, chat
|                      |  CDN: cached tiles
+---------------------+
```

---

## Feature Set

### Core Experience

**Live Radar Map (Free Tier)**
- IEM NEXRAD reflectivity tiles on MapLibre
- NWS warning polygons (tornado, severe tstorm, flash flood) overlaid in real-time
- SPC convective outlook regions color-coded by risk level
- Storm reports feed (tornado, hail, wind) as map markers
- Radar animation loop (last 30 min via IEM archive tiles)
- Basic location-based push alerts

**Virtual Chase Mode**
- "Follow" a storm cell — map auto-centers, radar auto-updates
- Storm cell gets a persistent profile page with AI-generated narrative
- Timeline: first echo -> severe warned -> tornado warned -> confirmed -> dissipation
- Picture-in-picture: live chaser stream (via SevereStudios/YouTube embed) + radar

**Historical Tornado Paths on Live Radar**
- Overlay Tornado Archive / MRCC tornado tracks on the live map
- See a current supercell tracking along the exact path of a historic EF5
- Filter by EF rating, year range, time of year
- Moore, OK has some of the most dramatic overlaps in history — this feature alone is a killer hook

### Community & Spotting

**Digital Spotter Network**
- Structured report submission: tornado spotted, hail size, wind damage, rotation observed
- GPS stamp + optional photo/video upload
- Real-time spotter map — see where every active spotter is positioned
- Report verification pipeline: cross-reference multiple reports + radar data for confidence score
- Per-storm and per-region live chat channels during active events
- Spotter status: "in the field" / "monitoring from home" / "available"

**Forecast Contests**
- Daily/weekly severe weather prediction challenges
- Users draw probability areas, compare against SPC outlooks and actual reports
- Elo-style rating system for forecasters
- Seasonal championship during peak season (April-June)

### Gamification

**Achievement System**

| Badge | Criteria |
|-------|----------|
| First Report of Season | First verified severe weather report |
| Tornado Witness | Verified tornado report |
| EF3+ Observer | Reported tornado later confirmed EF3+ |
| Outbreak Tracker | 5+ reports in a single event |
| Night Owl | Verified report after dark |
| Long-Range Hit | Predicted severe weather 3+ days out |
| Iron Spotter | 100+ lifetime verified reports |
| First to Report | Earliest verified report for an event |
| Regional Expert | Top reporter in an NWS CWA area |

**Leaderboards**
- Seasonal and all-time report counts
- Accuracy rankings (% reports matching NWS damage surveys)
- Forecast contest Elo ratings
- Regional leaders by CWA
- "Chase of the Year" community vote

### Smart Alerts (Beyond County-Based)

- **Storm-based, not county-based** — alert polygon matches, not county FIPS
- **Custom watch zones** — draw a polygon around your house, your parents' place, your office
- **Escalation ladder:** Watch issued -> Storm approaching -> Rotation detected -> Tornado warning -> Tornado confirmed
- **ETA calculation** — "Tornado-warned storm is 12 miles SW, moving NE at 35mph. Estimated arrival: 20 minutes"
- **Wake-up alerts** — override Do Not Disturb for overnight tornado warnings in your zones

### AI Features (Future / V2)

- **Tornado probability overlay** — based on MIT's Intelligent Tornado Prediction Engine and STORM-Net research
- **AI storm narratives** — "This supercell has shown persistent rotation for 45 minutes, has a confirmed tornado, and is tracking NE at 35mph toward Moore. Historical path similarity: May 20, 2013 EF5."
- **Damage path prediction** — storm motion vectors + population density overlay
- **Before/after satellite imagery** — automated NDVI change detection from Sentinel-2/GOES post-event

---

## Competitive Landscape

| Existing Tool | What They Do Well | What They Miss |
|--------------|-------------------|---------------|
| **RadarScope** | Best radar data (Level 2, dual-pol, velocity) | No community, no AI, no streaming, $10+ |
| **Windy.com** | Beautiful global viz, free | Weak radar (10-15 dBz low), no severe wx focus |
| **SevereStudios** | Live chase streams | No radar, no analysis tools |
| **Tornado Archive** | 100+ years of historical data | No live weather integration |
| **Skywarn** | Ground truth reports, 400K trained spotters | Antiquated tools (HAM radio, phone calls) |
| **Storm Shield** | Storm-based alerts, wake-up alerts | Alert-only, no radar or analysis |
| **WSV3** | Near real-time radar, GPU-rendered, broadcaster-grade | Windows desktop only, no community |
| **MyRadar** | Clean casual UX, smooth animations | No pro radar, no storm chaser tools |

**Our gap:** Nobody combines professional radar + live community spotting + gamification + historical context + AI predictions in one free platform. That's the play.

---

## Monetization (Keep Core Free)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Live radar (reflectivity), NWS warnings, storm reports feed, push alerts, community chat (read during events), basic leaderboard |
| **Enthusiast** | $5/mo | Radar animation controls, historical tornado overlay, SPC products, forecast contests, full community participation, achievements, virtual chase mode |
| **Pro** | $15/mo | Velocity/dual-pol products (via NEXRAD AWS), storm cell profiles with lifecycle tracking, API access, advanced alert zones (unlimited), before/after satellite imagery |

---

## Name Ideas

- **Vortex** — clean, tornado-specific, memorable
- **StormVault** — implies depth of data
- **TornadoTrack** — exactly what it says
- **CycloneHQ** — command center feel
- **FunnelVision** — playful but descriptive
- **TwisterNet** — community + tornado
- **StormPulse** — real-time energy feel

---

## What Makes This Special for Moore, OK

Moore has been hit by seven significant tornadoes since 1998, including two EF5s (1999 and 2013). The historical tornado path overlay feature is uniquely powerful here — residents can see current storms tracking along paths that devastated their neighborhoods. That's not a gimmick; that's life-saving context.

The community features also hit different in Oklahoma. Storm spotting is a civic duty here. Skywarn has deep roots. Giving those spotters modern digital tools — structured reporting, real-time positioning, verification scoring — upgrades a system that's been running on HAM radios since the 1970s.

---

## Next Steps

1. **Pick a name** and scaffold the project
2. **Set up MapLibre + IEM radar tiles** — get a working radar map in 30 minutes
3. **Wire up NWS Alerts API** — tornado warnings on the map with polygon overlays
4. **Add SPC outlook layer** — convective outlook risk areas
5. **Build the storm reports feed** — LSR markers on the map
6. **Historical tornado paths** — overlay Tornado Archive data
7. **Community auth + reporting** — Clerk + structured spotter reports
8. **Gamification layer** — achievements, leaderboards
9. **Smart alerts** — custom watch zones + push notifications
10. **Virtual chase mode** — storm cell following + live stream embeds

---

## Key Sources

**APIs & Data:**
- [NWS API](https://api.weather.gov) | [SPC GIS](https://www.spc.noaa.gov/gis/) | [IEM Radar](https://mesonet.agron.iastate.edu/GIS/ridge.phtml)
- [NEXRAD on AWS](https://registry.opendata.aws/noaa-nexrad/) | [GOES on AWS](https://registry.opendata.aws/noaa-goes/)
- [NWS LSR MapServer](https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer)
- [Blitzortung](https://www.blitzortung.org/) | [Spotter Network](https://www.spotternetwork.org/)
- [Tornado Archive](https://tornadoarchive.com/) | [MRCC Tornado Tracks](https://mrcc.purdue.edu/gismaps/cntytorn)
- [Open-Meteo](https://open-meteo.com/) | [NowCOAST](https://nowcoast.noaa.gov/)

**Open Source References:**
- [meteocool](https://github.com/meteocool/core) — closest architectural reference (PWA + radar + lightning)
- [Supercell Wx](https://github.com/dpaulat/supercell-wx) — NEXRAD Level 2/3 parsing reference
- [nexrad-level-3-data](https://github.com/netbymatt/nexrad-level-3-data) — JS NEXRAD parser
- [TorNet (MIT)](https://github.com/mit-ll/tornet) — ML tornado detection from radar
- [Py-ART](https://github.com/ARM-DOE/pyart) | [OpenRadarScience](https://openradarscience.org/)

**Tech Stack:**
- [MapLibre GL JS](https://maplibre.org/) | [deck.gl](https://deck.gl/) | [react-map-gl](https://visgl.github.io/react-map-gl/)
- [web-push npm](https://www.npmjs.com/package/web-push)
