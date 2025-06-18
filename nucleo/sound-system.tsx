"use client"

import { useEffect, useRef, useCallback } from "react"

export interface SoundConfig {
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

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  volume: 0.7,
  enabled: true,
  categories: {
    notifications: true,
    population: true,
    construction: true,
    research: true,
    expeditions: true,
    achievements: true,
    ui: true,
  },
}

// Definición de sonidos usando Web Audio API con frecuencias
const SOUND_DEFINITIONS = {
  // Notificaciones generales
  success: { frequency: 523.25, duration: 200, type: "sine" as OscillatorType },
  warning: { frequency: 349.23, duration: 300, type: "triangle" as OscillatorType },
  error: { frequency: 220, duration: 400, type: "sawtooth" as OscillatorType },
  info: { frequency: 440, duration: 150, type: "sine" as OscillatorType },

  // Población
  eggLaid: { frequency: 659.25, duration: 100, type: "sine" as OscillatorType },
  eggHatched: { frequency: 783.99, duration: 200, type: "sine" as OscillatorType },
  larvaEvolved: { frequency: 880, duration: 250, type: "sine" as OscillatorType },
  populationLimit: { frequency: 293.66, duration: 500, type: "triangle" as OscillatorType },

  // Construcción
  constructionStart: { frequency: 369.99, duration: 150, type: "square" as OscillatorType },
  constructionComplete: { frequency: 523.25, duration: 300, type: "sine" as OscillatorType },
  chamberUpgrade: { frequency: 698.46, duration: 250, type: "sine" as OscillatorType },
  tunnelAdded: { frequency: 415.3, duration: 200, type: "square" as OscillatorType },

  // Investigación
  researchStart: { frequency: 466.16, duration: 200, type: "sine" as OscillatorType },
  researchComplete: { frequency: 830.61, duration: 400, type: "sine" as OscillatorType },

  // Expediciones
  expeditionStart: { frequency: 392, duration: 150, type: "triangle" as OscillatorType },
  expeditionComplete: { frequency: 587.33, duration: 300, type: "sine" as OscillatorType },
  resourcesFound: { frequency: 659.25, duration: 200, type: "sine" as OscillatorType },

  // Logros
  achievement: { frequency: 1046.5, duration: 600, type: "sine" as OscillatorType },
  firstEgg: { frequency: 523.25, duration: 400, type: "sine" as OscillatorType },
  firstWorker: { frequency: 659.25, duration: 400, type: "sine" as OscillatorType },
  milestone: { frequency: 880, duration: 500, type: "sine" as OscillatorType },

  // UI
  click: { frequency: 800, duration: 50, type: "sine" as OscillatorType },
  hover: { frequency: 1000, duration: 30, type: "sine" as OscillatorType },
  tabSwitch: { frequency: 600, duration: 100, type: "sine" as OscillatorType },

  // Sistema
  save: { frequency: 440, duration: 100, type: "sine" as OscillatorType },
  load: { frequency: 523.25, duration: 150, type: "sine" as OscillatorType },

  // Producción
  mushroomProduction: { frequency: 349.23, duration: 150, type: "triangle" as OscillatorType },

  // Sonidos complejos (secuencias)
  levelUp: [
    { frequency: 523.25, duration: 150, type: "sine" as OscillatorType },
    { frequency: 659.25, duration: 150, type: "sine" as OscillatorType },
    { frequency: 783.99, duration: 200, type: "sine" as OscillatorType },
  ],
  bigAchievement: [
    { frequency: 523.25, duration: 200, type: "sine" as OscillatorType },
    { frequency: 659.25, duration: 200, type: "sine" as OscillatorType },
    { frequency: 783.99, duration: 200, type: "sine" as OscillatorType },
    { frequency: 1046.5, duration: 400, type: "sine" as OscillatorType },
  ],
}

export type SoundName = keyof typeof SOUND_DEFINITIONS

interface SoundSystemProps {
  config: SoundConfig
  onConfigChange?: (config: SoundConfig) => void
}

