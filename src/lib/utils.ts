import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAlertTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const expires = new Date(dateStr).getTime();
  const diff = expires - now;

  if (diff < 0) return "Expired";
  if (diff < 60_000) return "< 1 min";
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min`;
  return `${Math.round(diff / 3_600_000)}h ${Math.round((diff % 3_600_000) / 60_000)}m`;
}

const SEVERITY_COLORS: Record<string, string> = {
  "Tornado Warning": "var(--color-severity-tornado)",
  "Severe Thunderstorm Warning": "var(--color-severity-severe)",
  "Tornado Watch": "var(--color-severity-watch)",
  "Severe Thunderstorm Watch": "var(--color-severity-watch)",
  "Flash Flood Warning": "var(--color-severity-flood)",
  "Flood Warning": "var(--color-severity-flood)",
};

export function severityToColor(event: string): string {
  return SEVERITY_COLORS[event] ?? "var(--color-muted-foreground)";
}

const SEVERITY_HEX: Record<string, string> = {
  "Tornado Warning": "#ff3333",
  "Severe Thunderstorm Warning": "#ff9900",
  "Tornado Watch": "#990033",
  "Severe Thunderstorm Watch": "#990033",
  "Flash Flood Warning": "#33cc66",
  "Flood Warning": "#33cc66",
};

export function severityToHex(event: string): string {
  return SEVERITY_HEX[event] ?? "#888888";
}

const SEVERITY_ORDER: Record<string, number> = {
  "Tornado Warning": 0,
  "Severe Thunderstorm Warning": 1,
  "Flash Flood Warning": 2,
  "Flood Warning": 3,
  "Tornado Watch": 4,
  "Severe Thunderstorm Watch": 5,
};

export function sortBySeverity<T extends { properties: { event: string } }>(
  features: T[]
): T[] {
  return [...features].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.properties.event] ?? 99) -
      (SEVERITY_ORDER[b.properties.event] ?? 99)
  );
}

const OUTLOOK_COLORS: Record<string, string> = {
  TSTM: "#66b266",
  MRGL: "#22b14c",
  SLGT: "#f0e040",
  ENH: "#e69138",
  MDT: "#e02020",
  HIGH: "#ff00ff",
};

export function outlookRiskToHex(risk: string): string {
  return OUTLOOK_COLORS[risk] ?? "#888888";
}

const DN_TO_RISK: Record<number, string> = {
  2: "TSTM",
  3: "MRGL",
  4: "SLGT",
  5: "ENH",
  6: "MDT",
  8: "HIGH",
};

export function dnToRiskLevel(dn: number): string {
  return DN_TO_RISK[dn] ?? "TSTM";
}

const RISK_LABELS: Record<string, string> = {
  TSTM: "Thunderstorm",
  MRGL: "Marginal",
  SLGT: "Slight",
  ENH: "Enhanced",
  MDT: "Moderate",
  HIGH: "High",
};

export function riskLabel(risk: string): string {
  return RISK_LABELS[risk] ?? risk;
}
