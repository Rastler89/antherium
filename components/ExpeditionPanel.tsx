"use client";

import { useGame } from "@/context/GameContext";
import { ResourceType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Helper function to format time
const formatTime = (ms: number) => {
  if (ms < 0) ms = 0;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function ExpeditionPanel() {
  const { gameState, dispatch } = useGame();
  const { expeditions, ants, currentTime } = gameState;

  const availableAnts = ants.filter(ant => ant.status === 'idle').length;

  const handleStartExpedition = (resourceType: ResourceType) => {
    dispatch({
      type: 'START_EXPEDITION',
      payload: { resourceType, antsCount: 1 }
    });
  };

  const resourceTypes: ResourceType[] = ["food", "dirt", "wood", "leaves"];

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Expeditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Start New Expedition</h4>
          <p className="text-sm text-muted-foreground mb-2">Available Ants: {availableAnts}</p>
          <div className="grid grid-cols-2 gap-2">
            {resourceTypes.map(type => (
              <Button
                key={type}
                variant="outline"
                disabled={availableAnts < 1}
                onClick={() => handleStartExpedition(type)}
              >
                Find {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Active Expeditions</h4>
          {expeditions.length > 0 ? (
            <ul className="space-y-2">
              {expeditions.map(exp => (
                <li key={exp.id} className="text-sm border-b pb-2">
                  <p>Gathering {exp.type} ({exp.antsCount} ants)</p>
                  <p className="text-muted-foreground">
                    Time remaining: {formatTime(exp.endTime - currentTime)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No active expeditions.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
