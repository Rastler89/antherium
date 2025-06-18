"\"use client"

interface GameSaveData {
  queen: {
    id: string
    nextEggTime: number
  }
  eggs: Array<{
    id: string
    hatchTime: number
  }>
  larvae: Array<{
    id: string
    evolveTime: number
  }>
  ants: Array<{
    id: string
    type: "worker" | "soldier" | "cultivator"
    status: "idle" | "working" | "building" | "assigned"
    assignment?: string
    experience: number
  }>
  resources: {
    food: number
    dirt: number
    wood: number
    leaves: number
  }
  chambers: Array<{
    id: string
    type: string
    level: number
    tunnels: number
    connectedChambers: string[]
    assignedAnts: string[]
  }>
  expeditions: Array<{
    id: string
    type: "food" | "dirt" | "wood" | "leaves"
    antsCount: number
    startTime: number
    endTime: number
    location: string
  }>
  researchedTechs: string[]
  currentResearch: { techId: string; startTime: number; endTime: number } | null
  storageCapacity: {
    food: number
    dirt: number
    wood: number
    leaves: number
  }
  lastMushroomProduction: number
  lastSaveTime: number
}

const SAVE_KEY = "ant-strategy-game-save"
export const AUTO_SAVE_INTERVAL = 30000 // 30 segundos

export class GameStorage {
  static saveGame(gameState: any): void {
    try {
      const saveData: GameSaveData = {
        ...gameState,
        lastSaveTime: Date.now(),
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
      console.log("Juego guardado automáticamente")
    } catch (error) {
      console.error("Error al guardar el juego:", error)
    }
  }

  static loadGame(): GameSaveData | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY)
      if (!savedData) return null

      const gameData: GameSaveData = JSON.parse(savedData)

      // Ajustar tiempos basados en el tiempo transcurrido
      const timeDiff = Date.now() - gameData.lastSaveTime

      return {
        ...gameData,
        queen: {
          ...gameData.queen,
          nextEggTime: gameData.queen.nextEggTime + timeDiff,
        },
        eggs: gameData.eggs.map((egg) => ({
          ...egg,
          hatchTime: egg.hatchTime + timeDiff,
        })),
        larvae: gameData.larvae.map((larva) => ({
          ...larva,
          evolveTime: larva.evolveTime + timeDiff,
        })),
        expeditions: gameData.expeditions.map((exp) => ({
          ...exp,
          startTime: exp.startTime + timeDiff,
          endTime: exp.endTime + timeDiff,
        })),
        currentResearch: gameData.currentResearch
          ? {
              ...gameData.currentResearch,
              startTime: gameData.currentResearch.startTime + timeDiff,
              endTime: gameData.currentResearch.endTime + timeDiff,
            }
          : null,
        lastMushroomProduction: gameData.lastMushroomProduction + timeDiff,
      }
    } catch (error) {
      console.error("Error al cargar el juego:", error)
      return null
    }
  }

  static clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY)
      console.log("Datos del juego eliminados")
    } catch (error) {
      console.error("Error al eliminar los datos:", error)
    }
  }

  static hasSavedGame(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null
  }

  static exportSave(): string {
    const savedData = localStorage.getItem(SAVE_KEY)
    return savedData || ""
  }

  static importSave(saveData: string): boolean {
    try {
      JSON.parse(saveData) // Validar que es JSON válido
      localStorage.setItem(SAVE_KEY, saveData)
      return true
    } catch (error) {
      console.error("Error al importar datos:", error)
      return false
    }
  }
}
