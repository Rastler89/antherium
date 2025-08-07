import { useEffect } from 'react';

type ShortcutMap = {
  [key: string]: () => void;
};

/**
 * A custom hook that listens for keyboard presses and executes callback functions.
 * @param shortcuts An object mapping keyboard event codes (e.g., 'KeyS') to functions.
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if an input field is focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const callback = shortcuts[event.code];
      if (callback) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]); // Rerun effect if the shortcuts map changes
};
