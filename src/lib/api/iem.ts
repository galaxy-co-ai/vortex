import type {
  StormReportCollection,
  StormReportFeature,
  ReportType,
} from "@/lib/types/weather";

const IEM_BASE = "https://mesonet.agron.iastate.edu";

function mapTypeCode(typeCode: string): ReportType {
  const code = typeCode?.toUpperCase() ?? "";
  if (code === "T" || code.includes("TORNADO")) return "tornado";
  if (code === "H" || code.includes("HAIL")) return "hail";
  if (code === "G" || code === "D" || code.includes("WIND") || code.includes("TSTM")) return "wind";
  if (code === "F" || code.includes("FLOOD") || code.includes("FLASH")) return "flood";
  return "other";
}

export async function fetchStormReports(): Promise<StormReportCollection> {
  // IEM provides LSR data as GeoJSON for the last 24 hours
  const url = `${IEM_BASE}/geojson/lsr.geojson?wfo=all`;

  const res = await fetch(url, {
    next: { revalidate: 300 }, // 5 min
  });

  if (!res.ok) {
    throw new Error(`IEM LSR error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const features: StormReportFeature[] = (data.features || [])
    .filter((f: { geometry: GeoJSON.Geometry | null }) => f.geometry !== null)
    .map(
      (f: {
        properties: Record<string, string>;
        geometry: GeoJSON.Point;
      }) => ({
        type: "Feature" as const,
        properties: {
          type: mapTypeCode(f.properties.type || ""),
          magnitude: f.properties.magnitude
            ? parseFloat(f.properties.magnitude)
            : null,
          city: f.properties.city || "",
          county: f.properties.county || "",
          state: f.properties.state || "",
          source: f.properties.source || "",
          remark: f.properties.remark || "",
          utc_valid: f.properties.utc_valid || "",
        },
        geometry: f.geometry,
      })
    );

  return { type: "FeatureCollection", features };
}
