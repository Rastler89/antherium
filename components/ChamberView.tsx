"use client";

import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // I will need to create this component next

export default function ChamberView() {
  const { gameState } = useGame();
  const { chambers } = gameState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anthill Chambers</CardTitle>
      </CardHeader>
      <CardContent>
        {chambers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chambers.map(chamber => (
              <Badge key={chamber.id} variant="secondary">
                {chamber.type.replace("_", " ")} (Lvl {chamber.level})
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Your anthill is empty. Build some chambers!</p>
        )}
      </CardContent>
    </Card>
  );
}
