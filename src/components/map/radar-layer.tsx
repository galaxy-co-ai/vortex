"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";
import {
  frameToTileUrl,
  reflectivityTileUrl,
  velocityTileUrl,
} from "@/lib/utils/timelapse";

const IEM_ATTRIBUTION =
  '<a href="https://mesonet.agron.iastate.edu/" target="_blank">Iowa Environmental Mesonet</a>';

export function RadarLayer() {
  const { layers, radarOpacity, timelapse } = useMap();

  const reflectUrl = useMemo(() => {
    if (timelapse.enabled && timelapse.frames.length > 0) {
      return frameToTileUrl(timelapse.frames[timelapse.currentIndex]);
    }
    return reflectivityTileUrl();
  }, [timelapse.enabled, timelapse.frames, timelapse.currentIndex]);

  const velUrl = useMemo(() => velocityTileUrl(), []);

  return (
    <>
      {/* Reflectivity — N0B high-res (~0.25km) */}
      {layers.radar && (
        <Source
          id="nexrad-reflect"
          type="raster"
          tiles={[reflectUrl]}
          tileSize={256}
          attribution={IEM_ATTRIBUTION}
        >
          <Layer
            id="nexrad-reflect-layer"
            type="raster"
            paint={{
              "raster-opacity": radarOpacity,
              "raster-fade-duration": timelapse.playing ? 0 : 300,
            }}
          />
        </Source>
      )}

      {/* Storm-Relative Velocity — N0S */}
      {layers.velocity && (
        <Source
          id="nexrad-velocity"
          type="raster"
          tiles={[velUrl]}
          tileSize={256}
          attribution={IEM_ATTRIBUTION}
        >
          <Layer
            id="nexrad-velocity-layer"
            type="raster"
            paint={{
              "raster-opacity": 0.6,
              "raster-fade-duration": 300,
            }}
          />
        </Source>
      )}
    </>
  );
}
