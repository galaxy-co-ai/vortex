# Vortex API Reference — Free Data Sources

Quick-reference for every API endpoint the platform consumes. All free, no paid tiers.

---

## NWS Alerts API

**Base:** `https://api.weather.gov`
**Auth:** No key. Requires `User-Agent` header (app name + contact email).
**Rate limit:** ~1 req/sec recommended. No hard cap.

| Endpoint | Use | Notes |
|----------|-----|-------|
| `GET /alerts/active` | All active watches/warnings | Filter: `?area=OK`, `?event=Tornado Warning`, `?severity=Extreme` |
| `GET /alerts/active?point={lat},{lon}` | Alerts for a specific location | Returns CAP with GeoJSON polygon geometry |
| `GET /alerts/active/count` | Summary counts by type/severity | Lightweight health-check endpoint |
| `GET /alerts/{id}` | Full alert detail | Includes polygon, description, instruction text |

**Polling strategy:** Every 30s during active severe weather, every 2-5 min otherwise.

---

## SPC MapServer (ArcGIS REST)

**Base:** `https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer`
**Auth:** None
**Rate limit:** Standard ArcGIS REST

### Key Layers

| Layer ID | Name | Use |
|----------|------|-----|
| 0 | Day 1 Convective Outlook | Categorical risk areas (MRGL/SLGT/ENH/MDT/HIGH) |
| 1 | Day 1 Tornado Probability | % chance of tornado within 25mi of a point |
| 2 | Day 1 Hail Probability | % chance of 1"+ hail |
| 3 | Day 1 Wind Probability | % chance of 58mph+ wind |
| 19 | Day 1 Sig Tornado (hatched) | 10%+ chance of EF2+ tornado |

**Query example:**
```
/MapServer/1/query?geometry=-97.5,35.3&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=geojson
```

**Shapefile downloads:** `https://www.spc.noaa.gov/products/outlook/day1otlk-shp.zip` (Days 1-8 available)

---

## IEM Radar Tiles

**Auth:** None
**Rate limit:** Be reasonable

### Tile Map Service (recommended)
```
https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png
```

### WMS (time-aware)
```
https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q-t.cgi
```

### Products Available
| Product Code | Name |
|-------------|------|
| `n0q` | Base Reflectivity (high-res, 0.5 deg tilt) |
| `n0r` | Base Reflectivity (legacy) |
| `eet` | Echo Tops |
| `daa` | 1-Hour Precipitation |
| `dta` | Storm Total Precipitation |

**Archive:** Every 5-min mosaic since 2003. Time-parameterized WMS for historical queries.

---

## NWS Local Storm Reports

**Base:** `https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer`
**Auth:** None
**Update:** Every 30 min

### Layers
| Layer | Period |
|-------|--------|
| 0-4 | Last 24 hours (tornado, hail, wind, flood, other) |
| 5-9 | Last 48 hours |
| 10-14 | Last 72 hours |

**IEM alternative (faster):** `https://mesonet.agron.iastate.edu/lsr/` — GeoJSON, regenerated every 5 min.

---

## NEXRAD on AWS (Raw Radar)

**Bucket (real-time chunks):** `s3://unidata-nexrad-level2-chunks`
**Bucket (assembled volumes):** `s3://unidata-nexrad-level2`
**Auth:** AWS credentials (free tier)
**SNS notifications:** Available for new data arrival

### Products (Level 2, Dual-Pol)
Reflectivity, Velocity, Spectrum Width, Differential Reflectivity (ZDR), Correlation Coefficient (CC), Differential Phase (PhiDP/KDP)

### JS Parser
`nexrad-level-3-data` (npm) — parse Level 3 binary data in browser/Node.

---

## GOES Satellite on AWS

**Buckets:** `s3://noaa-goes16/`, `s3://noaa-goes18/`, `s3://noaa-goes19/`
**Auth:** AWS credentials (free tier)
**Format:** NetCDF, Cloud-Optimized GeoTIFF
**Update:** Every 1-15 min depending on product/sector

**Interactive viewer:** `https://rammb-slider.cira.colostate.edu/`

---

## GOES GLM (Lightning)

**Location:** Within GOES S3 buckets
**Format:** NetCDF (Level 2)
**Update:** Every 20-60 seconds
**Coverage:** Western Hemisphere
**Products:** Events, Groups, Flashes

---

## Blitzortung (Community Lightning)

**Website:** `https://www.blitzortung.org/`
**Viz:** `https://www.lightningmaps.org/`
**Auth:** None (community)
**Format:** JSON via WebSocket feed
**Coverage:** Global (2,000+ sensors)
**Quality:** Good for awareness, not precision-grade

---

## Spotter Network

**Website:** `https://www.spotternetwork.org/`
**Auth:** None
**Format:** JSON (lat, lon, elevation, heading, timestamp, spotter ID)
**Update:** Real-time GPS tracking

---

## Historical Tornado Data

| Source | Coverage | Format | URL |
|--------|----------|--------|-----|
| Tornado Archive | 100+ years | Interactive/GIS | `tornadoarchive.com` |
| MRCC Tornado Tracks | 1950-present | GIS | `mrcc.purdue.edu/gismaps/cntytorn` |
| IEM SPC Archive | Historical outlooks | Shapefile | `mesonet.agron.iastate.edu/request/gis/outlooks.phtml` |
| SPC Storm Reports | Daily | CSV | `spc.noaa.gov/climo/online/` |

---

## NowCOAST (Pre-Rendered Radar)

**Base:** `https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer`
**Auth:** None
**Format:** Map tiles (ArcGIS)
**Product:** MRMS radar mosaic, time-enabled

---

## Open-Meteo (Forecasts)

**Base:** `https://api.open-meteo.com/v1/forecast`
**Auth:** None for non-commercial
**Rate limit:** 10,000 calls/day
**Use:** Hourly/daily forecasts, model data (GFS, ECMWF, etc.)
