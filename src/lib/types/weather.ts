export type AlertSeverity = "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
export type AlertUrgency = "Immediate" | "Expected" | "Future" | "Past" | "Unknown";

export type AlertEvent =
  | "Tornado Warning"
  | "Severe Thunderstorm Warning"
  | "Tornado Watch"
  | "Severe Thunderstorm Watch"
  | "Flash Flood Warning"
  | "Flood Warning"
  | "Special Weather Statement";

export interface NWSAlertProperties {
  id: string;
  event: string;
  severity: AlertSeverity;
  urgency: AlertUrgency;
  headline: string | null;
  description: string;
  instruction: string | null;
  onset: string;
  expires: string;
  senderName: string;
  areaDesc: string;
}

export interface NWSAlertFeature {
  type: "Feature";
  id: string;
  properties: NWSAlertProperties;
  geometry: GeoJSON.Geometry | null;
}

export interface NWSAlertCollection {
  type: "FeatureCollection";
  features: NWSAlertFeature[];
}

export type ReportType = "tornado" | "hail" | "wind" | "flood" | "other";

export interface StormReportProperties {
  type: ReportType;
  magnitude: number | null;
  city: string;
  county: string;
  state: string;
  source: string;
  remark: string;
  utc_valid: string;
}

export interface StormReportFeature {
  type: "Feature";
  properties: StormReportProperties;
  geometry: GeoJSON.Point;
}

export interface StormReportCollection {
  type: "FeatureCollection";
  features: StormReportFeature[];
}

export type OutlookRisk = "TSTM" | "MRGL" | "SLGT" | "ENH" | "MDT" | "HIGH";

export interface SPCOutlookProperties {
  dn: number;
  risk_level: OutlookRisk;
  label: string;
}

export interface SPCOutlookFeature {
  type: "Feature";
  properties: SPCOutlookProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface SPCOutlookCollection {
  type: "FeatureCollection";
  features: SPCOutlookFeature[];
}

// Tornado probability (SPC Day 1 Layer 3)
export interface TornadoProbProperties {
  probability: number;
  description: string;
  label: string;
  label2: string;
}

export interface TornadoProbFeature {
  type: "Feature";
  properties: TornadoProbProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface TornadoProbCollection {
  type: "FeatureCollection";
  features: TornadoProbFeature[];
}

// Mesoscale Discussions (SPC MCD)
export interface MesoscaleDiscussionProperties {
  name: string;
  info: string;
  url: string;
}

export interface MesoscaleDiscussionFeature {
  type: "Feature";
  properties: MesoscaleDiscussionProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface MesoscaleDiscussionCollection {
  type: "FeatureCollection";
  features: MesoscaleDiscussionFeature[];
}
