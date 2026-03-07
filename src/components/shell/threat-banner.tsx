"use client";

import { memo } from "react";
import { useMap } from "@/lib/context/map-context";
import { cn } from "@/lib/utils";

export function ThreatBanner() {
  const { nearestThreats, audioEnabled, setAudioEnabled, flyTo, setSelectedAlert } = useMap();

  if (nearestThreats.length === 0) return null;

  const nearest = nearestThreats[0];
  const isClose = nearest.distanceMi < 25;
  const isDanger = nearest.distanceMi < 10;

  return (
    <div
      className={cn(
        "absolute top-2 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-lg",
        "backdrop-blur-sm transition-colors duration-300",
        isDanger
          ? "bg-severity-tornado/90 border-severity-tornado text-white animate-pulse"
          : isClose
            ? "bg-severity-tornado/20 border-severity-tornado/50 text-severity-tornado"
            : "bg-background/90 border-border text-foreground"
      )}
    >
      <WarningIcon danger={isDanger} />

      <div className="min-w-0">
        <p className={cn("text-xs font-bold", isDanger && "text-white")}>
          {isDanger
            ? "TORNADO WARNING — TAKE SHELTER"
            : isClose
              ? "Tornado Warning Nearby"
              : "Tornado Warning Active"}
        </p>
        <p className={cn("text-[10px] font-mono", isDanger ? "text-white/80" : "text-muted-foreground")}>
          {Math.round(nearest.distanceMi)} mi {nearest.bearing}
          {nearestThreats.length > 1 && ` · ${nearestThreats.length} active`}
        </p>
      </div>

      <button
        onClick={() => {
          setSelectedAlert(nearest.alert);
          if (nearest.alert.geometry?.type === "Polygon") {
            const coords = (nearest.alert.geometry as GeoJSON.Polygon).coordinates[0];
            const lons = coords.map((c) => c[0]);
            const lats = coords.map((c) => c[1]);
            flyTo(
              (Math.min(...lons) + Math.max(...lons)) / 2,
              (Math.min(...lats) + Math.max(...lats)) / 2,
              10
            );
          }
        }}
        className={cn(
          "px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase",
          "transition-colors shrink-0",
          isDanger
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        View
      </button>

      <AudioToggle enabled={audioEnabled} onChange={setAudioEnabled} danger={isDanger} />
    </div>
  );
}

const AudioToggle = memo(function AudioToggle({
  enabled,
  onChange,
  danger,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  danger: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "p-1.5 rounded-md transition-colors shrink-0",
        danger
          ? "text-white/70 hover:text-white hover:bg-white/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      title={enabled ? "Mute alarm" : "Enable audio alarm"}
    >
      {enabled ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
});

const WarningIcon = memo(function WarningIcon({ danger }: { danger: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("shrink-0", danger && "animate-bounce")}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
});
