"use client";

import { useGame } from "@/context/GameContext";
import { saveGame } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SaveLoadPanel() {
  const { gameState, dispatch } = useGame();

  const handleSave = () => {
    saveGame(gameState);
    // In a real app, we'd use a toast notification here.
    console.log("Game saved manually!");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your game? All progress will be lost.")) {
      dispatch({ type: 'RESET_GAME' });
      console.log("Game has been reset.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <Button onClick={handleSave}>Save Game</Button>
        <Button variant="destructive" onClick={handleReset}>Reset Game</Button>
      </CardContent>
    </Card>
  );
}
