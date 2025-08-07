"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GameSettings } from '@/types';

export default function SettingsPanel() {
  const { gameState, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<GameSettings>(gameState.settings);

  useEffect(() => {
    // Sync local state if the global state changes while the modal is closed
    if (!isOpen) {
      setLocalSettings(gameState.settings);
    }
  }, [gameState.settings, isOpen]);

  const handleSave = () => {
    dispatch({ type: 'CHANGE_SETTINGS', payload: localSettings });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Adjust your game settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="game-speed" className="text-right">
              Game Speed
            </Label>
            <Slider
              id="game-speed"
              min={0.5}
              max={5}
              step={0.5}
              value={[localSettings.gameSpeed]}
              onValueChange={(value) => setLocalSettings(prev => ({...prev, gameSpeed: value[0]}))}
              className="col-span-3"
            />
            <span className="col-start-2 col-span-3 text-sm text-muted-foreground">{localSettings.gameSpeed}x</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="autosave" className="text-right">
              Autosave (s)
            </Label>
            <Input
              id="autosave"
              type="number"
              value={localSettings.autoSaveInterval}
              onChange={(e) => setLocalSettings(prev => ({...prev, autoSaveInterval: parseInt(e.target.value, 10) || 30 }))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
