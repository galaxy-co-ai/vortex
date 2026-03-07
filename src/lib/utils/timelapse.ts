/**
 * IEM radar tile utilities.
 *
 * Products:
 *   nexrad-n0b-900913 — Base Reflectivity (high-res ~0.25km)
 *   nexrad-n0s-900913 — Storm-Relative Velocity
 *
 * Historical tiles use timestamps: nexrad-n0b-{YYYYMMDDHHII}
 * Tiles available at 5-minute intervals in UTC.
 */

const INTERVAL_MS = 5 * 60 * 1000;
const IEM_BASE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

export function generateFrameTimestamps(
  frameCount = 20,
  intervalMinutes = 5
): string[] {
  const now = Date.now();
  const interval = intervalMinutes * 60 * 1000;
  const latest = Math.floor(now / interval) * interval;

  const frames: string[] = [];
  for (let i = frameCount - 1; i >= 0; i--) {
    const ts = new Date(latest - i * interval);
    frames.push(formatTimestamp(ts));
  }
  return frames;
}

function formatTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${d}${h}${min}`;
}

export function frameToTileUrl(timestamp: string): string {
  return `${IEM_BASE}/nexrad-n0b-${timestamp}/{z}/{x}/{y}.png`;
}

/** Live reflectivity tiles (high-res N0B) with cache bust */
export function reflectivityTileUrl(): string {
  const cacheBust = Math.floor(Date.now() / INTERVAL_MS);
  return `${IEM_BASE}/nexrad-n0b-900913/{z}/{x}/{y}.png?_t=${cacheBust}`;
}

/** Storm-relative velocity tiles (N0S) with cache bust */
export function velocityTileUrl(): string {
  const cacheBust = Math.floor(Date.now() / INTERVAL_MS);
  return `${IEM_BASE}/nexrad-n0s-900913/{z}/{x}/{y}.png?_t=${cacheBust}`;
}

export function formatFrameLabel(timestamp: string): string {
  const y = parseInt(timestamp.slice(0, 4));
  const m = parseInt(timestamp.slice(4, 6)) - 1;
  const d = parseInt(timestamp.slice(6, 8));
  const h = parseInt(timestamp.slice(8, 10));
  const min = parseInt(timestamp.slice(10, 12));
  const date = new Date(Date.UTC(y, m, d, h, min));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
