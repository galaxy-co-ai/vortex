"use client";

import { useEffect } from "react";
import { MapProvider, useMap } from "@/lib/context/map-context";
import { TopBar } from "./top-bar";
import { LeftSidebar } from "./left-sidebar";
import { RightPanel } from "./right-panel";
import { BottomBar } from "./bottom-bar";
import { MapView } from "@/components/map/map-view";

export function CommandShell() {
  return (
    <MapProvider>
      <div className="h-dvh w-full flex flex-col overflow-hidden bg-background">
        <TopBar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <LeftSidebar />
          <MapCenter />
          <RightPanel />
        </div>
      </div>
    </MapProvider>
  );
}

function MapCenter() {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <MapView />
      </div>
      <BottomBar />
    </div>
  );
}
