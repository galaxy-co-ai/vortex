"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { Source, Layer, useMap as useMapGL } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/lib/context/map-context";

const LAYER_IDS = [
  "warnings-tornado-fill",
  "warnings-severe-fill",
  "warnings-flood-fill",
  "warnings-watch-line",
];

export function WarningLayer() {
  const { layers, alerts, setSelectedAlert } = useMap();
  const { current: map } = useMapGL();
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  // Build clean GeoJSON — only rebuild when alert IDs change
  const alertIds = useMemo(
    () => alerts.map((a) => a.properties.id).join(","),
    [alerts]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertIds]);

  // Stable click handler — uses ref to avoid event listener churn
  const handleClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const alert = alertsRef.current.find(
        (f) => f.properties.id === feature.properties?.id
      );
      if (alert) setSelectedAlert(alert);
    },
    [setSelectedAlert]
  );

  // Event listeners — stable deps, no churn
  useEffect(() => {
    if (!map) return;
    const m = map.getMap();

    const onEnter = () => { m.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { m.getCanvas().style.cursor = ""; };

    LAYER_IDS.forEach((id) => {
      m.on("mouseenter", id, onEnter);
      m.on("mouseleave", id, onLeave);
      m.on("click", id, handleClick as unknown as maplibregl.Listener);
    });

    return () => {
      LAYER_IDS.forEach((id) => {
        m.off("mouseenter", id, onEnter);
        m.off("mouseleave", id, onLeave);
        m.off("click", id, handleClick as unknown as maplibregl.Listener);
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
        paint={{ "fill-color": "#ff3333", "fill-opacity": 0.25 }}
      />
      <Layer
        id="warnings-tornado-border"
        type="line"
        filter={["==", ["get", "event"], "Tornado Warning"]}
        paint={{ "line-color": "#ff3333", "line-width": 3, "line-opacity": 0.9 }}
      />

      {/* Severe Thunderstorm Warning — orange */}
      <Layer
        id="warnings-severe-fill"
        type="fill"
        filter={["==", ["get", "event"], "Severe Thunderstorm Warning"]}
        paint={{ "fill-color": "#ff9900", "fill-opacity": 0.2 }}
      />
      <Layer
        id="warnings-severe-border"
        type="line"
        filter={["==", ["get", "event"], "Severe Thunderstorm Warning"]}
        paint={{ "line-color": "#ff9900", "line-width": 2 }}
      />

      {/* Flash Flood / Flood Warning — green */}
      <Layer
        id="warnings-flood-fill"
        type="fill"
        filter={["any", ["==", ["get", "event"], "Flash Flood Warning"], ["==", ["get", "event"], "Flood Warning"]]}
        paint={{ "fill-color": "#33cc66", "fill-opacity": 0.15 }}
      />
      <Layer
        id="warnings-flood-border"
        type="line"
        filter={["any", ["==", ["get", "event"], "Flash Flood Warning"], ["==", ["get", "event"], "Flood Warning"]]}
        paint={{ "line-color": "#33cc66", "line-width": 2 }}
      />

      {/* Watches — dashed yellow */}
      <Layer
        id="warnings-watch-line"
        type="line"
        filter={["any", ["==", ["get", "event"], "Tornado Watch"], ["==", ["get", "event"], "Severe Thunderstorm Watch"]]}
        paint={{ "line-color": "#ffff00", "line-width": 2, "line-dasharray": [4, 3] }}
      />
    </Source>
  );
}
