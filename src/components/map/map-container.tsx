"use client";

import { MapProvider } from "@/lib/context/map-context";
import { BaseMap } from "./base-map";
import { RadarLayer } from "./radar-layer";
import { WarningLayer } from "./warning-layer";
import { OutlookLayer } from "./outlook-layer";
import { ReportsLayer } from "./reports-layer";
import { LayerControls } from "@/components/ui/layer-controls";
import { AlertSidebar } from "@/components/ui/alert-sidebar";
import { AlertPanel } from "@/components/ui/alert-panel";

export function MapContainer() {
  return (
    <MapProvider>
      <div className="relative w-full h-full">
        <BaseMap>
          <OutlookLayer />
          <RadarLayer />
          <WarningLayer />
          <ReportsLayer />
        </BaseMap>
        <LayerControls />
        <AlertSidebar />
        <AlertPanel />
      </div>
    </MapProvider>
  );
}
