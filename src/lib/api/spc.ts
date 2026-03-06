import type { SPCOutlookCollection } from "@/lib/types/weather";
import { dnToRiskLevel, riskLabel } from "@/lib/utils";

const SPC_BASE =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer";

// Layer 0 = Day 1 Categorical Outlook
const DAY1_CATEGORICAL = 0;

export async function fetchDay1Outlook(): Promise<SPCOutlookCollection> {
  const url = new URL(`${SPC_BASE}/${DAY1_CATEGORICAL}/query`);
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", "*");
  url.searchParams.set("f", "geojson");
  url.searchParams.set("returnGeometry", "true");

  const res = await fetch(url.toString(), {
    next: { revalidate: 900 }, // 15 min
  });

  if (!res.ok) {
    throw new Error(`SPC MapServer error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Map dn values to risk levels
  const features = (data.features || []).map(
    (f: { properties: { dn: number }; geometry: GeoJSON.Geometry }) => ({
      ...f,
      properties: {
        ...f.properties,
        risk_level: dnToRiskLevel(f.properties.dn),
        label: riskLabel(dnToRiskLevel(f.properties.dn)),
      },
    })
  );

  return {
    type: "FeatureCollection",
    features,
  };
}
