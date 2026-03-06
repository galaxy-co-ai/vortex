"use client";

import { useState, useEffect, useCallback } from "react";
import { Source, Layer, Popup, useMap as useMapGL } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/lib/context/map-context";
import type {
  StormReportCollection,
  StormReportFeature,
} from "@/lib/types/weather";

const POLL_INTERVAL = 300_000; // 5 min

const TYPE_COLORS: Record<string, string> = {
  tornado: "#ff3333",
  hail: "#5599ff",
  wind: "#44cc88",
  flood: "#33cc66",
  other: "#aaaaaa",
};

export function ReportsLayer() {
  const { layers } = useMap();
  const { current: map } = useMapGL();
  const [reportData, setReportData] = useState<StormReportCollection | null>(null);
  const [hoveredReport, setHoveredReport] = useState<StormReportFeature | null>(null);

  useEffect(() => {
    if (!layers.reports) return;

    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (e) {
        console.error("Failed to fetch reports:", e);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [layers.reports]);

  const handleClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || !reportData) return;

      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      setHoveredReport({
        type: "Feature",
        properties: feature.properties as StormReportFeature["properties"],
        geometry: { type: "Point", coordinates: coords },
      });
    },
    [reportData]
  );

  // Cursor on hover
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
  }, [map]);

  if (!layers.reports || !reportData) return null;

  return (
    <>
      <Source id="storm-reports" type="geojson" data={reportData}>
        <Layer
          id="reports-circle"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 3,
              8, 6,
              12, 10,
            ],
            "circle-color": [
              "match",
              ["get", "type"],
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
                style={{
                  backgroundColor:
                    TYPE_COLORS[hoveredReport.properties.type] ?? TYPE_COLORS.other,
                }}
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
