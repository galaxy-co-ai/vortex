"use client";

import { useMap } from "@/lib/context/map-context";
import { cn } from "@/lib/utils";
import { formatFrameLabel } from "@/lib/utils/timelapse";

export function BottomBar() {
  const {
    timelapse,
    toggleTimelapse,
    togglePlay,
    setFrame,
    setTimelapseSpeed,
    dataFreshness,
    alertStats,
  } = useMap();

  return (
    <div
      className="glass-panel flex items-center justify-between px-3 h-[var(--shell-bottom-h)] shrink-0 border-t border-border"
      style={{ zIndex: "var(--z-bottom-bar)" }}
    >
      {/* Left — Timelapse controls */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Toggle timelapse */}
        <button
          onClick={toggleTimelapse}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider",
            "transition-colors",
            timelapse.enabled
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title="Toggle radar timelapse"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="hidden sm:inline">Timelapse</span>
        </button>

        {timelapse.enabled && (
          <>
            {/* Play/pause */}
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              {timelapse.playing ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21" />
                </svg>
              )}
            </button>

            {/* Scrubber */}
            <div className="flex-1 min-w-0 flex items-center gap-2 max-w-md">
              <input
                type="range"
                min={0}
                max={timelapse.frames.length - 1}
                value={timelapse.currentIndex}
                onChange={(e) => setFrame(Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none bg-border accent-primary cursor-pointer"
              />
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap min-w-[80px] text-right">
                {timelapse.frames.length > 0
                  ? formatFrameLabel(timelapse.frames[timelapse.currentIndex])
                  : "--:--"}
              </span>
            </div>

            {/* Speed selector */}
            <div className="hidden sm:flex items-center gap-0.5">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setTimelapseSpeed(s)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-mono",
                    "transition-colors",
                    timelapse.speed === s
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right — Status indicators */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground shrink-0">
        <StatusDot
          label="Radar"
          timestamp={dataFreshness.radar}
          staleAfterMs={600_000}
        />
        <StatusDot
          label="Alerts"
          timestamp={dataFreshness.alerts}
          staleAfterMs={60_000}
        />
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-foreground font-bold">
            {alertStats.total}
          </span>
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}

function StatusDot({
  label,
  timestamp,
  staleAfterMs,
}: {
  label: string;
  timestamp: Date | null;
  staleAfterMs: number;
}) {
  const age = timestamp ? Date.now() - timestamp.getTime() : Infinity;
  const fresh = age < staleAfterMs;
  const stale = age < staleAfterMs * 3;

  return (
    <div className="hidden sm:flex items-center gap-1">
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          fresh ? "bg-green-500" : stale ? "bg-yellow-500" : "bg-red-500"
        )}
      />
      <span>{label}</span>
    </div>
  );
}
