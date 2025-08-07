"use client";

import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourcePanel() {
  const { gameState } = useGame();
  const { resources } = gameState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>🍯 Food: {resources.food}</li>
          <li>🟤 Dirt: {resources.dirt}</li>
          <li>🪵 Wood: {resources.wood}</li>
          <li>🍃 Leaves: {resources.leaves}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
