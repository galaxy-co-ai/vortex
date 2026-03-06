"use client";

import { useEffect, useState } from "react";
import { useMap } from "@/lib/context/map-context";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { alertStats, sidebarOpen, setSidebarOpen } = useMap();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="glass-panel flex items-center justify-between px-3 h-[var(--shell-header-h)] shrink-0 border-b border-border"
      style={{ zIndex: "var(--z-header)" }}
    >
      {/* Left — Logo + sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {sidebarOpen ? (
              <>
                <path d="M3 6h18M3 12h12M3 18h18" />
              </>
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </>
            )}
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h1 className="font-mono font-bold text-sm tracking-widest text-primary">
            VORTEX
          </h1>
        </div>
      </div>

      {/* Center — Quick stats */}
      <div className="hidden md:flex items-center gap-2">
        {alertStats.tornadoWarnings > 0 && (
          <StatChip
            label="TOR"
            count={alertStats.tornadoWarnings}
            className="bg-severity-tornado/15 text-severity-tornado border-severity-tornado/30"
            pulse
          />
        )}
        {alertStats.severeWarnings > 0 && (
          <StatChip
            label="SVR"
            count={alertStats.severeWarnings}
            className="bg-severity-severe/15 text-severity-severe border-severity-severe/30"
          />
        )}
        {alertStats.watches > 0 && (
          <StatChip
            label="WCH"
            count={alertStats.watches}
            className="bg-severity-watch/15 text-severity-watch border-severity-watch/30"
          />
        )}
        {alertStats.floodWarnings > 0 && (
          <StatChip
            label="FLD"
            count={alertStats.floodWarnings}
            className="bg-severity-flood/15 text-severity-flood border-severity-flood/30"
          />
        )}
        {alertStats.total === 0 && (
          <span className="text-[10px] font-mono text-muted-foreground">
            No active alerts
          </span>
        )}
      </div>

      {/* Right — Time + live */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="hidden sm:inline font-mono">
          {time.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="font-mono text-[10px] tabular-nums">
          {time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[10px] text-green-500">LIVE</span>
        </div>
      </div>
    </header>
  );
}

function StatChip({
  label,
  count,
  className,
  pulse,
}: {
  label: string;
  count: number;
  className: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono font-bold",
        className,
        pulse && "animate-pulse"
      )}
    >
      <span>{label}</span>
      <span>{count}</span>
    </div>
  );
}
