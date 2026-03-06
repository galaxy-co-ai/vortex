import type { NWSAlertCollection } from "@/lib/types/weather";

const NWS_BASE = "https://api.weather.gov";
const USER_AGENT = "(vortex-tornado-tracker, vortex@cbmedia.com)";

const SEVERE_EVENTS = [
  "Tornado Warning",
  "Severe Thunderstorm Warning",
  "Tornado Watch",
  "Severe Thunderstorm Watch",
  "Flash Flood Warning",
  "Flood Warning",
  "Special Weather Statement",
];

export async function fetchActiveAlerts(): Promise<NWSAlertCollection> {
  const url = new URL(`${NWS_BASE}/alerts/active`);
  url.searchParams.set("status", "actual");
  url.searchParams.set("message_type", "alert,update");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/geo+json",
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`NWS API error: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();

  // Build a clean GeoJSON FeatureCollection — strip NWS JSON-LD fields
  // (@context, title, updated) that can confuse MapLibre's GeoJSON parser
  const features = (raw.features || []).filter(
    (f: { properties: { event: string }; geometry: unknown }) =>
      SEVERE_EVENTS.includes(f.properties.event) && f.geometry !== null
  );

  return {
    type: "FeatureCollection",
    features,
  };
}
