export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface LayerVisibility {
  radar: boolean;
  velocity: boolean;
  warnings: boolean;
  outlooks: boolean;
  tornadoProb: boolean;
  mesoscale: boolean;
  reports: boolean;
}

export interface TimelapseState {
  enabled: boolean;
  frames: string[];
  currentIndex: number;
  playing: boolean;
  speed: number;
}

export interface DataFreshness {
  radar: Date | null;
  alerts: Date | null;
  outlooks: Date | null;
  reports: Date | null;
}

export const DEFAULT_VIEW_STATE: MapViewState = {
  longitude: -97.4867,
  latitude: 35.3395,
  zoom: 7,
  bearing: 0,
  pitch: 0,
};

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  radar: true,
  velocity: false,
  warnings: true,
  outlooks: true,
  tornadoProb: false,
  mesoscale: true,
  reports: true,
};

export const DEFAULT_TIMELAPSE: TimelapseState = {
  enabled: false,
  frames: [],
  currentIndex: 0,
  playing: false,
  speed: 1,
};
