# Vortex — Technical Specification

Version: 0.1.0
Last updated: 2026-03-05

---

## 1. System Overview

Vortex is a real-time tornado and severe weather tracking web application. It consumes free government weather APIs, renders professional-grade radar on interactive maps, enables community storm spotting with gamification, and delivers intelligent location-based alerts.

### Architecture

```
                    +------------------+
                    |   Client (PWA)   |
                    |  Next.js 15 SSR  |
                    |  MapLibre + deck |
                    +--------+---------+
                             |
                    +--------+---------+
                    |  Next.js API     |
                    |  Route Handlers  |
                    |  (SSE + REST)    |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+-------+
     | Neon/PostGIS|  | R2/Blob    |  | WebSocket  |
     | Users, alerts|  | Tile cache |  | Lightning  |
     | zones, reports| | Sat images |  | Chat       |
     +--------------+  +------------+  +------------+
              |
     +--------+--------+
     | Ingest Workers   |
     | (Vercel Cron)    |
     | NWS, IEM, SPC,   |
     | GOES, LSR, GLM   |
     +------------------+
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x (strict) |
| Map | MapLibre GL JS | 5.x |
| Map React wrapper | react-map-gl | latest |
| Data viz | deck.gl | 9.x |
| Database | Neon (PostgreSQL + PostGIS) | latest |
| ORM | Drizzle | latest |
| Auth | Clerk | latest |
| Styling | Tailwind CSS 4 | latest |
| Push | Web Push API + web-push | latest |
| Package manager | pnpm | latest |
| Hosting | Vercel | Pro |
| Tile/blob storage | Cloudflare R2 or Vercel Blob | latest |
| Real-time | SSE (radar) + WebSocket (lightning/chat) | native |

---

## 2. Data Ingestion

### 2.1 Ingest Workers (Vercel Cron)

| Worker | Source | Frequency | Output |
|--------|--------|-----------|--------|
| `ingest-alerts` | NWS `/alerts/active?area=US` | 30s (severe), 2min (calm) | Neon `alerts` table (PostGIS polygons) |
| `ingest-outlooks` | SPC MapServer | 15 min | Neon `outlooks` table (GeoJSON regions) |
| `ingest-lsr` | NWS LSR MapServer + IEM | 5 min | Neon `storm_reports` table |
| `ingest-spotter` | Spotter Network | 60s | Neon `spotter_positions` table |
| `cache-radar` | IEM tile service | 5 min | R2 bucket (tile cache for animation frames) |

### 2.2 Client-Side Data (No Backend Required)

| Data | Source | Method |
|------|--------|--------|
| Radar tiles | IEM TMS direct | MapLibre raster source (browser fetches tiles) |
| Lightning | Blitzortung WebSocket | Direct client WebSocket connection |
| NowCOAST tiles | NOAA ArcGIS | MapLibre raster source |

### 2.3 On-Demand Data (API Routes)

| Endpoint | Source | Trigger |
|----------|--------|---------|
| `/api/radar/archive/{timestamp}` | IEM WMS-T | User scrubs radar timeline |
| `/api/satellite/{product}` | GOES on AWS | User enables satellite layer |
| `/api/tornado-history` | Tornado Archive/MRCC | User enables historical overlay |
| `/api/storm-cell/{id}` | Derived from radar + LSR | User clicks storm cell |

---

## 3. Database Schema (Drizzle + PostGIS)

### Core Tables

```typescript
// alerts — ingested from NWS
alerts: {
  id: text (NWS alert ID),
  event: text ('Tornado Warning', 'Severe Thunderstorm Warning', etc.),
  severity: text,
  urgency: text,
  headline: text,
  description: text,
  instruction: text,
  polygon: geometry('Polygon', 4326),  // PostGIS
  onset: timestamp,
  expires: timestamp,
  sender: text (NWS office),
  created_at: timestamp,
}

// storm_reports — ingested from LSR
storm_reports: {
  id: serial,
  type: text ('tornado', 'hail', 'wind', 'flood'),
  magnitude: decimal (hail size inches, wind speed mph),
  location: geometry('Point', 4326),
  description: text,
  source: text ('trained spotter', 'law enforcement', 'public', etc.),
  reported_at: timestamp,
  ingested_at: timestamp,
}

