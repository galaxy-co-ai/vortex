"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { NWSAlertFeature, StormReportFeature } from "@/lib/types/weather";
import {
  DEFAULT_VIEW_STATE,
  DEFAULT_LAYER_VISIBILITY,
  type MapViewState,
  type LayerVisibility,
} from "@/lib/types/map";

interface MapContextValue {
  viewState: MapViewState;
  setViewState: (vs: MapViewState) => void;
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  radarOpacity: number;
  setRadarOpacity: (opacity: number) => void;
  selectedAlert: NWSAlertFeature | null;
  setSelectedAlert: (alert: NWSAlertFeature | null) => void;
  selectedReport: StormReportFeature | null;
  setSelectedReport: (report: StormReportFeature | null) => void;
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW_STATE);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYER_VISIBILITY);
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [selectedAlert, setSelectedAlert] = useState<NWSAlertFeature | null>(null);
  const [selectedReport, setSelectedReport] = useState<StormReportFeature | null>(null);

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const flyTo = useCallback(
    (longitude: number, latitude: number, zoom = 10) => {
      setViewState((prev) => ({ ...prev, longitude, latitude, zoom }));
    },
    []
  );

  return (
    <MapContext.Provider
      value={{
        viewState,
        setViewState,
        layers,
        toggleLayer,
        radarOpacity,
        setRadarOpacity,
        selectedAlert,
        setSelectedAlert,
        selectedReport,
        setSelectedReport,
        flyTo,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}
