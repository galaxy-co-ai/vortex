"use client";

import { useState, useEffect, useCallback } from "react";
import { Source, Layer, useMap as useMapGL } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/lib/context/map-context";
import type { NWSAlertCollection } from "@/lib/types/weather";

const POLL_INTERVAL = 30_000;

export function WarningLayer() {
  const { layers, setSelectedAlert } = useMap();
  const { current: map } = useMapGL();
  const [alertData, setAlertData] = useState<NWSAlertCollection | null>(null);

  useEffect(() => {
    if (!layers.warnings) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlertData(data);
        }
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [layers.warnings]);

  const handleClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || !alertData) return;

      const alert = alertData.features.find(
        (f) => f.properties.id === feature.properties?.id
      );
      if (alert) setSelectedAlert(alert);
    },
    [alertData, setSelectedAlert]
  );

  // Set cursor on hover
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
      mapInstance.on("click", id, handleClick as unknown as maplibregl.Listener);
    });

    return () => {
      layerIds.forEach((id) => {
        mapInstance.off("mouseenter", id, onEnter);
        mapInstance.off("mouseleave", id, onLeave);
        mapInstance.off("click", id, handleClick as unknown as maplibregl.Listener);
      });
    };
  }, [map, handleClick]);

  if (!layers.warnings || !alertData) return null;

  return (
    <Source id="nws-alerts" type="geojson" data={alertData as unknown as GeoJSON.FeatureCollection}>
      {/* Tornado Warning — red fill + pulsing border */}
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
          "line-color": "#990033",
          "line-width": 2,
          "line-dasharray": [4, 3],
        }}
      />
    </Source>
  );
}
