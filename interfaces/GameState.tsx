import Ant from "./Ant"
import Chamber from "./Chamber"
import Expedition from "./Expedition"

export default interface GameState {
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
    ants: Array<Ant>
    resources: {
      food: number
      dirt: number
      wood: number
      leaves: number
    }
    chambers: Array<Chamber & { assignedAnts: string[] }>
    currentTime: number
    expeditions: Array<Expedition>
    researchedTechs: string[]
    currentResearch: { techId: string; startTime: number; endTime: number } | null
    storageCapacity: {
      food: number
      dirt: number
      wood: number
      leaves: number
    }
    lastMushroomProduction: number
    // Nuevos campos para tracking de notificaciones
    lastEggCount: number
    lastLarvaeCount: number
    lastAntsCount: number
    achievementsUnlocked: string[]
    // Nuevos campos para eventos aleatorios
    eventEffects: {
      resourceMultiplier: { food: number; dirt: number; wood: number; leaves: number }
      expeditionBonus: number
      constructionBonus: number
      researchBonus: number
      populationBonus: number
    }
  }
  