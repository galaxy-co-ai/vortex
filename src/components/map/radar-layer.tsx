"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";

const RADAR_TILE_URL =
  "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png";

export function RadarLayer() {
  const { layers, radarOpacity } = useMap();

  if (!layers.radar) return null;

  return (
    <Source
      id="nexrad-radar"
      type="raster"
      tiles={[`${RADAR_TILE_URL}?_t=${Math.floor(Date.now() / 300000)}`]}
      tileSize={256}
      attribution='<a href="https://mesonet.agron.iastate.edu/" target="_blank">Iowa Environmental Mesonet</a>'
    >
      <Layer
        id="nexrad-radar-layer"
        type="raster"
        paint={{
          "raster-opacity": radarOpacity,
          "raster-fade-duration": 300,
        }}
      />
    </Source>
  );
}
