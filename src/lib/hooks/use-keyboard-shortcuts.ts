"use client";

import { useEffect } from "react";
import type { LayerVisibility } from "@/lib/types/map";

interface ShortcutActions {
  toggleLayer: (layer: keyof LayerVisibility) => void;
  toggleTimelapse: () => void;
  togglePlay: () => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSelectedAlert: (alert: null) => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "r":
          actions.toggleLayer("radar");
          break;
        case "v":
          actions.toggleLayer("velocity");
          break;
        case "w":
          actions.toggleLayer("warnings");
          break;
        case "o":
          actions.toggleLayer("outlooks");
          break;
        case "t":
          actions.toggleTimelapse();
          break;
        case " ":
          e.preventDefault();
          actions.togglePlay();
          break;
        case "s":
          actions.setSidebarOpen(!actions.sidebarOpen);
          break;
        case "escape":
          actions.setSelectedAlert(null);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
