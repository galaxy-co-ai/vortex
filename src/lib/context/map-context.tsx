"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  NWSAlertFeature,
  NWSAlertCollection,
  StormReportFeature,
} from "@/lib/types/weather";
import {
  DEFAULT_VIEW_STATE,
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_TIMELAPSE,
  type MapViewState,
  type LayerVisibility,
  type TimelapseState,
  type DataFreshness,
} from "@/lib/types/map";
import { sortBySeverity } from "@/lib/utils";
import { generateFrameTimestamps } from "@/lib/utils/timelapse";

interface AlertStats {
  tornadoWarnings: number;
  severeWarnings: number;
  watches: number;
  floodWarnings: number;
  total: number;
}

interface MapContextValue {
  // View
  viewState: MapViewState;
  setViewState: (vs: MapViewState) => void;
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;

  // Layers
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  radarOpacity: number;
  setRadarOpacity: (opacity: number) => void;

  // Shared alert data (single fetch, used by sidebar + warning layer)
  alerts: NWSAlertFeature[];
  alertStats: AlertStats;
  alertsLoading: boolean;

  // Selection
  selectedAlert: NWSAlertFeature | null;
  setSelectedAlert: (alert: NWSAlertFeature | null) => void;
  selectedReport: StormReportFeature | null;
  setSelectedReport: (report: StormReportFeature | null) => void;

  // Shell state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Timelapse
  timelapse: TimelapseState;
  toggleTimelapse: () => void;
  togglePlay: () => void;
  setFrame: (index: number) => void;
  setTimelapseSpeed: (speed: number) => void;

  // Data freshness
  dataFreshness: DataFreshness;
  updateFreshness: (key: keyof DataFreshness) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

const ALERT_POLL_INTERVAL = 30_000;

function computeAlertStats(alerts: NWSAlertFeature[]): AlertStats {
  let tornadoWarnings = 0;
  let severeWarnings = 0;
  let watches = 0;
  let floodWarnings = 0;

  for (const a of alerts) {
    const e = a.properties.event;
    if (e === "Tornado Warning") tornadoWarnings++;
    else if (e === "Severe Thunderstorm Warning") severeWarnings++;
    else if (e === "Tornado Watch" || e === "Severe Thunderstorm Watch")
      watches++;
    else if (e === "Flash Flood Warning" || e === "Flood Warning")
      floodWarnings++;
  }

  return {
    tornadoWarnings,
    severeWarnings,
    watches,
    floodWarnings,
    total: alerts.length,
  };
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW_STATE);
  const [layers, setLayers] = useState<LayerVisibility>(
    DEFAULT_LAYER_VISIBILITY
  );
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [selectedAlert, setSelectedAlert] = useState<NWSAlertFeature | null>(
    null
  );
  const [selectedReport, setSelectedReport] =
    useState<StormReportFeature | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Shared alert data — single fetch, used by sidebar + warning layer + stats
  const [alerts, setAlerts] = useState<NWSAlertFeature[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    tornadoWarnings: 0,
    severeWarnings: 0,
    watches: 0,
    floodWarnings: 0,
    total: 0,
  });

  // Timelapse
  const [timelapse, setTimelapse] = useState<TimelapseState>(DEFAULT_TIMELAPSE);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data freshness
  const [dataFreshness, setDataFreshness] = useState<DataFreshness>({
    radar: null,
    alerts: null,
    outlooks: null,
    reports: null,
  });

  // Centralized alert fetching
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data: NWSAlertCollection = await res.json();
          const sorted = sortBySeverity(data.features);
          setAlerts(sorted);
          setAlertStats(computeAlertStats(sorted));
          setDataFreshness((prev) => ({ ...prev, alerts: new Date() }));
        }
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, ALERT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Timelapse playback
  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    if (timelapse.playing && timelapse.frames.length > 0) {
      const baseInterval = 300; // ms per frame at 1x
      const interval = baseInterval / timelapse.speed;

      playIntervalRef.current = setInterval(() => {
        setTimelapse((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.frames.length,
        }));
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [timelapse.playing, timelapse.speed, timelapse.frames.length]);

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const flyTo = useCallback(
    (longitude: number, latitude: number, zoom = 10) => {
      setViewState((prev) => ({ ...prev, longitude, latitude, zoom }));
    },
    []
  );

  const toggleTimelapse = useCallback(() => {
    setTimelapse((prev) => {
      if (prev.enabled) {
        // Disable: stop playing, clear frames
        return { ...DEFAULT_TIMELAPSE };
      }
      // Enable: generate frames
      const frames = generateFrameTimestamps(20, 5);
      return {
        enabled: true,
        frames,
        currentIndex: frames.length - 1,
        playing: false,
        speed: 1,
      };
    });
  }, []);

  const togglePlay = useCallback(() => {
    setTimelapse((prev) => ({ ...prev, playing: !prev.playing }));
  }, []);

  const setFrame = useCallback((index: number) => {
    setTimelapse((prev) => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.frames.length - 1)),
      playing: false,
    }));
  }, []);

  const setTimelapseSpeed = useCallback((speed: number) => {
    setTimelapse((prev) => ({ ...prev, speed }));
  }, []);

  const updateFreshness = useCallback((key: keyof DataFreshness) => {
    setDataFreshness((prev) => ({ ...prev, [key]: new Date() }));
  }, []);

  return (
    <MapContext.Provider
      value={{
        viewState,
        setViewState,
        flyTo,
        layers,
        toggleLayer,
        radarOpacity,
        setRadarOpacity,
        alerts,
        alertStats,
        alertsLoading,
        selectedAlert,
        setSelectedAlert,
        selectedReport,
        setSelectedReport,
        sidebarOpen,
        setSidebarOpen,
        timelapse,
        toggleTimelapse,
        togglePlay,
        setFrame,
        setTimelapseSpeed,
        dataFreshness,
        updateFreshness,
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
