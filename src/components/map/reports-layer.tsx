"use client";

import { useEffect, useCallback, useRef } from "react";
import { Source, Layer, Popup, useMap as useMapGL } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/lib/context/map-context";
import type { StormReportFeature } from "@/lib/types/weather";
import { useState } from "react";

const TYPE_COLORS: Record<string, string> = {
  tornado: "#ff3333",
  hail: "#5599ff",
  wind: "#44cc88",
  flood: "#33cc66",
  other: "#aaaaaa",
};

export function ReportsLayer() {
  const { layers, reportData } = useMap();
  const { current: map } = useMapGL();
  const [hoveredReport, setHoveredReport] = useState<StormReportFeature | null>(null);
  const reportDataRef = useRef(reportData);
  reportDataRef.current = reportData;

  const handleClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      setHoveredReport({
        type: "Feature",
        properties: feature.properties as StormReportFeature["properties"],
        geometry: { type: "Point", coordinates: coords },
      });
    },
    []
  );

  useEffect(() => {
    if (!map) return;
    const m = map.getMap();
    const onEnter = () => { m.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { m.getCanvas().style.cursor = ""; };
    m.on("mouseenter", "reports-circle", onEnter);
    m.on("mouseleave", "reports-circle", onLeave);
    m.on("click", "reports-circle", handleClick as unknown as maplibregl.Listener);
    return () => {
      m.off("mouseenter", "reports-circle", onEnter);
      m.off("mouseleave", "reports-circle", onLeave);
      m.off("click", "reports-circle", handleClick as unknown as maplibregl.Listener);
    };
  }, [map, handleClick]);

  if (!layers.reports || !reportData) return null;

  return (
    <>
      <Source id="storm-reports" type="geojson" data={reportData}>
        <Layer
          id="reports-circle"
          type="circle"
          paint={{
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 8, 6, 12, 10],
            "circle-color": [
              "match", ["get", "type"],
              "tornado", TYPE_COLORS.tornado,
              "hail", TYPE_COLORS.hail,
              "wind", TYPE_COLORS.wind,
              "flood", TYPE_COLORS.flood,
              TYPE_COLORS.other,
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
            "circle-opacity": 0.85,
          }}
        />
      </Source>

      {hoveredReport && (
        <Popup
          longitude={hoveredReport.geometry.coordinates[0]}
          latitude={hoveredReport.geometry.coordinates[1]}
          closeOnClick
          onClose={() => setHoveredReport(null)}
          anchor="bottom"
          offset={12}
        >
          <div className="min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: TYPE_COLORS[hoveredReport.properties.type] ?? TYPE_COLORS.other }}
              />
              <span className="font-semibold text-sm capitalize">
                {hoveredReport.properties.type}
              </span>
              {hoveredReport.properties.magnitude !== null && (
                <span className="text-xs text-muted-foreground font-mono">
                  {hoveredReport.properties.type === "hail"
                    ? `${hoveredReport.properties.magnitude}"`
                    : `${hoveredReport.properties.magnitude} mph`}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hoveredReport.properties.city}, {hoveredReport.properties.state}
            </p>
            {hoveredReport.properties.remark && (
              <p className="text-xs mt-1 leading-snug">
                {hoveredReport.properties.remark}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {hoveredReport.properties.source} &middot;{" "}
              {new Date(hoveredReport.properties.utc_valid).toLocaleTimeString(
                "en-US",
                { hour: "numeric", minute: "2-digit", timeZoneName: "short" }
              )}
            </p>
          </div>
        </Popup>
      )}
    </>
  );
}
