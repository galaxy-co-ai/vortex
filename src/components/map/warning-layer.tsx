"use client";

import { useEffect, useCallback, useMemo } from "react";
import { Source, Layer, useMap as useMapGL } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/lib/context/map-context";

export function WarningLayer() {
  const { layers, alerts, setSelectedAlert } = useMap();
  const { current: map } = useMapGL();

  // Build a clean GeoJSON FeatureCollection from shared alert data
  const geojson = useMemo(() => {
    if (!alerts.length) return null;
    return {
      type: "FeatureCollection" as const,
      features: alerts
        .filter((f) => f.geometry !== null)
        .map((f) => ({
          type: "Feature" as const,
          id: f.properties.id,
          properties: { id: f.properties.id, event: f.properties.event },
          geometry: f.geometry!,
        })),
    };
  }, [alerts]);

  const handleClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const alert = alerts.find(
        (f) => f.properties.id === feature.properties?.id
      );
      if (alert) setSelectedAlert(alert);
    },
    [alerts, setSelectedAlert]
  );

  // Cursor + click handlers
  useEffect(() => {
    if (!map) return;
    const mapInstance = map.getMap();

    const layerIds = [
      "warnings-tornado-fill",
      "warnings-severe-fill",
      "warnings-flood-fill",
      "warnings-watch-line",
    ];

    const onEnter = () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    };
    const onLeave = () => {
      mapInstance.getCanvas().style.cursor = "";
    };

    layerIds.forEach((id) => {
      mapInstance.on("mouseenter", id, onEnter);
      mapInstance.on("mouseleave", id, onLeave);
      mapInstance.on(
        "click",
        id,
        handleClick as unknown as maplibregl.Listener
      );
    });

    return () => {
      layerIds.forEach((id) => {
        mapInstance.off("mouseenter", id, onEnter);
        mapInstance.off("mouseleave", id, onLeave);
        mapInstance.off(
          "click",
          id,
          handleClick as unknown as maplibregl.Listener
        );
      });
    };
  }, [map, handleClick]);

  if (!layers.warnings || !geojson) return null;

  return (
    <Source id="nws-alerts" type="geojson" data={geojson}>
      {/* Tornado Warning — red fill + bold border */}
      <Layer
        id="warnings-tornado-fill"
        type="fill"
        filter={["==", ["get", "event"], "Tornado Warning"]}
        paint={{
          "fill-color": "#ff3333",
          "fill-opacity": 0.25,
        }}
      />
      <Layer
        id="warnings-tornado-border"
        type="line"
        filter={["==", ["get", "event"], "Tornado Warning"]}
        paint={{
          "line-color": "#ff3333",
          "line-width": 3,
          "line-opacity": 0.9,
        }}
      />

      {/* Severe Thunderstorm Warning — orange */}
      <Layer
        id="warnings-severe-fill"
        type="fill"
        filter={["==", ["get", "event"], "Severe Thunderstorm Warning"]}
        paint={{
          "fill-color": "#ff9900",
          "fill-opacity": 0.2,
        }}
      />
      <Layer
        id="warnings-severe-border"
        type="line"
        filter={["==", ["get", "event"], "Severe Thunderstorm Warning"]}
        paint={{
          "line-color": "#ff9900",
          "line-width": 2,
        }}
      />

      {/* Flash Flood Warning — green */}
      <Layer
        id="warnings-flood-fill"
        type="fill"
        filter={[
          "any",
          ["==", ["get", "event"], "Flash Flood Warning"],
          ["==", ["get", "event"], "Flood Warning"],
        ]}
        paint={{
          "fill-color": "#33cc66",
          "fill-opacity": 0.15,
        }}
      />
      <Layer
        id="warnings-flood-border"
        type="line"
        filter={[
          "any",
          ["==", ["get", "event"], "Flash Flood Warning"],
          ["==", ["get", "event"], "Flood Warning"],
        ]}
        paint={{
          "line-color": "#33cc66",
          "line-width": 2,
        }}
      />

      {/* Watches — dashed outline, no fill */}
      <Layer
        id="warnings-watch-line"
        type="line"
        filter={[
          "any",
          ["==", ["get", "event"], "Tornado Watch"],
          ["==", ["get", "event"], "Severe Thunderstorm Watch"],
        ]}
        paint={{
          "line-color": "#ffff00",
          "line-width": 2,
          "line-dasharray": [4, 3],
        }}
      />
    </Source>
  );
}