export const useSoundSystem = (config: SoundConfig) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Inicializar AudioContext
  useEffect(() => {
    if (config.enabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
        gainNodeRef.current.gain.value = config.volume
      } catch (error) {
        console.warn("Web Audio API no disponible:", error)
      }
    }
  }, [config.enabled])

  // Actualizar volumen
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = config.volume
    }
  }, [config.volume])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", delay = 0) => {
      if (!config.enabled || !audioContextRef.current || !gainNodeRef.current) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        const envelope = audioContextRef.current.createGain()

        oscillator.connect(envelope)
        envelope.connect(gainNodeRef.current)

        oscillator.frequency.value = frequency
        oscillator.type = type

        const now = audioContextRef.current.currentTime + delay

        // Envelope para evitar clicks
        envelope.gain.setValueAtTime(0, now)
        envelope.gain.linearRampToValueAtTime(0.3, now + 0.01)
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000)

        oscillator.start(now)
        oscillator.stop(now + duration / 1000)
      } catch (error) {
        console.warn("Error reproduciendo sonido:", error)
      }
    },
    [config.enabled],
  )

  const playSound = useCallback(
    (soundName: SoundName, category?: keyof SoundConfig["categories"]) => {
      if (!config.enabled) return

      // Verificar si la categoría está habilitada
      if (category && !config.categories[category]) return

      const soundDef = SOUND_DEFINITIONS[soundName]

      if (Array.isArray(soundDef)) {
        // Sonido complejo (secuencia)
        let delay = 0
        soundDef.forEach((tone) => {
          playTone(tone.frequency, tone.duration, tone.type, delay)
          delay += tone.duration / 1000
        })
      } else {
        // Sonido simple
        playTone(soundDef.frequency, soundDef.duration, soundDef.type)
      }
    },
    [config, playTone],
  )

  const playNotificationSound = useCallback(
    (type: "success" | "warning" | "error" | "info" | "achievement") => {
      if (type === "achievement") {
        playSound("bigAchievement", "achievements")
      } else {
        playSound(type, "notifications")
      }
    },
    [playSound],
  )

  const playPopulationSound = useCallback(
    (event: "eggLaid" | "eggHatched" | "larvaEvolved" | "populationLimit") => {
      playSound(event, "population")
    },
    [playSound],
  )

  const playConstructionSound = useCallback(
    (event: "constructionStart" | "constructionComplete" | "chamberUpgrade" | "tunnelAdded") => {
      playSound(event, "construction")
    },
    [playSound],
  )

  const playResearchSound = useCallback(
    (event: "researchStart" | "researchComplete") => {
      playSound(event, "research")
    },
    [playSound],
  )

  const playExpeditionSound = useCallback(
    (event: "expeditionStart" | "expeditionComplete" | "resourcesFound") => {
      playSound(event, "expeditions")
    },
    [playSound],
  )

  const playAchievementSound = useCallback(
    (event: "achievement" | "firstEgg" | "firstWorker" | "milestone") => {
      if (event === "achievement" || event === "milestone") {
        playSound("bigAchievement", "achievements")
      } else {
        playSound(event, "achievements")
      }
    },
    [playSound],
  )

  const playUISound = useCallback(
    (event: "click" | "hover" | "tabSwitch") => {
      playSound(event, "ui")
    },
    [playSound],
  )

  const playSystemSound = useCallback(
    (event: "save" | "load") => {
      playSound(event, "notifications")
    },
    [playSound],
  )

  const playProductionSound = useCallback(
    (event: "mushroomProduction") => {
      playSound(event, "population")
    },
    [playSound],
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    playSound,
    playNotificationSound,
    playPopulationSound,
    playConstructionSound,
    playResearchSound,
    playExpeditionSound,
    playAchievementSound,
    playUISound,
    playSystemSound,
    playProductionSound,
  }
}

// Componente para configuración de sonidos
export default function SoundSystemConfig({ config, onConfigChange }: SoundSystemProps) {
  const updateConfig = (updates: Partial<SoundConfig>) => {
    if (onConfigChange) {
      onConfigChange({ ...config, ...updates })
    }
  }

  const updateCategory = (category: keyof SoundConfig["categories"], enabled: boolean) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        categories: {
          ...config.categories,
          [category]: enabled,
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Sonidos habilitados</label>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => updateConfig({ enabled: e.target.checked })}
          className="rounded"
        />
      </div>

      {config.enabled && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Volumen general</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.volume}
              onChange={(e) => updateConfig({ volume: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">{Math.round(config.volume * 100)}%</div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Categorías de sonido</h4>

            {Object.entries(config.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <label className="text-sm capitalize">
                  {category === "ui"
                    ? "Interfaz"
                    : category === "notifications"
                      ? "Notificaciones"
                      : category === "population"
                        ? "Población"
                        : category === "construction"
                          ? "Construcción"
                          : category === "research"
                            ? "Investigación"
                            : category === "expeditions"
                              ? "Expediciones"
                              : category === "achievements"
                                ? "Logros"
                                : category}
                </label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateCategory(category as keyof SoundConfig["categories"], e.target.checked)}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Hook para cargar/guardar configuración de sonidos
export const useSoundConfig = () => {
  const loadSoundConfig = (): SoundConfig => {
    try {
      const saved = localStorage.getItem("ant-game-sound-config")
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...DEFAULT_SOUND_CONFIG, ...parsed }
      }
    } catch (error) {
      console.error("Error loading sound config:", error)
    }
    return DEFAULT_SOUND_CONFIG
  }

  const saveSoundConfig = (config: SoundConfig): void => {
    try {
      localStorage.setItem("ant-game-sound-config", JSON.stringify(config))
    } catch (error) {
      console.error("Error saving sound config:", error)
    }
  }

  return { loadSoundConfig, saveSoundConfig }
}
