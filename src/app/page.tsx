"use client";

import dynamic from "next/dynamic";

const CommandShell = dynamic(
  () =>
    import("@/components/shell/command-shell").then((mod) => mod.CommandShell),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
            Initializing command center
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <CommandShell />;
}
