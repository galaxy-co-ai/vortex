export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface LayerVisibility {
  radar: boolean;
  warnings: boolean;
  outlooks: boolean;
  reports: boolean;
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
  warnings: true,
  outlooks: true,
  reports: true,
};
