# 🐜 Antherium

Welcome to Antherium, an idle strategy game where you manage and grow a burgeoning ant colony.

## How to Play

The goal of Antherium is to expand your anthill from a humble colony into a thriving empire.

### Core Mechanics

*   **Population Growth:** Your queen will automatically lay eggs over time. These eggs hatch into larvae, which then evolve into worker ants. Your population capacity is determined by the number and level of your Nurseries.
*   **Resources:** There are four primary resources: **Food**, **Dirt**, **Wood**, and **Leaves**. You'll need these for almost everything.
*   **Expeditions:** To gather resources, you must send your idle ants on expeditions. Select a resource type and your ants will venture out, returning with rewards after a set amount of time.
*   **Construction:** Use your resources to build new chambers in your anthill. Each chamber provides a unique benefit, such as increasing population capacity (Nursery) or unlocking new game systems (Laboratory).
*   **Technology:** Once you build a Laboratory, you can begin researching new technologies. Research costs resources and time, but unlocks powerful new abilities, chambers, and bonuses.

### Keyboard Shortcuts

*   **S:** Manually save the game.
*   **F:** Send 1 ant on a Food expedition.
*   **W:** Send 1 ant on a Wood expedition.
*   **D:** Send 1 ant on a Dirt expedition.
*   **L:** Send 1 ant on a Leaves expedition.

## Features

*   **Dynamic Population Growth:** Watch your colony grow from eggs to larvae to fully-functional ants.
*   **Resource Management:** Send ants on expeditions to gather essential resources.
*   **Anthill Construction:** Build and upgrade a variety of chambers to expand your colony's capabilities.
*   **Technology Tree:** Research new technologies to unlock powerful upgrades and new game features.
*   **Random Events:** Encounter random events that can help or hinder your colony, adding unpredictability to the game.
*   **In-Game Notifications:** Get real-time feedback on game events through a non-intrusive notification system.
*   **Configurable Settings:** Adjust the game speed and auto-save interval to your liking via the settings panel.
*   **Keyboard Shortcuts:** Use keyboard shortcuts for common actions to improve your workflow.
*   **Persistent State:** The game automatically saves your progress in your browser's `localStorage` and loads it when you return.
*   **Manual Save/Reset:** Manually save your game at any time or reset your progress to start anew.

## Tech Stack

This project was rebuilt from the ground up using a modern web development stack:

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** Custom components inspired by [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** React Context API with the `useReducer` hook for clean, centralized state logic.

## Getting Started (Local Setup)

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd antherium-rebuilt
    ```

2.  **Install dependencies:**
    This project uses `npm`.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result. You can now start playing!