// outlooks — ingested from SPC
outlooks: {
  id: serial,
  day: integer (1-8),
  type: text ('categorical', 'tornado', 'hail', 'wind'),
  risk_level: text ('MRGL', 'SLGT', 'ENH', 'MDT', 'HIGH'),
  probability: integer (percent),
  significant: boolean (hatched),
  polygon: geometry('Polygon', 4326),
  issued_at: timestamp,
  valid_start: timestamp,
  valid_end: timestamp,
}

// users — managed by Clerk, extended here
user_profiles: {
  clerk_id: text,
  display_name: text,
  location: geometry('Point', 4326),
  role: text ('viewer', 'spotter', 'verified_spotter', 'admin'),
  xp: integer,
  accuracy_rating: decimal,
  reports_count: integer,
  created_at: timestamp,
}

// watch_zones — user-drawn alert polygons
watch_zones: {
  id: serial,
  user_id: text (FK clerk_id),
  name: text ('Home', 'Parents House', 'Office'),
  polygon: geometry('Polygon', 4326),
  alert_levels: text[] (['watch', 'warning', 'tornado_confirmed']),
  wake_up: boolean,
  active: boolean,
  created_at: timestamp,
}

// community_reports — user-submitted spotter reports
community_reports: {
  id: serial,
  user_id: text (FK clerk_id),
  type: text ('tornado', 'funnel_cloud', 'wall_cloud', 'rotation', 'hail', 'wind_damage', 'flooding'),
  location: geometry('Point', 4326),
  description: text,
  media_urls: text[],
  confidence_score: decimal (computed from cross-referencing),
  verified: boolean,
  verified_by: text,
  reported_at: timestamp,
}

// achievements
user_achievements: {
  id: serial,
  user_id: text (FK clerk_id),
  achievement_key: text,
  earned_at: timestamp,
  metadata: jsonb,
}

// forecast_contests
forecast_entries: {
  id: serial,
  user_id: text (FK clerk_id),
  contest_date: date,
  prediction_polygon: geometry('Polygon', 4326),
  prediction_type: text ('tornado', 'severe'),
  score: decimal (computed post-event),
  elo_delta: integer,
  created_at: timestamp,
}

// spotter_positions — ingested from Spotter Network
spotter_positions: {
  id: serial,
  spotter_id: text,
  location: geometry('Point', 4326),
  elevation: decimal,
  heading: decimal,
  speed: decimal,
  updated_at: timestamp,
}
```

### Key Indexes

```sql
CREATE INDEX idx_alerts_polygon ON alerts USING GIST (polygon);
CREATE INDEX idx_alerts_event ON alerts (event);
CREATE INDEX idx_alerts_expires ON alerts (expires);
CREATE INDEX idx_watch_zones_polygon ON watch_zones USING GIST (polygon);
CREATE INDEX idx_storm_reports_location ON storm_reports USING GIST (location);
CREATE INDEX idx_community_reports_location ON community_reports USING GIST (location);
CREATE INDEX idx_spotter_positions_location ON spotter_positions USING GIST (location);
```

### Geofence Query (Alert Matching)

```sql
-- Find all watch zones that intersect with a new tornado warning polygon
SELECT wz.*, up.clerk_id
FROM watch_zones wz
JOIN user_profiles up ON wz.user_id = up.clerk_id
WHERE ST_Intersects(wz.polygon, $1::geometry)
  AND wz.active = true
  AND 'warning' = ANY(wz.alert_levels);
