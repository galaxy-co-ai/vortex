"use client";

import { useState } from "react";
import { useMap } from "@/lib/context/map-context";
import { cn } from "@/lib/utils";
import type { LayerVisibility } from "@/lib/types/map";

const LAYERS: { key: keyof LayerVisibility; label: string; icon: string }[] = [
  { key: "radar", label: "Radar", icon: "R" },
  { key: "warnings", label: "Warnings", icon: "W" },
  { key: "outlooks", label: "Outlooks", icon: "O" },
  { key: "reports", label: "Reports", icon: "S" },
];

export function LayerControls() {
  const { layers, toggleLayer, radarOpacity, setRadarOpacity } = useMap();
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="absolute top-14 right-3"
      style={{ zIndex: "var(--z-map-controls)" }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "glass-panel w-10 h-10 rounded-lg flex items-center justify-center",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-[var(--duration-fast)]",
          expanded && "text-primary"
        )}
        aria-label="Toggle layer controls"
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
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className={cn(
            "glass-panel rounded-lg mt-2 p-3 w-52",
            "animate-in fade-in slide-in-from-right-2 duration-[var(--duration-normal)]"
          )}
        >
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2.5 uppercase">
            Map Layers
          </p>

          <div className="space-y-1.5">
            {LAYERS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm",
                  "transition-colors duration-[var(--duration-fast)]",
                  layers[key]
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold",
                    layers[key]
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {icon}
                </span>
                <span>{label}</span>
                <span
                  className={cn(
                    "ml-auto w-2 h-2 rounded-full transition-colors",
                    layers[key] ? "bg-primary" : "bg-border"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Radar opacity slider */}
          {layers.radar && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1.5">
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
        </div>
      )}
    </div>
  );
}
