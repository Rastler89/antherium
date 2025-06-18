export default interface SoundConfig {
    volume: number // 0-1
    enabled: boolean
    categories: {
      notifications: boolean
      population: boolean
      construction: boolean
      research: boolean
      expeditions: boolean
      achievements: boolean
      ui: boolean
    }
  }