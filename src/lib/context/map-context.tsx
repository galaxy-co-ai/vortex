"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type {
  NWSAlertFeature,
  NWSAlertCollection,
  StormReportFeature,
  StormReportCollection,
  SPCOutlookCollection,
  TornadoProbCollection,
  MesoscaleDiscussionCollection,
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

export interface AlertStats {
  tornadoWarnings: number;
  severeWarnings: number;
  watches: number;
  floodWarnings: number;
  total: number;
}

interface MapContextValue {
  viewState: MapViewState;
  setViewState: (vs: MapViewState) => void;
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;

  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  radarOpacity: number;
  setRadarOpacity: (opacity: number) => void;

  // Centralized data (single fetch per resource)
  alerts: NWSAlertFeature[];
  alertStats: AlertStats;
  alertsLoading: boolean;
  outlookData: SPCOutlookCollection | null;
  tornadoProbData: TornadoProbCollection | null;
  mesoscaleData: MesoscaleDiscussionCollection | null;
  reportData: StormReportCollection | null;

  selectedAlert: NWSAlertFeature | null;
  setSelectedAlert: (alert: NWSAlertFeature | null) => void;
  selectedReport: StormReportFeature | null;
  setSelectedReport: (report: StormReportFeature | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  timelapse: TimelapseState;
  toggleTimelapse: () => void;
  togglePlay: () => void;
  setFrame: (index: number) => void;
  setTimelapseSpeed: (speed: number) => void;

  dataFreshness: DataFreshness;
}

const MapContext = createContext<MapContextValue | null>(null);

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
  return { tornadoWarnings, severeWarnings, watches, floodWarnings, total: alerts.length };
}

export function MapProvider({ children }: { children: ReactNode }) {
  // View
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW_STATE);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYER_VISIBILITY);
  const [radarOpacity, setRadarOpacity] = useState(0.7);

  // Selection
  const [selectedAlert, setSelectedAlert] = useState<NWSAlertFeature | null>(null);
  const [selectedReport, setSelectedReport] = useState<StormReportFeature | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Centralized data
  const [alerts, setAlerts] = useState<NWSAlertFeature[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    tornadoWarnings: 0, severeWarnings: 0, watches: 0, floodWarnings: 0, total: 0,
  });
  const [outlookData, setOutlookData] = useState<SPCOutlookCollection | null>(null);
  const [tornadoProbData, setTornadoProbData] = useState<TornadoProbCollection | null>(null);
  const [mesoscaleData, setMesoscaleData] = useState<MesoscaleDiscussionCollection | null>(null);
  const [reportData, setReportData] = useState<StormReportCollection | null>(null);

  // Timelapse
  const [timelapse, setTimelapse] = useState<TimelapseState>(DEFAULT_TIMELAPSE);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data freshness
  const [dataFreshness, setDataFreshness] = useState<DataFreshness>({
    radar: null, alerts: null, outlooks: null, reports: null,
  });

  // ── Centralized polling ────────────────────────────────
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data: NWSAlertCollection = await res.json();
          const sorted = sortBySeverity(data.features);
          setAlerts(sorted);
          setAlertStats(computeAlertStats(sorted));
          setDataFreshness((p) => ({ ...p, alerts: new Date() }));
        }
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
      } finally {
        setAlertsLoading(false);
      }
    };

    const fetchOutlooks = async () => {
      try {
        const res = await fetch("/api/outlooks");
        if (res.ok) {
          const data = await res.json();
          setOutlookData(data);
          setDataFreshness((p) => ({ ...p, outlooks: new Date() }));
        }
      } catch (e) {
        console.error("Failed to fetch outlooks:", e);
      }
    };

    const fetchTornadoProb = async () => {
      try {
        const res = await fetch("/api/tornado-prob");
        if (res.ok) {
          const data = await res.json();
          setTornadoProbData(data);
        }
      } catch (e) {
        console.error("Failed to fetch tornado probability:", e);
      }
    };

    const fetchMesoscale = async () => {
      try {
        const res = await fetch("/api/mesoscale");
        if (res.ok) {
          const data = await res.json();
          setMesoscaleData(data);
        }
      } catch (e) {
        console.error("Failed to fetch mesoscale discussions:", e);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
          setDataFreshness((p) => ({ ...p, reports: new Date() }));
        }
      } catch (e) {
        console.error("Failed to fetch reports:", e);
      }
    };

    // Initial fetch all
    fetchAlerts();
    fetchOutlooks();
    fetchTornadoProb();
    fetchMesoscale();
    fetchReports();

    // Staggered intervals
    const alertInterval = setInterval(fetchAlerts, 30_000);
    const outlookInterval = setInterval(fetchOutlooks, 900_000);
    const torProbInterval = setInterval(fetchTornadoProb, 900_000);
    const mcdInterval = setInterval(fetchMesoscale, 300_000);
    const reportInterval = setInterval(fetchReports, 300_000);

    return () => {
      clearInterval(alertInterval);
      clearInterval(outlookInterval);
      clearInterval(torProbInterval);
      clearInterval(mcdInterval);
      clearInterval(reportInterval);
    };
  }, []);

  // ── Timelapse playback ─────────────────────────────────
  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    if (timelapse.playing && timelapse.frames.length > 0) {
      const ms = Math.round(300 / timelapse.speed);
      playIntervalRef.current = setInterval(() => {
        setTimelapse((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.frames.length,
        }));
      }, ms);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [timelapse.playing, timelapse.speed, timelapse.frames.length]);

  // ── Stable callbacks ───────────────────────────────────
  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const flyTo = useCallback((longitude: number, latitude: number, zoom = 10) => {
    setViewState((prev) => ({ ...prev, longitude, latitude, zoom }));
  }, []);

  const toggleTimelapse = useCallback(() => {
    setTimelapse((prev) => {
      if (prev.enabled) return { ...DEFAULT_TIMELAPSE };
      const frames = generateFrameTimestamps(20, 5);
      return { enabled: true, frames, currentIndex: frames.length - 1, playing: false, speed: 1 };
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

  // ── Memoized context value ─────────────────────────────
  const value = useMemo<MapContextValue>(
    () => ({
      viewState, setViewState, flyTo,
      layers, toggleLayer, radarOpacity, setRadarOpacity,
      alerts, alertStats, alertsLoading, outlookData, tornadoProbData, mesoscaleData, reportData,
      selectedAlert, setSelectedAlert, selectedReport, setSelectedReport,
      sidebarOpen, setSidebarOpen,
      timelapse, toggleTimelapse, togglePlay, setFrame, setTimelapseSpeed,
      dataFreshness,
    }),
    [
      viewState, flyTo,
      layers, toggleLayer, radarOpacity,
      alerts, alertStats, alertsLoading, outlookData, tornadoProbData, mesoscaleData, reportData,
      selectedAlert, selectedReport,
      sidebarOpen,
      timelapse, toggleTimelapse, togglePlay, setFrame, setTimelapseSpeed,
      dataFreshness,
    ]
  );

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}
