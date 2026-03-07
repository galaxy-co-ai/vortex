"use client";

import { useMemo } from "react";
import { MapProvider, useMap } from "@/lib/context/map-context";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { TopBar } from "./top-bar";
import { LeftSidebar } from "./left-sidebar";
import { RightPanel } from "./right-panel";
import { BottomBar } from "./bottom-bar";
import { MapView } from "@/components/map/map-view";
import { ThreatBanner } from "./threat-banner";

export function CommandShell() {
  return (
    <MapProvider>
      <ShellLayout />
    </MapProvider>
  );
}

function ShellLayout() {
  const {
    toggleLayer, toggleTimelapse, togglePlay,
    setSidebarOpen, sidebarOpen, setSelectedAlert,
  } = useMap();

  const shortcutActions = useMemo(() => ({
    toggleLayer, toggleTimelapse, togglePlay,
    setSidebarOpen, sidebarOpen, setSelectedAlert,
  }), [toggleLayer, toggleTimelapse, togglePlay, setSidebarOpen, sidebarOpen, setSelectedAlert]);

  useKeyboardShortcuts(shortcutActions);

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftSidebar />
        <MapCenter />
        <RightPanel />
      </div>
    </div>
  );
}

function MapCenter() {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <MapView />
        <ThreatBanner />
      </div>
      <BottomBar />
    </div>
  );
}
