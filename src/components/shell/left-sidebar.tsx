"use client";

import { useState } from "react";
import { useMap } from "@/lib/context/map-context";
import { cn, severityToHex, formatRelativeTime } from "@/lib/utils";
import type { NWSAlertFeature } from "@/lib/types/weather";
import type { LayerVisibility } from "@/lib/types/map";

type FilterType = "all" | "tornado" | "severe" | "flood" | "watch";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tornado", label: "Tornado" },
  { key: "severe", label: "Severe" },
  { key: "flood", label: "Flood" },
  { key: "watch", label: "Watch" },
];

function matchesFilter(alert: NWSAlertFeature, filter: FilterType): boolean {
  if (filter === "all") return true;
  const e = alert.properties.event;
  switch (filter) {
    case "tornado":
      return e === "Tornado Warning";
    case "severe":
      return e === "Severe Thunderstorm Warning";
    case "flood":
      return e === "Flash Flood Warning" || e === "Flood Warning";
    case "watch":
      return e === "Tornado Watch" || e === "Severe Thunderstorm Watch";
    default:
      return true;
  }
}

export function LeftSidebar() {
  const {
    alerts,
    alertsLoading,
    sidebarOpen,
    setSelectedAlert,
    flyTo,
    layers,
    toggleLayer,
    radarOpacity,
    setRadarOpacity,
  } = useMap();
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"alerts" | "layers">("alerts");

  const filtered = alerts.filter((a) => matchesFilter(a, filter));

  const handleAlertClick = (alert: NWSAlertFeature) => {
    setSelectedAlert(alert);
    if (alert.geometry?.type === "Polygon") {
      const coords = (alert.geometry as GeoJSON.Polygon).coordinates[0];
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      flyTo(
        (Math.min(...lons) + Math.max(...lons)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
        9
      );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-background/95 backdrop-blur-sm",
        "transition-all duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
        "overflow-hidden shrink-0",
        sidebarOpen ? "w-[var(--shell-sidebar-w)]" : "w-0"
      )}
      style={{ zIndex: "var(--z-sidebar)" }}
    >
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab("alerts")}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-mono uppercase tracking-wider",
            "transition-colors border-b-2",
            activeTab === "alerts"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab("layers")}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-mono uppercase tracking-wider",
            "transition-colors border-b-2",
            activeTab === "layers"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          Layers
        </button>
      </div>

      {activeTab === "alerts" ? (
        <>
          {/* Filter pills */}
          <div className="flex gap-1 px-2 py-2 shrink-0 overflow-x-auto">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap",
                  "transition-colors",
                  filter === key
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Alert list */}
          <div className="overflow-y-auto flex-1 p-1.5">
            {alertsLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-muted-foreground"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">
                  {filter === "all"
                    ? "No active severe weather alerts"
                    : `No active ${filter} alerts`}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-md",
                      "hover:bg-muted/50 transition-colors duration-[var(--duration-fast)]",
                      "group"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: severityToHex(
                            alert.properties.event
                          ),
                        }}
                      />
                      <span className="text-xs font-semibold truncate">
                        {alert.properties.event}
                      </span>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                        {formatRelativeTime(alert.properties.expires)}
                      </span>
                    </div>
                    {alert.properties.headline && (
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 pl-4">
                        {alert.properties.headline}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <LayerPanel
          layers={layers}
          toggleLayer={toggleLayer}
          radarOpacity={radarOpacity}
          setRadarOpacity={setRadarOpacity}
        />
      )}
    </div>
  );
}

const LAYER_ITEMS: {
  key: keyof LayerVisibility;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    key: "radar",
    label: "NEXRAD Radar",
    description: "Live reflectivity tiles",
    color: "bg-radar-moderate",
  },
  {
    key: "warnings",
    label: "Warnings",
    description: "NWS warning polygons",
    color: "bg-severity-tornado",
  },
  {
    key: "outlooks",
    label: "SPC Outlooks",
    description: "Day 1 convective outlook",
    color: "bg-outlook-slgt",
  },
  {
    key: "reports",
    label: "Storm Reports",
    description: "LSR markers today",
    color: "bg-primary",
  },
];

function LayerPanel({
  layers,
  toggleLayer,
  radarOpacity,
  setRadarOpacity,
}: {
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  radarOpacity: number;
  setRadarOpacity: (v: number) => void;
}) {
  return (
    <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
      <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-2">
        Map Layers
      </p>

      {LAYER_ITEMS.map(({ key, label, description, color }) => (
        <button
          key={key}
          onClick={() => toggleLayer(key)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm",
            "transition-colors duration-[var(--duration-fast)]",
            layers[key]
              ? "bg-primary/8 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <span
            className={cn(
              "w-3 h-3 rounded-sm shrink-0",
              layers[key] ? color : "bg-muted"
            )}
          />
          <div className="flex-1 text-left min-w-0">
            <span className="text-xs font-medium block truncate">{label}</span>
            <span className="text-[10px] text-muted-foreground">
              {description}
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 w-9 h-5 rounded-full transition-colors relative inline-flex items-center",
              layers[key] ? "bg-primary" : "bg-border"
            )}
          >
            <span
              className={cn(
                "absolute w-3.5 h-3.5 rounded-full bg-white transition-transform",
                layers[key] ? "translate-x-[18px]" : "translate-x-[3px]"
              )}
            />
          </span>
        </button>
      ))}

      {/* Radar opacity */}
      {layers.radar && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Radar Opacity
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {Math.round(radarOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={radarOpacity * 100}
            onChange={(e) => setRadarOpacity(Number(e.target.value) / 100)}
            className="w-full h-1.5 rounded-full appearance-none bg-border accent-primary cursor-pointer"
          />
        </div>
      )}

      {/* Radar legend */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-2">
          Reflectivity (dBZ)
        </p>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 rounded-sm bg-gradient-to-r from-radar-light via-radar-moderate via-radar-heavy to-radar-extreme" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">20</span>
          <span className="text-[9px] text-muted-foreground">35</span>
          <span className="text-[9px] text-muted-foreground">50</span>
          <span className="text-[9px] text-muted-foreground">65+</span>
        </div>
      </div>
    </div>
  );
}
