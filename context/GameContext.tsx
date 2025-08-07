"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { GameState, Ant, ResourceType, ChamberType, Notification, GameSettings } from '@/types';
import { CHAMBER_COSTS, CHAMBER_INFO, TECHNOLOGIES, TechId, RANDOM_EVENTS, RandomEvent } from '@/lib/constants';
import { loadGame, saveGame, clearSave } from '@/lib/storage';

/**
 * @file Implements the state management for the game using React's Context and Reducer hooks.
 */

// --- DYNAMIC CONSTANTS ---
const getTimers = (settings: GameSettings) => ({
    EGG_LAY_DURATION_MS: (10 * 1000) / settings.gameSpeed,
    EGG_HATCH_DURATION_MS: (20 * 1000) / settings.gameSpeed,
    LARVA_EVOLVE_DURATION_MS: (30 * 1000) / settings.gameSpeed,
    EXPEDITION_DURATION_MS: (60 * 1000) / settings.gameSpeed,
});

// --- ACTION TYPES ---
/**
 * Defines the shape of the actions that can be dispatched to the game reducer.
 */
type Action =
  | { type: 'TICK'; payload: { currentTime: number } }
  | { type: 'START_EXPEDITION'; payload: { resourceType: ResourceType; antsCount: number } }
  | { type: 'BUILD_CHAMBER'; payload: { chamberType: Exclude<ChamberType, 'royal'> } }
  | { type: 'START_RESEARCH'; payload: { techId: TechId } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'DISMISS_NOTIFICATION'; payload: { id: number } }
  | { type: 'CHANGE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'TRIGGER_RANDOM_EVENT' };

// --- HELPER FUNCTIONS ---
const getAvailableAnts = (state: GameState): Ant[] => {
    return state.ants.filter((ant) => ant.status === 'idle');
}

const getMaxPopulation = (state: GameState): number => {
    const nurseries = state.chambers.filter((c) => c.type === "nursery");
    return nurseries.reduce((total, nursery) => total + nursery.level * 5, 0);
};

const getCurrentPopulation = (state: GameState): number => {
    return state.eggs.length + state.larvae.length;
}

// --- INITIAL STATE ---
/**
 * The starting state for a new game.
 */
export const initialGameState: GameState = {
  currentTime: Date.now(),
  queen: {
    id: "queen-1",
    nextEggTime: Date.now() + getTimers({ gameSpeed: 1, autoSaveInterval: 30 }).EGG_LAY_DURATION_MS,
  },
  eggs: [],
  larvae: [],
  ants: [],
  resources: {
    food: 200,
    dirt: 300,
    wood: 150,
    leaves: 0,
  },
  chambers: [
    {
      id: "chamber-royal",
      type: "royal",
      level: 1,
      tunnels: 3,
      connectedChambers: ["chamber-nursery"],
      assignedAnts: [],
    },
    {
      id: "chamber-nursery",
      type: "nursery",
      level: 1,
      tunnels: 1,
      connectedChambers: [],
      assignedAnts: [],
    },
  ],
  expeditions: [],
  researchedTechs: [],
  currentResearch: null,
  notifications: [],
  settings: {
    gameSpeed: 1,
    autoSaveInterval: 30,
  },
};


// --- REDUCER ---
/**
 * The game reducer function. It takes the current state and an action,
 * and returns the new state. All game logic for updating state will go here.
 * @param state The current game state.
 * @param action The action to perform.
 * @returns The new game state.
 */
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'TRIGGER_RANDOM_EVENT': {
      const possibleEvents = RANDOM_EVENTS.filter(event => event.trigger(state));
      if (possibleEvents.length === 0) {
        return state;
      }

      const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      let newState = { ...state };

      // Apply resource effects
      if (event.effects.resources) {
        for (const r in event.effects.resources) {
          const resource = r as ResourceType;
          newState.resources[resource] = Math.max(0, newState.resources[resource] + event.effects.resources[resource]!);
        }
      }

      // Handle special event effects
      if (event.id === 'strong_larvae') {
        const larvaeToEvolve = newState.larvae.slice(0, 2); // Evolve up to 2 larvae
        const newAnts: Ant[] = larvaeToEvolve.map(larva => ({
          id: `ant-${larva.id}`, type: "worker", status: "idle", experience: 0,
        }));
        newState.larvae = newState.larvae.filter(l => !larvaeToEvolve.find(lte => lte.id === l.id));
        newState.ants = [...newState.ants, ...newAnts];
      }

      // Add notification for the event
      newState.notifications = [
        { id: Date.now(), type: event.type, title: event.title, message: event.description } as Notification,
        ...newState.notifications
      ].slice(0, 5);

      return newState;
    }

    /** Handles loading a saved game state. */
    case 'LOAD_GAME':
      return { ...action.payload, notifications: [] }; // Clear notifications on load

    /** Resets the game to its initial state and clears the save file. */
    case 'RESET_GAME':
      clearSave();
      return initialGameState;

    /** Updates the game settings. */
    case 'CHANGE_SETTINGS':
        return {
            ...state,
            settings: { ...state.settings, ...action.payload },
        };

    case 'ADD_NOTIFICATION': {
      const newNotification = { ...action.payload, id: Date.now() };
      const updatedNotifications = [newNotification, ...state.notifications];
      // Keep a maximum of 5 notifications
      if (updatedNotifications.length > 5) {
        updatedNotifications.pop();
      }
      return { ...state, notifications: updatedNotifications };
    }

    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id),
      };
    }

    /** Starts a new research project if all conditions are met. */
    case 'START_RESEARCH': {
      const { techId } = action.payload;
      const tech = TECHNOLOGIES[techId];

      if (state.currentResearch || state.researchedTechs.includes(techId) || !tech) {
        return state;
      }

      for (const dep of tech.dependencies) {
        if (!state.researchedTechs.includes(dep)) {
          return state;
        }
      }

      for (const resource in tech.cost) {
        if (state.resources[resource as ResourceType] < tech.cost[resource as keyof typeof tech.cost]!) {
          return state;
        }
      }

      const newResources = { ...state.resources };
      for (const resource in tech.cost) {
        newResources[resource as ResourceType] -= tech.cost[resource as keyof typeof tech.cost]!;
      }

      const notifications = [
        { id: Date.now(), type: 'info', title: 'Research Started', message: `Began researching ${tech.name}.` } as Notification,
        ...state.notifications
      ].slice(0, 5);

      return {
        ...state,
        resources: newResources,
        notifications,
        currentResearch: {
          techId,
          startTime: state.currentTime,
          endTime: state.currentTime + tech.researchTime,
        },
      };
    }

    /** Handles the construction of a new chamber. */
    case 'BUILD_CHAMBER': {
      const { chamberType } = action.payload;
      const cost = CHAMBER_COSTS.build[chamberType];
      const info = CHAMBER_INFO[chamberType];

      // Check resource cost
      for (const resource in cost) {
        if (state.resources[resource as ResourceType] < cost[resource as ResourceType]!) {
          console.log(`Not enough ${resource}`);
          return state; // Not enough resources
        }
      }

      // Check max count
      const currentCount = state.chambers.filter(c => c.type === chamberType).length;
      if (currentCount >= info.maxCount) {
        console.log(`Max count for ${chamberType} reached`);
        return state; // Max count reached
      }

      // TODO: Add more checks like royal level and connectivity

      const newResources = { ...state.resources };
      for (const resource in cost) {
        newResources[resource as ResourceType] -= cost[resource as ResourceType]!;
      }

      const newChamber = {
        id: `chamber-${chamberType}-${state.currentTime}`,
        type: chamberType,
        level: 1,
        tunnels: info.baseTunnels,
        connectedChambers: [],
        assignedAnts: [],
      };

      const notifications = [
        { id: Date.now(), type: 'success', title: 'Construction Complete', message: `A new ${info.name} has been built.` } as Notification,
        ...state.notifications
      ].slice(0, 5);

      return {
        ...state,
        resources: newResources,
        chambers: [...state.chambers, newChamber],
        notifications,
      };
    }

    /** Initiates a new expedition to gather resources. */
    case 'START_EXPEDITION': {
      const { resourceType, antsCount } = action.payload;
      const availableAnts = getAvailableAnts(state);

      if (antsCount <= 0 || antsCount > availableAnts.length) {
        return state; // Not enough ants, do nothing
      }

      const antsForExpedition = availableAnts.slice(0, antsCount);
      const antIdsForExpedition = antsForExpedition.map(ant => ant.id);

      const newExpedition = {
        id: `expedition-${state.currentTime}`,
        type: resourceType,
        antsCount,
        startTime: state.currentTime,
        endTime: state.currentTime + getTimers(state.settings).EXPEDITION_DURATION_MS,
        location: `Nearby ${resourceType} source`,
      };

      const remainingAnts = state.ants.filter(ant => !antIdsForExpedition.includes(ant.id));
      const busyAnts = antsForExpedition.map(ant => ({ ...ant, status: 'working' as const }));

      return {
        ...state,
        expeditions: [...state.expeditions, newExpedition],
        ants: [...remainingAnts, ...busyAnts],
      };
    }

    /** The main game loop event, triggered every second. */
    case 'TICK': {
      const { currentTime } = action.payload;
      let newState = { ...state, currentTime };
      const timers = getTimers(newState.settings);

      // Section 1: Process completed time-based events
      // ===============================================

      // Complete finished research projects
      if (newState.currentResearch && currentTime >= newState.currentResearch.endTime) {
        const tech = TECHNOLOGIES[newState.currentResearch.techId];
        newState.notifications = [
            { id: Date.now(), type: 'success', title: 'Research Complete', message: `${tech.name} has been researched.` } as Notification,
            ...newState.notifications
        ].slice(0, 5);
        newState.researchedTechs = [...newState.researchedTechs, newState.currentResearch.techId];
        newState.currentResearch = null;
      }

      // Complete finished expeditions and collect rewards
      const completedExpeditions = newState.expeditions.filter(exp => currentTime >= exp.endTime);
      if (completedExpeditions.length > 0) {
        const returnedAnts: string[] = [];
        let expeditionRewards: Notification[] = [];
        completedExpeditions.forEach(exp => {
            const reward = exp.antsCount * 10;
            newState.resources[exp.type] += reward;
            expeditionRewards.push({
                id: Date.now() + Math.random(), // Add random number to avoid collision
                type: 'info',
                title: 'Expedition Returned',
                message: `${exp.antsCount} ants returned with ${reward} ${exp.type}.`
            } as Notification);
            const antsOnThisExpedition = newState.ants.filter(a => a.status === 'working').slice(0, exp.antsCount);
            antsOnThisExpedition.forEach(a => returnedAnts.push(a.id));
        });

        newState.notifications = [...expeditionRewards, ...newState.notifications].slice(0, 5);

        newState.ants = newState.ants.map(ant => {
            if(returnedAnts.includes(ant.id)) {
                return { ...ant, status: 'idle' as const };
            }
            return ant;
        });

        newState.expeditions = newState.expeditions.filter(exp => currentTime < exp.endTime);
      }

      // Section 2: Process population lifecycle
      // =======================================

      // Queen lays eggs if there is capacity
      const canLayEgg = getCurrentPopulation(newState) < getMaxPopulation(newState);
      if (canLayEgg && currentTime >= newState.queen.nextEggTime) {
        const newEgg = {
          id: `egg-${currentTime}`,
          hatchTime: currentTime + timers.EGG_HATCH_DURATION_MS,
        };
        newState.eggs = [...newState.eggs, newEgg];
        newState.queen.nextEggTime = currentTime + timers.EGG_LAY_DURATION_MS;
      }

      // Eggs hatch into larvae
      const hatchedEggs = newState.eggs.filter((egg) => currentTime >= egg.hatchTime);
      if (hatchedEggs.length > 0) {
        const newLarvae = hatchedEggs.map((egg) => ({
          id: `larva-${egg.id}`,
          evolveTime: currentTime + timers.LARVA_EVOLVE_DURATION_MS,
        }));
        newState.eggs = newState.eggs.filter((egg) => currentTime < egg.hatchTime);
        newState.larvae = [...newState.larvae, ...newLarvae];
      }

      // Larvae evolve into worker ants
      const evolvedLarvae = newState.larvae.filter((larva) => currentTime >= larva.evolveTime);
      if (evolvedLarvae.length > 0) {
        const newAnts: Ant[] = evolvedLarvae.map((larva) => ({
          id: `ant-${larva.id}`,
          type: "worker",
          status: "idle",
          experience: 0,
        }));
        newState.larvae = newState.larvae.filter((larva) => currentTime < larva.evolveTime);
        newState.ants = [...newState.ants, ...newAnts];
      }

      return newState;
    }
    default:
      return state;
  }
};

