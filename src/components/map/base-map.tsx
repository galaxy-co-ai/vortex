"use client";

import { useCallback, type ReactNode } from "react";
import {
  Map,
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  AttributionControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "@/lib/context/map-context";

// Free dark map style — Protomaps dark basemap via MapTiler
const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ||
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface BaseMapProps {
  children?: ReactNode;
}

export function BaseMap({ children }: BaseMapProps) {
  const { viewState, setViewState } = useMap();

  const onMove = useCallback(
    (evt: { viewState: typeof viewState }) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      maxZoom={18}
      minZoom={3}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <GeolocateControl
        position="bottom-right"
        trackUserLocation
        showAccuracyCircle={false}
      />
      <FullscreenControl position="bottom-right" />
      <AttributionControl position="bottom-left" compact />
      {children}
    </Map>
  );
}
