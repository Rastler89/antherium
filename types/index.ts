/**
 * @file Centralized type definitions for the Antherium game.
 */

/**
 * Represents the status of an ant.
 * - `idle`: The ant is available for tasks.
 * - `working`: The ant is on an expedition.
 * - `building`: The ant is constructing a chamber.
 * - `assigned`: The ant is assigned to a specific chamber.
 */
export type AntStatus = "idle" | "working" | "building" | "assigned";

/**
 * Represents the specialized type or caste of an ant.
 * - `worker`: General purpose ant.
 * - `soldier`: Specialized in combat (feature to be expanded).
 * - `cultivator`: Specialized in mushroom farming.
 */
export type AntType = "worker" | "soldier" | "cultivator";

/**
 * Represents a single ant in the colony.
 */
export interface Ant {
  /** A unique identifier for the ant. */
  id: string;
  /** The specialized caste of the ant. */
  type: AntType;
  /** The current status of the ant. */
  status: AntStatus;
  /** The ant's experience level, which could affect its efficiency. */
  experience: number;
  /** If assigned, the ID of the chamber the ant is working in. */
  assignment?: string;
}

/**
 * Represents the type of a chamber in the anthill.
 */
export type ChamberType = "royal" | "nursery" | "granary" | "warehouse" | "laboratory" | "mushroom_farm";

/**
 * Represents a chamber within the anthill.
 */
export interface Chamber {
  /** A unique identifier for the chamber. */
  id:string;
  /** The type of the chamber, determining its function. */
  type: ChamberType;
  /** The current level of the chamber, affecting its efficiency or capacity. */
  level: number;
  /** The number of tunnels this chamber has, determining how many other chambers it can connect to. */
  tunnels: number;
  /** An array of chamber IDs that this chamber is connected to. */
  connectedChambers: string[];
}

/**
 * Represents a resource type that can be gathered.
 */
export type ResourceType = "food" | "dirt" | "wood" | "leaves";

/**
 * Represents an expedition sent out from the anthill.
 */
export interface Expedition {
  /** A unique identifier for the expedition. */
  id: string;
  /** The type of resource being gathered. */
  type: ResourceType;
  /** The number of ants sent on the expedition. */
  antsCount: number;
  /** The timestamp when the expedition started. */
  startTime: number;
  /** The timestamp when the expedition is expected to finish. */
  endTime: number;
  /** A descriptive name for the location of the expedition. */
  location: string;
}

import { TechId } from "@/lib/constants";

/**
 * Defines the visual style and category of a notification.
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Defines the structure for game settings that the player can configure.
 */
export interface GameSettings {
  /** A multiplier for the speed of all time-based game events. */
  gameSpeed: number;
  /** The interval in seconds for auto-saving the game. */
  autoSaveInterval: number;
}

/**
 * Represents a single notification message to be displayed to the user.
 */
export interface Notification {
  /** A unique identifier for the notification. */
  id: number;
  /** The main message content of the notification. */
  message: string;
  /** An optional title for the notification. */
  title?: string;
  /** The type of the notification, affecting its color and icon. */
  type: NotificationType;
}

/**
 * Represents the entire state of the game at any given moment.
 */
export interface GameState {
  /** The timestamp of the last game state update. Used for calculating time-based events. */
  currentTime: number;

  /** State related to the queen ant. */
  queen: {
    id: string;
    /** The timestamp when the queen will be ready to lay the next egg. */
    nextEggTime: number;
  };

  /** An array of all eggs in the nursery. */
  eggs: Array<{
    id: string;
    /** The timestamp when the egg is due to hatch. */
    hatchTime: number;
  }>;

  /** An array of all larvae waiting to evolve. */
  larvae: Array<{
    id: string;
    /** The timestamp when the larva is ready to evolve into an ant. */
    evolveTime: number;
  }>;

  /** An array of all ants in the colony. */
  ants: Array<Ant>;

  /** A record of the current amount of each resource. */
  resources: Record<ResourceType, number>;

  /** An array of all chambers built in the anthill. */
  chambers: Array<Chamber & { assignedAnts: string[] }>;

  /** An array of all active expeditions. */
  expeditions: Array<Expedition>;

  /** A list of technology IDs that have been researched. */
  researchedTechs: TechId[];

  /** The currently active research project, if any. */
  currentResearch: {
    techId: TechId;
    startTime: number;
    endTime: number;
  } | null;

  /** A list of active notifications to be displayed to the user. */
  notifications: Notification[];

  /** The player-configurable game settings. */
  settings: GameSettings;
}
