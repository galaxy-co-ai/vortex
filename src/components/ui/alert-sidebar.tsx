"use client";

import { useState, useEffect } from "react";
import { useMap } from "@/lib/context/map-context";
import { cn, severityToHex, formatRelativeTime, sortBySeverity } from "@/lib/utils";
import type { NWSAlertCollection, NWSAlertFeature } from "@/lib/types/weather";

const POLL_INTERVAL = 30_000;

export function AlertSidebar() {
  const { setSelectedAlert, flyTo } = useMap();
  const [alerts, setAlerts] = useState<NWSAlertFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data: NWSAlertCollection = await res.json();
          setAlerts(sortBySeverity(data.features));
        }
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleAlertClick = (alert: NWSAlertFeature) => {
    setSelectedAlert(alert);
    if (alert.geometry && alert.geometry.type === "Polygon") {
      const coords = (alert.geometry as GeoJSON.Polygon).coordinates[0];
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      flyTo(centerLon, centerLat, 9);
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) setOpen(false);
  };

  const alertCount = alerts.length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "glass-panel absolute top-14 left-3 w-10 h-10 rounded-lg",
          "flex items-center justify-center",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-[var(--duration-fast)]"
        )}
        style={{ zIndex: "var(--z-map-controls)" }}
        aria-label="Toggle alert sidebar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-severity-tornado text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {alertCount > 99 ? "99+" : alertCount}
          </span>
        )}
      </button>

      {/* Sidebar panel */}
      <div
        className={cn(
          "glass-panel absolute top-14 left-3 w-80 max-h-[calc(100vh-72px)]",
          "rounded-lg overflow-hidden flex flex-col",
          "transition-all duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
          "md:top-14 md:left-3",
          // Mobile: bottom sheet
          "max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-h-[70vh] max-md:rounded-b-none max-md:rounded-t-xl",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none max-md:translate-y-full"
        )}
        style={{ zIndex: "var(--z-panel)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Active Alerts
            </span>
            {alertCount > 0 && (
              <span className="text-[10px] font-mono bg-severity-tornado/20 text-severity-tornado px-1.5 py-0.5 rounded-full">
                {alertCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alert list */}
        <div className="overflow-y-auto flex-1 p-1.5">
          {loading ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                No active severe weather alerts
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                All clear across the US
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md",
                    "hover:bg-muted/50 transition-colors duration-[var(--duration-fast)]",
                    "group"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: severityToHex(alert.properties.event),
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
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 pl-4">
                      {alert.properties.headline}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
