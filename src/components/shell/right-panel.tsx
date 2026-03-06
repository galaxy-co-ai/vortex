"use client";

import { useMap } from "@/lib/context/map-context";
import { cn, severityToHex, formatAlertTime } from "@/lib/utils";

export function RightPanel() {
  const { selectedAlert, setSelectedAlert, flyTo } = useMap();

  if (!selectedAlert) return null;

  const {
    event,
    headline,
    description,
    instruction,
    onset,
    expires,
    senderName,
    areaDesc,
  } = selectedAlert.properties;

  const handleFlyTo = () => {
    if (selectedAlert.geometry?.type === "Polygon") {
      const coords = (selectedAlert.geometry as GeoJSON.Polygon).coordinates[0];
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      flyTo(
        (Math.min(...lons) + Math.max(...lons)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
        10
      );
    }
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/40 md:hidden"
        style={{ zIndex: "var(--z-panel)" }}
        onClick={() => setSelectedAlert(null)}
      />

      {/* Panel */}
      <div
        className={cn(
          "flex flex-col border-l border-border bg-background/95 backdrop-blur-sm overflow-hidden",
          "transition-all duration-[var(--duration-normal)] ease-[var(--ease-decelerate)]",
          // Desktop: inline panel
          "hidden md:flex w-[var(--shell-panel-w)] shrink-0",
          // Mobile: bottom sheet (override hidden)
          "max-md:!flex max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-h-[75vh] max-md:rounded-t-xl max-md:border-t"
        )}
        style={{ zIndex: "calc(var(--z-panel) + 1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: severityToHex(event) }}
            >
              {event}
            </span>
          </div>
          <button
            onClick={() => setSelectedAlert(null)}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {headline && (
            <h2 className="text-sm font-semibold leading-snug">{headline}</h2>
          )}

          {/* Timing */}
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">
                Onset
              </p>
              <p className="text-sm font-mono">{formatAlertTime(onset)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">
                Expires
              </p>
              <p className="text-sm font-mono">{formatAlertTime(expires)}</p>
            </div>
          </div>

          {/* Area */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
              Areas Affected
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {areaDesc}
            </p>
          </div>

          {/* Description */}
          {description && (
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
                Details
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* Instructions */}
          {instruction && (
            <div className="bg-severity-tornado/10 border border-severity-tornado/20 rounded-lg p-3">
              <p className="text-[10px] font-mono text-severity-tornado uppercase mb-1">
                Safety Instructions
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {instruction}
              </p>
            </div>
          )}

          {/* Source */}
          <p className="text-[10px] text-muted-foreground">
            Issued by {senderName}
          </p>

          {/* Fly to button */}
          <button
            onClick={handleFlyTo}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium",
              "bg-primary/10 text-primary border border-primary/20",
              "hover:bg-primary/20 transition-colors duration-[var(--duration-fast)]"
            )}
          >
            Center on Map
          </button>
        </div>
      </div>
    </>
  );
}
