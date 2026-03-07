import type { SPCOutlookCollection, TornadoProbCollection, MesoscaleDiscussionCollection } from "@/lib/types/weather";
import { dnToRiskLevel, riskLabel } from "@/lib/utils";

const SPC_OUTLOOKS =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer";
const SPC_MCD =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/spc_mesoscale_discussion/MapServer";

const DAY1_CATEGORICAL = 1;
const DAY1_TORNADO_PROB = 3;

async function querySPC(layerUrl: string, revalidate: number) {
  const url = new URL(layerUrl);
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", "*");
  url.searchParams.set("f", "geojson");
  url.searchParams.set("returnGeometry", "true");

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`SPC MapServer error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDay1Outlook(): Promise<SPCOutlookCollection> {
  const data = await querySPC(`${SPC_OUTLOOKS}/${DAY1_CATEGORICAL}/query`, 900);

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

  return { type: "FeatureCollection", features };
}

export async function fetchTornadoProbability(): Promise<TornadoProbCollection> {
  const data = await querySPC(`${SPC_OUTLOOKS}/${DAY1_TORNADO_PROB}/query`, 900);

  const features = (data.features || []).map(
    (f: { properties: { label: string; label2: string }; geometry: GeoJSON.Geometry }) => ({
      ...f,
      properties: {
        ...f.properties,
        probability: parseFloat(f.properties.label) * 100,
        description: f.properties.label2,
      },
    })
  );

  return { type: "FeatureCollection", features };
}

export async function fetchMesoscaleDiscussions(): Promise<MesoscaleDiscussionCollection> {
  const data = await querySPC(`${SPC_MCD}/0/query`, 300);

  const features = (data.features || []).map(
    (f: { properties: { name: string; folderpath: string; popupinfo: string }; geometry: GeoJSON.Geometry }) => ({
      ...f,
      properties: {
        name: f.properties.name,
        info: f.properties.folderpath,
        url: f.properties.popupinfo,
      },
    })
  );

  return { type: "FeatureCollection", features };
}
