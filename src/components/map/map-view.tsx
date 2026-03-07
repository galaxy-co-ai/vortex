"use client";

import { BaseMap } from "./base-map";
import { RadarLayer } from "./radar-layer";
import { WarningLayer } from "./warning-layer";
import { OutlookLayer } from "./outlook-layer";
import { TornadoProbLayer } from "./tornado-prob-layer";
import { MesoscaleLayer } from "./mesoscale-layer";
import { ReportsLayer } from "./reports-layer";

export function MapView() {
  return (
    <div className="w-full h-full">
      <BaseMap>
        <OutlookLayer />
        <TornadoProbLayer />
        <MesoscaleLayer />
        <RadarLayer />
        <WarningLayer />
        <ReportsLayer />
      </BaseMap>
    </div>
  );
}
