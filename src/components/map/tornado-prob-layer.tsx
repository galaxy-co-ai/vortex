"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";

// Hatched fill pattern via graduated opacity — higher probability = more visible
export function TornadoProbLayer() {
  const { layers, tornadoProbData } = useMap();

  if (!layers.tornadoProb || !tornadoProbData || tornadoProbData.features.length === 0)
    return null;

  return (
    <Source id="tornado-prob" type="geojson" data={tornadoProbData}>
      <Layer
        id="tornado-prob-fill"
        type="fill"
        paint={{
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "probability"],
            2, "#fbbf24",
            5, "#f97316",
            10, "#ef4444",
            15, "#dc2626",
            30, "#991b1b",
            45, "#7f1d1d",
          ],
          "fill-opacity": 0.25,
        }}
      />
      <Layer
        id="tornado-prob-border"
        type="line"
        paint={{
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "probability"],
            2, "#fbbf24",
            5, "#f97316",
            10, "#ef4444",
            15, "#dc2626",
            30, "#991b1b",
          ],
          "line-width": 2,
          "line-dasharray": [4, 2],
          "line-opacity": 0.7,
        }}
      />
      <Layer
        id="tornado-prob-label"
        type="symbol"
        layout={{
          "text-field": ["concat", ["to-string", ["get", "probability"]], "%"],
          "text-size": 11,
          "text-font": ["Open Sans Bold"],
          "text-allow-overlap": false,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        }}
      />
    </Source>
  );
}
