"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";
import { frameToTileUrl, frameTileUrlLive } from "@/lib/utils/timelapse";

export function RadarLayer() {
  const { layers, radarOpacity, timelapse, updateFreshness } = useMap();

  const tileUrl = useMemo(() => {
    if (timelapse.enabled && timelapse.frames.length > 0) {
      return frameToTileUrl(timelapse.frames[timelapse.currentIndex]);
    }
    updateFreshness("radar");
    return frameTileUrlLive();
  }, [
    timelapse.enabled,
    timelapse.frames,
    timelapse.currentIndex,
    updateFreshness,
  ]);

  if (!layers.radar) return null;

  return (
    <Source
      id="nexrad-radar"
      type="raster"
      tiles={[tileUrl]}
      tileSize={256}
      attribution='<a href="https://mesonet.agron.iastate.edu/" target="_blank">Iowa Environmental Mesonet</a>'
    >
      <Layer
        id="nexrad-radar-layer"
        type="raster"
        paint={{
          "raster-opacity": radarOpacity,
          "raster-fade-duration": timelapse.playing ? 0 : 300,
        }}
      />
    </Source>
  );
}
