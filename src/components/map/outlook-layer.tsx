"use client";

import { useState, useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";
import type { SPCOutlookCollection } from "@/lib/types/weather";
import { outlookRiskToHex } from "@/lib/utils";

const POLL_INTERVAL = 900_000; // 15 min

export function OutlookLayer() {
  const { layers } = useMap();
  const [outlookData, setOutlookData] = useState<SPCOutlookCollection | null>(
    null
  );

  useEffect(() => {
    if (!layers.outlooks) return;

    const fetchOutlooks = async () => {
      try {
        const res = await fetch("/api/outlooks");
        if (res.ok) {
          const data = await res.json();
          setOutlookData(data);
        }
      } catch (e) {
        console.error("Failed to fetch outlooks:", e);
      }
    };

    fetchOutlooks();
    const interval = setInterval(fetchOutlooks, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [layers.outlooks]);

  if (!layers.outlooks || !outlookData || outlookData.features.length === 0)
    return null;

  return (
    <Source id="spc-outlooks" type="geojson" data={outlookData}>
      <Layer
        id="outlook-fill"
        type="fill"
        paint={{
          "fill-color": [
            "match",
            ["get", "risk_level"],
            "TSTM", outlookRiskToHex("TSTM"),
            "MRGL", outlookRiskToHex("MRGL"),
            "SLGT", outlookRiskToHex("SLGT"),
            "ENH", outlookRiskToHex("ENH"),
            "MDT", outlookRiskToHex("MDT"),
            "HIGH", outlookRiskToHex("HIGH"),
            "#888888",
          ],
          "fill-opacity": 0.18,
        }}
      />
      <Layer
        id="outlook-border"
        type="line"
        paint={{
          "line-color": [
            "match",
            ["get", "risk_level"],
            "TSTM", outlookRiskToHex("TSTM"),
            "MRGL", outlookRiskToHex("MRGL"),
            "SLGT", outlookRiskToHex("SLGT"),
            "ENH", outlookRiskToHex("ENH"),
            "MDT", outlookRiskToHex("MDT"),
            "HIGH", outlookRiskToHex("HIGH"),
            "#888888",
          ],
          "line-width": 1.5,
          "line-opacity": 0.6,
        }}
      />
    </Source>
  );
}
