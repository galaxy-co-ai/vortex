"use client";

export function Header() {
  return (
    <header
      className="glass-panel fixed top-0 inset-x-0 h-12 flex items-center justify-between px-4"
      style={{ zIndex: "var(--z-header)" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h1 className="font-mono font-bold text-sm tracking-widest text-primary">
          VORTEX
        </h1>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="hidden sm:inline font-mono">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="font-mono text-[10px]">LIVE</span>
        </div>
      </div>
    </header>
  );
}