// --- CONTEXT ---
/**
 * The context that will be provided to all components in the game.
 * It includes the game state and the dispatch function to update it.
 */
interface GameContextProps {
  gameState: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);


// --- PROVIDER ---
/**
 * The GameProvider component. Any component wrapped by this provider
 * will have access to the game state and dispatch function. It also
 * runs the main game loop.
 */
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Load game on initial mount
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    }
  }, []); // Empty dependency array ensures this runs only once on the client

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      dispatch({ type: 'TICK', payload: { currentTime: Date.now() } });
    }, 1000); // Run every second

    return () => clearInterval(gameLoop); // Cleanup on unmount
  }, []);

  // Auto-save loop
  useEffect(() => {
    // Don't save the initial state before it's been interacted with
    if (gameState === initialGameState) return;

    const autoSaveLoop = setInterval(() => {
      saveGame(gameState);
      console.log("Game auto-saved!");
    }, gameState.settings.autoSaveInterval * 1000);

    return () => clearInterval(autoSaveLoop);
  }, [gameState]); // Rerun when gameState changes

  // Random event loop
  useEffect(() => {
    const eventTimer = setInterval(() => {
      // 25% chance to trigger an event every 20 seconds
      if (Math.random() < 0.25) {
        dispatch({ type: 'TRIGGER_RANDOM_EVENT' });
      }
    }, 20 * 1000);

    return () => clearInterval(eventTimer);
  }, []);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};


// --- CUSTOM HOOK ---
/**
 * A custom hook to easily access the game context (state and dispatch).
 * This simplifies consumer components and adds a check to ensure the
 * context is available.
 * @returns The game state and dispatch function.
 */
export const useGame = (): GameContextProps => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
