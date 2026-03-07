"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "@/lib/context/map-context";
import { outlookRiskToHex } from "@/lib/utils";

export function OutlookLayer() {
  const { layers, outlookData } = useMap();

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
