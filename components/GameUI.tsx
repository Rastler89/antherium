"use client";

import ChamberView from "./ChamberView";
import ConstructionPanel from "./ConstructionPanel";
import ExpeditionPanel from "./ExpeditionPanel";
import NotificationCenter from "./NotificationCenter";
import PopulationPanel from "./PopulationPanel";
import ResourcePanel from "./ResourcePanel";
import SaveLoadPanel from "./SaveLoadPanel";
import SettingsPanel from "./SettingsPanel";
import TechnologyTree from "./TechnologyTree";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useGame } from "@/context/GameContext";
import { saveGame } from "@/lib/storage";

export default function GameUI() {
  const { gameState, dispatch } = useGame();

  const shortcuts = {
    'KeyS': () => {
      saveGame(gameState);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', title: 'Game Saved', message: 'Your progress has been saved manually.' } });
    },
    'KeyF': () => dispatch({ type: 'START_EXPEDITION', payload: { resourceType: 'food', antsCount: 1 } }),
    'KeyW': () => dispatch({ type: 'START_EXPEDITION', payload: { resourceType: 'wood', antsCount: 1 } }),
    'KeyD': () => dispatch({ type: 'START_EXPEDITION', payload: { resourceType: 'dirt', antsCount: 1 } }),
    'KeyL': () => dispatch({ type: 'START_EXPEDITION', payload: { resourceType: 'leaves', antsCount: 1 } }),
  };

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <NotificationCenter />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-start mb-6">
            <header className="text-left">
              <h1 className="text-4xl font-bold">Antherium</h1>
              <p className="text-lg text-muted-foreground">Your ant empire awaits.</p>
            </header>
            <SettingsPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResourcePanel />
                  <PopulationPanel />
              </div>
              <ChamberView />
              <TechnologyTree />
          </div>
          <div className="space-y-4">
              <SaveLoadPanel />
              <ExpeditionPanel />
              <ConstructionPanel />
          </div>
        </div>
      </div>
    </>
  );
}
