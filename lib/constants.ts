import { ChamberType, GameState, NotificationType, ResourceType } from "@/types";

/**
 * @file Centralized constants for game design and balance.
 */

// --- RANDOM EVENTS DATA ---

export type RandomEvent = {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  trigger: (state: GameState) => boolean;
  effects: {
    resources?: Partial<Record<ResourceType, number>>;
    // Future effects can be added here, e.g., temporary bonuses
  };
};

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'good_harvest',
    title: 'Bountiful Harvest',
    description: 'Your ants discovered a surprisingly rich patch of food!',
    type: 'success',
    trigger: (state) => state.ants.length > 5,
    effects: {
      resources: { food: 100 }
    }
  },
  {
    id: 'sudden_cave_in',
    title: 'Minor Cave-In',
    description: 'A small tunnel collapsed, and some building materials were lost.',
    type: 'warning',
    trigger: (state) => state.chambers.length > 3,
    effects: {
      resources: { dirt: -50, wood: -25 }
    }
  },
  {
    id: 'strong_larvae',
    title: 'Strong Larvae',
    description: 'A batch of larvae has evolved into ants with surprising speed!',
    type: 'success',
    trigger: (state) => state.larvae.length >= 3,
    effects: {} // The effect will be handled directly in the reducer
  },
];


// --- TECHNOLOGY DATA ---

// Define the keys first to break the circular type dependency
const techIds = ["basic_storage", "advanced_construction", "mushroom_cultivation"] as const;
export type TechId = typeof techIds[number];

type Technology = {
  name: string;
  description: string;
  cost: Partial<Record<ResourceType, number>>;
  researchTime: number;
  dependencies: TechId[];
};

export const TECHNOLOGIES: Record<TechId, Technology> = {
  basic_storage: {
    name: "Basic Storage",
    description: "Improves resource storage techniques.",
    cost: { dirt: 100, wood: 50 },
    researchTime: 30 * 1000, // 30 seconds
    dependencies: [],
  },
  advanced_construction: {
    name: "Advanced Construction",
    description: "Unlocks the ability to build more advanced chambers.",
    cost: { dirt: 250, wood: 150 },
    researchTime: 60 * 1000, // 1 minute
    dependencies: ["basic_storage"],
  },
  mushroom_cultivation: {
    name: "Mushroom Cultivation",
    description: "Unlocks the Mushroom Farm, allowing for passive food generation.",
    cost: { food: 200, leaves: 100 },
    researchTime: 90 * 1000, // 1.5 minutes
    dependencies: ["advanced_construction"],
  },
};

// --- CHAMBER DATA ---

/**
 * Defines the static properties and rules for each type of chamber.
 */
export const CHAMBER_INFO: Record<ChamberType, {
  name: string;
  description: string;
  maxCount: number;
  baseTunnels: number;
  requiresRoyalLevel: number;
  allowedConnections: ChamberType[];
}> = {
  royal: {
    name: "Royal Chamber",
    description: "The heart of the colony. The Queen resides here. Upgrading it unlocks new possibilities.",
    maxCount: 1,
    baseTunnels: 3,
    requiresRoyalLevel: 0,
    allowedConnections: ["nursery", "granary", "warehouse", "laboratory"],
  },
  nursery: {
    name: "Nursery",
    description: "Increases the maximum population capacity of the colony.",
    maxCount: 1, // Can be increased with technology
    baseTunnels: 1,
    requiresRoyalLevel: 1,
    allowedConnections: ["nursery", "granary", "warehouse"],
  },
  granary: {
    name: "Granary",
    description: "Increases the maximum storage capacity for food.",
    maxCount: 3,
    baseTunnels: 1,
    requiresRoyalLevel: 1,
    allowedConnections: ["nursery", "warehouse"],
  },
  warehouse: {
    name: "Warehouse",
    description: "Increases storage for building materials like dirt and wood.",
    maxCount: 3,
    baseTunnels: 1,
    requiresRoyalLevel: 1,
    allowedConnections: ["nursery", "granary", "laboratory"],
  },
  laboratory: {
    name: "Laboratory",
    description: "Enables research of new technologies.",
    maxCount: 1,
    baseTunnels: 1,
    requiresRoyalLevel: 2,
    allowedConnections: ["royal", "warehouse"],
  },
  mushroom_farm: {
    name: "Mushroom Farm",
    description: "Passively generates food by consuming leaves.",
    maxCount: 2,
    baseTunnels: 1,
    requiresRoyalLevel: 2,
    allowedConnections: ["nursery", "granary"],
  },
};

/**
 * Defines the resource costs for building and upgrading chambers.
 */
export const CHAMBER_COSTS = {
  build: {
    nursery: { dirt: 50, wood: 25 },
    granary: { dirt: 100, wood: 50 },
    warehouse: { dirt: 150, wood: 75 },
    laboratory: { dirt: 200, wood: 150 },
    mushroom_farm: { dirt: 100, food: 100 },
  } as Record<Exclude<ChamberType, 'royal'>, Partial<Record<ResourceType, number>>>,

  upgrade: (baseCost: Partial<Record<ResourceType, number>>, level: number) => {
    const newCost: Partial<Record<ResourceType, number>> = {};
    for (const key in baseCost) {
      const resource = key as ResourceType;
      newCost[resource] = Math.floor(baseCost[resource]! * Math.pow(1.5, level - 1));
    }
    return newCost;
  },
};
