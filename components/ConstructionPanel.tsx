"use client";

import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CHAMBER_COSTS, CHAMBER_INFO } from "@/lib/constants";
import { ChamberType, ResourceType } from "@/types";

/**
 * A UI component that displays options for building new chambers in the anthill.
 * It allows the player to see costs and initiate construction.
 */
export default function ConstructionPanel() {
  const { gameState, dispatch } = useGame();
  const { resources, chambers } = gameState;

  const buildableChambers = Object.keys(CHAMBER_COSTS.build) as Exclude<ChamberType, 'royal'>[];

  /**
   * Checks if the player has enough resources to build a given chamber type.
   * @param chamberType The type of chamber to check.
   * @returns True if the player can afford it, false otherwise.
   */
  const canAfford = (chamberType: Exclude<ChamberType, 'royal'>): boolean => {
    const cost = CHAMBER_COSTS.build[chamberType];
    for (const resource in cost) {
      if (resources[resource as ResourceType] < cost[resource as ResourceType]!) {
        return false;
      }
    }
    return true;
  };

  /**
   * Checks if the colony has already reached the maximum number of a specific chamber type.
   * @param chamberType The type of chamber to check.
   * @returns True if the max count has been reached, false otherwise.
   */
  const isAtMaxCount = (chamberType: Exclude<ChamberType, 'royal'>): boolean => {
    const info = CHAMBER_INFO[chamberType];
    const currentCount = chambers.filter(c => c.type === chamberType).length;
    return currentCount >= info.maxCount;
  };

  /**
   * Dispatches the action to build a new chamber.
   * @param chamberType The type of chamber to build.
   */
  const handleBuildChamber = (chamberType: Exclude<ChamberType, 'royal'>) => {
    dispatch({ type: 'BUILD_CHAMBER', payload: { chamberType } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Chambers</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {buildableChambers.map(type => {
            const cost = CHAMBER_COSTS.build[type];
            const isDisabled = !canAfford(type) || isAtMaxCount(type);

            return (
              <li key={type} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{CHAMBER_INFO[type].name}</p>
                  <p className="text-xs text-muted-foreground">
                    Cost: {Object.entries(cost).map(([res, val]) => `${val} ${res}`).join(", ")}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => handleBuildChamber(type)}
                >
                  Build
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
