"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/ui/header";

const MapContainer = dynamic(
  () =>
    import("@/components/map/map-container").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
            Loading radar
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <Header />
      <div className="absolute inset-0 pt-12">
        <MapContainer />
      </div>
    </main>
  );
}
