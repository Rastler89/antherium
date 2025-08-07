"use client";

import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PopulationPanel() {
  const { gameState } = useGame();
  const { eggs, larvae, ants, chambers } = gameState;

  // Note: This logic is duplicated from GameContext.
  // It should be refactored into a shared utility function later.
  const maxPopulation = chambers
    .filter((c) => c.type === "nursery")
    .reduce((total, nursery) => total + nursery.level * 5, 0);

  const currentPopulation = eggs.length + larvae.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Population</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>🥚 Eggs: {eggs.length}</li>
          <li>🐛 Larvae: {larvae.length}</li>
          <li>🐜 Ants: {ants.length}</li>
        </ul>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Population Capacity: {currentPopulation} / {maxPopulation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
