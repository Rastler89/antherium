import { GameState } from "@/types";

/**
 * @file Manages saving and loading the game state to and from localStorage.
 */

const SAVE_KEY = "antherium-rebuilt-savegame";

/**
 * Saves the provided game state to localStorage.
 * @param gameState The current game state to save.
 */
export const saveGame = (gameState: GameState): void => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(SAVE_KEY, serializedState);
  } catch (error) {
    console.error("Error saving game state:", error);
  }
};

/**
 * Loads the game state from localStorage.
 * @returns The saved GameState, or null if no save is found or an error occurs.
 */
export const loadGame = (): GameState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const serializedState = localStorage.getItem(SAVE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
};

/**
 * Deletes the saved game from localStorage.
 */
export const clearSave = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Error clearing save data:", error);
  }
};
