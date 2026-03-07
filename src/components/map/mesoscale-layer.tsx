"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";

export function MesoscaleLayer() {
  const { layers, mesoscaleData } = useMap();

  if (!layers.mesoscale || !mesoscaleData || mesoscaleData.features.length === 0)
    return null;

  return (
    <Source id="mesoscale-discussions" type="geojson" data={mesoscaleData}>
      <Layer
        id="mcd-fill"
        type="fill"
        paint={{
          "fill-color": "#38bdf8",
          "fill-opacity": 0.12,
        }}
      />
      <Layer
        id="mcd-border"
        type="line"
        paint={{
          "line-color": "#38bdf8",
          "line-width": 2,
          "line-dasharray": [6, 3],
          "line-opacity": 0.8,
        }}
      />
      <Layer
        id="mcd-label"
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-font": ["Open Sans Bold"],
          "text-allow-overlap": false,
        }}
        paint={{
          "text-color": "#38bdf8",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        }}
      />
    </Source>
  );
}
