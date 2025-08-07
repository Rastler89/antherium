"use client";

import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TECHNOLOGIES, TechId } from "@/lib/constants";
import { ResourceType } from "@/types";

/**
 * Renders the technology tree UI, allowing players to view and start research projects.
 */
export default function TechnologyTree() {
  const { gameState, dispatch } = useGame();
  const { resources, researchedTechs, currentResearch, currentTime } = gameState;

  /**
   * Dispatches the action to start researching a new technology.
   * @param techId The ID of the technology to research.
   */
  const handleStartResearch = (techId: TechId) => {
    dispatch({ type: 'START_RESEARCH', payload: { techId } });
  };

  /**
   * Checks if the player has enough resources to research a given technology.
   * @param techId The ID of the technology to check.
   * @returns True if the player can afford the technology, false otherwise.
   */
  const canAfford = (techId: TechId): boolean => {
    const cost = TECHNOLOGIES[techId].cost;
    for (const resource in cost) {
      if (resources[resource as ResourceType] < cost[resource as keyof typeof cost]!) {
        return false;
      }
    }
    return true;
  };

  /**
   * Checks if the player has researched all prerequisites for a given technology.
   * @param techId The ID of the technology to check.
   * @returns True if all dependencies are met, false otherwise.
   */
  const hasDependencies = (techId: TechId): boolean => {
    const dependencies = TECHNOLOGIES[techId].dependencies;
    return dependencies.every(dep => researchedTechs.includes(dep));
  };

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Technology Tree</CardTitle>
      </CardHeader>
      <CardContent>
        {currentResearch ? (
          <div className="mb-6 p-4 border rounded-lg">
            <h4 className="font-semibold">Currently Researching: {TECHNOLOGIES[currentResearch.techId].name}</h4>
            <Progress
              value={((currentTime - currentResearch.startTime) / (currentResearch.endTime - currentResearch.startTime)) * 100}
              className="mt-2"
            />
          </div>
        ) : null}

        <div className="space-y-4">
          {Object.keys(TECHNOLOGIES).map(key => {
            const techId = key as TechId;
            const tech = TECHNOLOGIES[techId];

            // Determine the current status of the technology for the player
            const status = researchedTechs.includes(techId)
              ? 'Researched'
              : currentResearch?.techId === techId
              ? 'In Progress'
              : !hasDependencies(techId)
              ? 'Locked'
              : !canAfford(techId)
              ? 'Insufficient Resources'
              : 'Available';

            return (
              <div key={techId} className="flex items-center justify-between p-2 border-b">
                <div>
                  <p className="font-semibold">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                  <p className="text-xs">
                    Cost: {Object.entries(tech.cost).map(([res, val]) => `${val} ${res}`).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  {status === 'Available' && (
                    <Button size="sm" onClick={() => handleStartResearch(techId)}>
                      Research
                    </Button>
                  )}
                  {status !== 'Available' && (
                    <p className="text-sm font-medium text-muted-foreground">{status}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
