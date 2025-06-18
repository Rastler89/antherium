import SoundConfig from "./SoundConfig"

export default interface GameSettings {
    autoSaveEnabled: boolean
    autoSaveInterval: number // en segundos
    gameSpeed: number // multiplicador de velocidad (0.5x, 1x, 1.5x, 2x)
    soundEnabled: boolean
    notificationsEnabled: boolean
    showDetailedStats: boolean
    compactUI: boolean
    autoEvolutionDelay: number // tiempo extra antes de evolución automática en minutos
    soundConfig: SoundConfig // Nueva configuración de sonidos
  }