```

---

## 4. Map Layer Architecture

Layers render bottom-to-top:

| Order | Layer | Source | Type | Toggle |
|-------|-------|--------|------|--------|
| 1 | Base map | MapLibre (dark style) | Vector tiles | Always on |
| 2 | Historical tornado paths | Tornado Archive/MRCC | GeoJSON line | User toggle |
| 3 | SPC convective outlook | SPC MapServer | GeoJSON fill | Default on |
| 4 | SPC tornado probability | SPC MapServer | GeoJSON fill | User toggle |
| 5 | Radar (reflectivity) | IEM TMS | Raster tiles | Default on |
| 6 | Radar (velocity) | NEXRAD AWS (L2) | Processed raster | User toggle (Enthusiast+) |
| 7 | Satellite | GOES AWS | Raster | User toggle |
| 8 | NWS warning polygons | NWS API | GeoJSON polygon | Default on |
| 9 | Storm reports (LSR) | NWS/IEM | GeoJSON point | Default on |
| 10 | Community reports | Neon DB | GeoJSON point | Default on |
| 11 | Spotter positions | Spotter Network | GeoJSON point | User toggle |
| 12 | Lightning | Blitzortung/GLM | deck.gl ScatterplotLayer | User toggle |
| 13 | Storm cell tracks | Derived | deck.gl ArcLayer | User toggle |

---

## 5. Real-Time Architecture

### SSE (Server-Sent Events) — Radar + Alerts

```typescript
// app/api/events/route.ts
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const alerts = await getNewAlerts();
        const radarTimestamp = await getLatestRadarTimestamp();
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ alerts, radarTimestamp })}\n\n`
        ));
      }, 30000);

      req.signal.addEventListener('abort', () => clearInterval(interval));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### WebSocket — Lightning + Chat

Lightning strikes from Blitzortung arrive via WebSocket on the client. Community chat during severe events uses a WebSocket connection (Pusher free tier: 200K messages/day, 100 concurrent connections).

---

## 6. Push Notification Flow

```
1. User draws watch zone polygon → stored in Neon (PostGIS)
2. Ingest worker polls NWS alerts every 30s
3. New alert arrives with polygon geometry
4. PostGIS query: ST_Intersects(alert.polygon, watch_zone.polygon)
5. Match found → lookup user's push subscription
6. Send Web Push via web-push npm library
7. Service worker shows notification with:
   - Alert type + severity
   - "Tornado Warning for your zone 'Home'"
   - Estimated time of arrival (storm motion vector calc)
   - Tap opens app centered on the threat
```

---

## 7. Performance Targets

| Metric | Target |
|--------|--------|
| Initial page load (LCP) | < 2.5s |
| Radar tile load | < 500ms per frame |
| Radar animation | 60fps (WebGL) |
| Alert notification latency | < 60s from NWS issuance |
| Map interaction (pan/zoom) | 60fps |
| SSE reconnection | < 5s automatic |
| Offline capability | Last 30 min of radar frames cached |

---

## 8. Deployment

- **Vercel** for Next.js hosting, serverless functions, cron jobs
- **Neon** for PostgreSQL + PostGIS (free tier: 0.5 GB, branching)
- **Clerk** for auth (free tier: 10K MAU)
- **Cloudflare R2** for tile/image cache (free: 10GB storage, 10M reads/mo)
- **Vercel Cron** for data ingestion (free: once per day on Hobby, Pro for 30s intervals)

### Environment Variables

```
NEXT_PUBLIC_MAPLIBRE_STYLE_URL=
DATABASE_URL= (Neon connection string)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_URL=
```

---

## 9. Route Structure

```
/                       — Landing page (hero + live radar preview)
/map                    — Full-screen radar map (core experience)
/map?cell={id}          — Map focused on a specific storm cell
/alerts                 — Active alerts feed
/alerts/{id}            — Single alert detail
/reports                — Community storm reports feed
/reports/submit         — Submit a spotter report
/history                — Historical tornado data explorer
/history/{event}        — Specific historical event page
/contests               — Forecast contest hub
/contests/{id}          — Active contest entry
/leaderboard            — Community leaderboard
/profile/{id}           — User profile (achievements, stats, reports)
/settings               — Alert zones, notification preferences
/settings/zones         — Draw/edit watch zone polygons
```

---

## 10. Phase Roadmap

### Phase 1: Live Radar (MVP)
- MapLibre + IEM radar tiles
- NWS warning polygon overlay
- SPC outlook overlay
- Storm reports markers
- Basic location-based alerts (browser notification permission)
- Dark theme, mobile-responsive

### Phase 2: Community
- Clerk auth
- User profiles
- Spotter report submission with GPS + photo
- Community reports on map
- Per-event chat (Pusher free tier)

### Phase 3: Smart Alerts
- Custom watch zone drawing (polygon tool)
- PostGIS geofence matching
- Web Push notifications with Service Worker
- Escalation ladder alerts
- Wake-up alerts

### Phase 4: Gamification
- Achievement system
- XP + levels
- Leaderboards
- Report verification pipeline
- Forecast contests with Elo ratings

### Phase 5: Advanced Features
- Historical tornado path overlay
- Radar animation timeline (30min loop + archive scrub)
- Virtual chase mode (follow storm cell)
- Lightning layer (Blitzortung WebSocket)
- Satellite layer (GOES)
- Storm cell profiles with AI narratives
- Velocity/dual-pol radar (NEXRAD AWS Level 2)
