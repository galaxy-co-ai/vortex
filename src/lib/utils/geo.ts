import type { NWSAlertFeature } from "@/lib/types/weather";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface ThreatProximity {
  alert: NWSAlertFeature;
  distanceMi: number;
  bearing: string;
}

const EARTH_RADIUS_MI = 3958.8;

/** Haversine distance in miles between two lat/lng points */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

/** Compass bearing from point 1 to point 2 */
export function bearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Centroid of a polygon (simple average of coordinates) */
function polygonCentroid(coords: number[][]): [number, number] {
  let lonSum = 0, latSum = 0;
  for (const c of coords) {
    lonSum += c[0];
    latSum += c[1];
  }
  return [lonSum / coords.length, latSum / coords.length];
}

/** Minimum distance from user to nearest edge of polygon in miles */
function distanceToPolygon(
  userLat: number, userLon: number,
  coords: number[][]
): number {
  let minDist = Infinity;
  for (const c of coords) {
    const d = haversineDistance(userLat, userLon, c[1], c[0]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/** Find nearest tornado warnings to user, sorted by distance */
export function findNearestThreats(
  userLocation: UserLocation,
  alerts: NWSAlertFeature[],
  maxDistanceMi = 100
): ThreatProximity[] {
  const tornadoWarnings = alerts.filter(
    (a) => a.properties.event === "Tornado Warning"
  );

  const threats: ThreatProximity[] = [];

  for (const alert of tornadoWarnings) {
    if (!alert.geometry) continue;

    let coords: number[][];
    if (alert.geometry.type === "Polygon") {
      coords = (alert.geometry as GeoJSON.Polygon).coordinates[0];
    } else if (alert.geometry.type === "MultiPolygon") {
      coords = (alert.geometry as GeoJSON.MultiPolygon).coordinates.flat(1)[0];
    } else {
      continue;
    }

    const distanceMi = distanceToPolygon(
      userLocation.latitude, userLocation.longitude, coords
    );

    if (distanceMi <= maxDistanceMi) {
      const centroid = polygonCentroid(coords);
      const dir = bearing(
        userLocation.latitude, userLocation.longitude,
        centroid[1], centroid[0]
      );
      threats.push({ alert, distanceMi, bearing: dir });
    }
  }

  return threats.sort((a, b) => a.distanceMi - b.distanceMi);
}
