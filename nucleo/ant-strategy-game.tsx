"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Crown, Bug, Egg, Baby, Home, TreePine, Beaker, Users } from "lucide-react"
import ExpeditionCard from "./expedition-card"
import TechnologyTree, { TECHNOLOGIES } from "./technology-tree"
import ChamberUpgrade, { CHAMBER_COSTS } from "./chamber-upgrade"
import ConstructionRequirements from "./construction-requirements"
import GameTutorialModal from "./game-tutorial-modal"
import AntManagement from "./ant-management"
import SaveLoadModal from "./save-load-modal"
import { GameStorage } from "./game-storage"
import { CHAMBER_INFO } from "./chamber-upgrade"
import GameSettingsModal, {
  loadGameSettings,
  saveGameSettings,
  DEFAULT_SETTINGS,
} from "./game-settings"
import KeyboardShortcutsModal, {
  useKeyboardShortcuts,
  loadKeyboardShortcuts,
  saveKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
} from "./keyboard-shortcuts"
import NotificationSystem, { useNotifications, createGameNotifications } from "./notification-system"
import { useSoundSystem, useSoundConfig, DEFAULT_SOUND_CONFIG } from "./sound-system"
import RandomEventModal, { useRandomEventSystem, ActiveEventsDisplay } from "./random-events-system"
import GameSettings from "@/interfaces/GameSettings"
import GameState from "@/interfaces/GameState"
import KeyboardShortcuts from "@/interfaces/KeyboardShortcuts"
import SoundConfig from "@/interfaces/SoundConfig"
import { RandomEvent } from "@/interfaces/RandomEvent"

const getTimers = (settings: GameSettings, eventEffects?: any) => {
  const speedMultiplier = settings.gameSpeed
  const constructionBonus = eventEffects?.constructionBonus || 0
  const researchBonus = eventEffects?.researchBonus || 0
  const populationBonus = eventEffects?.populationBonus || 0

  return {
    EGG_LAYING: (3 * 60 * 1000) / (speedMultiplier * (1 + populationBonus)),
    EGG_HATCHING: (5 * 60 * 1000) / (speedMultiplier * (1 + populationBonus)),
    LARVA_EVOLUTION: (7 * 60 * 1000) / (speedMultiplier * (1 + populationBonus)),
    MUSHROOM_PRODUCTION: (60 * 1000) / speedMultiplier,
    AUTO_EVOLUTION: (settings.autoEvolutionDelay * 60 * 1000) / speedMultiplier,
    CONSTRUCTION_TIME: (30 * 1000) / (speedMultiplier * (1 + constructionBonus)),
    RESEARCH_MULTIPLIER: 1 + researchBonus,
  }
}

const EXPLORATION_TIME = 2 * 60 * 1000 // 2 minutos base
const LOCATIONS = {
  food: ["Bosque Frondoso", "Pradera Verde", "Jardín Florido"],
  dirt: ["Colina Rocosa", "Cantera Profunda", "Monte Pedregoso"],
  wood: ["Bosque Antiguo", "Arboleda Densa", "Selva Misteriosa"],
  leaves: ["Bosque de Hojas", "Arboleda Caída", "Sendero Foliar"],
}

const getInitialGameState = (): GameState => ({
  queen: {
    id: "queen-1",
    nextEggTime: Date.now() + getTimers(DEFAULT_SETTINGS).EGG_LAYING,
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
    { id: "chamber-nursery", type: "nursery", level: 1, tunnels: 1, connectedChambers: [], assignedAnts: [] },
  ],
  currentTime: Date.now(),
  expeditions: [],
  researchedTechs: [],
  currentResearch: null,
  storageCapacity: {
    food: 1000,
    dirt: 500,
    wood: 500,
    leaves: 500,
  },
  lastMushroomProduction: Date.now(),
  lastEggCount: 0,
  lastLarvaeCount: 0,
  lastAntsCount: 0,
  achievementsUnlocked: [],
  eventEffects: {
    resourceMultiplier: { food: 1, dirt: 1, wood: 1, leaves: 1 },
    expeditionBonus: 0,
    constructionBonus: 0,
    researchBonus: 0,
    populationBonus: 0,
  },
})

export default function AntStrategyGame() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState())
  const [selectedChamberType, setSelectedChamberType] = useState<keyof typeof CHAMBER_COSTS.build>("nursery")
  const [gameLoaded, setGameLoaded] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcuts>(DEFAULT_SHORTCUTS)
  const [currentTab, setCurrentTab] = useState("anthill")
  const [soundConfig, setSoundConfig] = useState<SoundConfig>(DEFAULT_SOUND_CONFIG)

  // Sistema de eventos aleatorios
  const { activeEvents, triggerRandomEvent, addActiveEvent, removeActiveEvent, getActiveEventEffects, eventHistory } =
    useRandomEventSystem()

  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // Sistema de notificaciones
  const { notifications, addNotification, dismissNotification, dismissAll, notifySuccess, notifyWarning, notifyInfo } =
    useNotifications()

  // Inicializar el sistema de sonidos
  const soundSystem = useSoundSystem(soundConfig)
  const { loadSoundConfig, saveSoundConfig } = useSoundConfig()

  // Crear funciones de notificación específicas del juego
  const gameNotifications = createGameNotifications(addNotification, soundSystem)

  // Referencias para modales
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Cargar juego al inicializar
  useEffect(() => {
    const savedGame = GameStorage.loadGame()
    if (savedGame) {
      setGameState({
        ...savedGame,
        currentTime: Date.now(),
        // Asegurar que los nuevos campos existan
        lastEggCount: savedGame.lastEggCount || 0,
        lastLarvaeCount: savedGame.lastLarvaeCount || 0,
        lastAntsCount: savedGame.lastAntsCount || 0,
        achievementsUnlocked: savedGame.achievementsUnlocked || [],
        eventEffects: savedGame.eventEffects || {
          resourceMultiplier: { food: 1, dirt: 1, wood: 1, leaves: 1 },
          expeditionBonus: 0,
          constructionBonus: 0,
          researchBonus: 0,
          populationBonus: 0,
        },
      })
      gameNotifications.gameLoaded()
      console.log("Juego cargado desde localStorage")
    }
    setGameLoaded(true)
  }, [])

  // Cargar configuración al inicializar
  useEffect(() => {
    const settings = loadGameSettings()
    setGameSettings(settings)

    const shortcuts = loadKeyboardShortcuts()
    setKeyboardShortcuts(shortcuts)

    // Cargar configuración de sonidos
    const sounds = loadSoundConfig()
    setSoundConfig(sounds)
  }, [])

  // Actualizar efectos de eventos activos
  useEffect(() => {
    const effects = getActiveEventEffects(gameState.currentTime)
    setGameState((prev) => ({
      ...prev,
      eventEffects: effects,
    }))
  }, [activeEvents, gameState.currentTime, getActiveEventEffects])

  // Verificar eventos aleatorios
  useEffect(() => {
    const checkForRandomEvents = () => {
      if (!gameLoaded || !gameSettings.notificationsEnabled) return

      const event = triggerRandomEvent(gameState, gameState.currentTime)
      if (event) {
        setCurrentEvent(event)
        setShowEventModal(true)

        // Sonido especial para eventos
        soundSystem.playNotificationSound("info")

        // Notificación del evento
        addNotification({
          type: event.type === "positive" ? "success" : event.type === "negative" ? "warning" : "info",
          category: "system",
          title: `¡Evento: ${event.title}!`,
          message: event.description,
          icon: event.icon,
          duration: 8000,
        })
      }
    }

    const interval = setInterval(checkForRandomEvents, 30000) // Verificar cada 30 segundos
    return () => clearInterval(interval)
  }, [gameState, gameLoaded, gameSettings.notificationsEnabled, triggerRandomEvent, soundSystem, addNotification])

  // Manejar selección de evento
  const handleEventChoice = useCallback(
    (choice?: string) => {
      if (!currentEvent) return

      // Aplicar efectos del evento
      setGameState((prev) => {
        const newState = { ...prev }
        const effects =
          choice && currentEvent.effects.choices
            ? currentEvent.effects.choices.find((c) => c.id === choice)?.effects
            : currentEvent.effects.immediate

        if (effects) {
          // Aplicar efectos de recursos
          if (effects.resources) {
            Object.entries(effects.resources).forEach(([resource, amount]) => {
              newState.resources[resource as keyof typeof newState.resources] = Math.max(
                0,
                newState.resources[resource as keyof typeof newState.resources] + amount,
              )
            })
          }

          // Aplicar efectos de población
          if (effects.population) {
            if (effects.population.ants) {
              const antsToRemove = Math.abs(effects.population.ants)
              if (effects.population.ants < 0) {
                // Remover hormigas aleatoriamente
                const availableAnts = newState.ants.filter((ant) => ant.status === "idle")
                const antsToRemoveActual = Math.min(antsToRemove, availableAnts.length)

                for (let i = 0; i < antsToRemoveActual; i++) {
                  const randomIndex = Math.floor(Math.random() * availableAnts.length)
                  const antToRemove = availableAnts[randomIndex]
                  newState.ants = newState.ants.filter((ant) => ant.id !== antToRemove.id)
                  availableAnts.splice(randomIndex, 1)
                }
              }
            }
          }
        }

        return newState
      })

      // Agregar evento activo si tiene efectos temporales
      if (currentEvent.effects.temporary) {
        addActiveEvent(currentEvent, choice)
      }

      // Notificación de resultado
      if (choice && currentEvent.effects.choices) {
        const choiceData = currentEvent.effects.choices.find((c) => c.id === choice)
        if (choiceData) {
          notifySuccess("Decisión Tomada", choiceData.consequences || "Has tomado tu decisión")
        }
      }

      setShowEventModal(false)
      setCurrentEvent(null)
    },
    [currentEvent, addActiveEvent, notifySuccess],
  )

  // Auto-guardado con configuración personalizable
  useEffect(() => {
    if (!gameLoaded || !gameSettings.autoSaveEnabled) return

    const autoSaveInterval = setInterval(() => {
      GameStorage.saveGame(gameState)
      if (gameSettings.notificationsEnabled) {
        gameNotifications.gameSaved()
      }
    }, gameSettings.autoSaveInterval * 1000)

    return () => clearInterval(autoSaveInterval)
  }, [
    gameState,
    gameLoaded,
    gameSettings.autoSaveEnabled,
    gameSettings.autoSaveInterval,
    gameSettings.notificationsEnabled,
  ])

  // Función para cargar juego manualmente
  const loadGame = () => {
    const savedGame = GameStorage.loadGame()
    if (savedGame) {
      setGameState({
        ...savedGame,
        currentTime: Date.now(),
        lastEggCount: savedGame.lastEggCount || 0,
        lastLarvaeCount: savedGame.lastLarvaeCount || 0,
        lastAntsCount: savedGame.lastAntsCount || 0,
        achievementsUnlocked: savedGame.achievementsUnlocked || [],
        eventEffects: savedGame.eventEffects || {
          resourceMultiplier: { food: 1, dirt: 1, wood: 1, leaves: 1 },
          expeditionBonus: 0,
          constructionBonus: 0,
          researchBonus: 0,
          populationBonus: 0,
        },
      })
      gameNotifications.gameLoaded()
    }
  }

  // Función para nueva partida
  const newGame = () => {
    setGameState(getInitialGameState())
    GameStorage.clearSave()
    dismissAll()
  }

  // Función para manejar cambios de configuración
  const handleSettingsChange = (newSettings: GameSettings) => {
    setGameSettings(newSettings)
    saveGameSettings(newSettings)

    // Guardar configuración de sonidos si cambió
    if (newSettings.soundConfig) {
      setSoundConfig(newSettings.soundConfig)
      saveSoundConfig(newSettings.soundConfig)
    }
  }

  // Función para manejar cambios de atajos
  const handleShortcutsChange = (newShortcuts: KeyboardShortcuts) => {
    setKeyboardShortcuts(newShortcuts)
    saveKeyboardShortcuts(newShortcuts)
  }

  // Función para obtener hormigas disponibles (no ocupadas)
  const getAvailableAnts = useCallback(() => {
    return gameState.ants.filter((ant) => ant.status === "idle").length
  }, [gameState.ants])

  // Función para verificar si se puede conectar una cámara a otra
  const canConnect = useCallback((fromType: string, toType: string) => {
    const fromInfo = CHAMBER_INFO[fromType as keyof typeof CHAMBER_INFO]
    return fromInfo.allowedConnections.includes(toType)
  }, [])

  // Función para verificar y desbloquear logros
  const checkAchievements = useCallback(
    (newState: GameState) => {
      if (!gameSettings.notificationsEnabled) return newState

      const achievements = [...newState.achievementsUnlocked]

      // Primer huevo
      if (!achievements.includes("firstEgg") && newState.eggs.length > 0) {
        achievements.push("firstEgg")
        gameNotifications.firstEgg()
      }

      // Primera obrera
      if (!achievements.includes("firstWorker") && newState.ants.length > 0) {
        achievements.push("firstWorker")
        gameNotifications.firstWorker()
      }

      // 10 hormigas
      if (!achievements.includes("tenAnts") && newState.ants.length >= 10) {
        achievements.push("tenAnts")
        gameNotifications.tenAnts()
      }

      // Primera tecnología
      if (!achievements.includes("firstTechnology") && newState.researchedTechs.length > 0) {
        achievements.push("firstTechnology")
        gameNotifications.firstTechnology()
      }

      return { ...newState, achievementsUnlocked: achievements }
    },
    [gameSettings.notificationsEnabled],
  )

  // Actualizar tiempo del juego
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => ({ ...prev, currentTime: Date.now() }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Procesar eventos del juego
  useEffect(() => {
    const processGameEvents = () => {
      setGameState((prev) => {
        let newState = { ...prev }
        const timers = getTimers(gameSettings, prev.eventEffects)

        // Reina pone huevos
        if (prev.currentTime >= prev.queen.nextEggTime && canLayEgg()) {
          const newEgg = {
            id: `egg-${Date.now()}`,
            hatchTime: prev.currentTime + timers.EGG_HATCHING,
          }
          newState.eggs = [...prev.eggs, newEgg]
          newState.queen = {
            ...prev.queen,
            nextEggTime: prev.currentTime + timers.EGG_LAYING,
          }

          // Notificación de nuevo huevo
          if (gameSettings.notificationsEnabled) {
            gameNotifications.eggLaid()
          }
        }

        // Huevos eclosionan
        const hatchedEggs = prev.eggs.filter((egg) => prev.currentTime >= egg.hatchTime)
        if (hatchedEggs.length > 0) {
          const newLarvae = hatchedEggs.map((egg) => ({
            id: `larva-${egg.id}`,
            evolveTime: prev.currentTime + timers.LARVA_EVOLUTION,
          }))
          newState.eggs = prev.eggs.filter((egg) => prev.currentTime < egg.hatchTime)
          newState.larvae = [...prev.larvae, ...newLarvae]

          // Notificación de huevos eclosionados
          if (gameSettings.notificationsEnabled) {
            gameNotifications.eggHatched(hatchedEggs.length)
          }
        }

        // Larvas evolucionan automáticamente
        const autoEvolveLarvae = prev.larvae.filter(
          (larva) => prev.currentTime >= larva.evolveTime + timers.AUTO_EVOLUTION,
        )
        if (autoEvolveLarvae.length > 0) {
          const newAnts = autoEvolveLarvae.map((larva) => ({
            id: `ant-${larva.id}`,
            type: "worker" as const,
            status: "idle" as const,
            experience: 0,
          }))
          newState.larvae = prev.larvae.filter((larva) => prev.currentTime < larva.evolveTime + timers.AUTO_EVOLUTION)
          newState.ants = [...prev.ants, ...newAnts]

          // Notificación de larvas evolucionadas
          if (gameSettings.notificationsEnabled) {
            gameNotifications.larvaEvolved(autoEvolveLarvae.length, "obrera")
          }
        }

        // Producción de hongos (con multiplicador de eventos)
        if (prev.currentTime - prev.lastMushroomProduction >= timers.MUSHROOM_PRODUCTION) {
          const mushroomFarms = prev.chambers.filter((c) => c.type === "mushroom_farm")
          if (mushroomFarms.length > 0 && prev.resources.leaves > 0) {
            let totalProduction = 0
            mushroomFarms.forEach((farm) => {
              const baseProductionRate = farm.level * 1.05
              const assignedCultivators = prev.ants.filter(
                (ant) => ant.type === "cultivator" && ant.assignment === farm.id,
              )
              const cultivatorBonus = assignedCultivators.length * 0.25
              const eventMultiplier = prev.eventEffects.resourceMultiplier.food
              const finalProductionRate = baseProductionRate * (1 + cultivatorBonus) * eventMultiplier
              const leavesUsed = Math.min(prev.resources.leaves, farm.level)
              totalProduction += leavesUsed * finalProductionRate
            })

            if (totalProduction > 0) {
              const leavesConsumed = Math.min(
                prev.resources.leaves,
                mushroomFarms.reduce((sum, farm) => sum + farm.level, 0),
              )
              newState.resources = {
                ...prev.resources,
                food: prev.resources.food + Math.floor(totalProduction),
                leaves: prev.resources.leaves - leavesConsumed,
              }

              // Notificación de producción de hongos
              if (gameSettings.notificationsEnabled && totalProduction > 0) {
                gameNotifications.mushroomProduction(Math.floor(totalProduction))
              }
            }
          }
          newState.lastMushroomProduction = prev.currentTime
        }

        // Completar expediciones (con bonificación de eventos)
        const completedExpeditions = prev.expeditions.filter((exp) => prev.currentTime >= exp.endTime)
        if (completedExpeditions.length > 0) {
          const newResources = { ...prev.resources }
          let antsToFree = 0

          completedExpeditions.forEach((expedition) => {
            const baseAmount = expedition.antsCount * 3
            const randomMultiplier = 0.5 + Math.random() * 1.5
            const eventBonus = 1 + prev.eventEffects.expeditionBonus
            const resourceMultiplier = prev.eventEffects.resourceMultiplier[expedition.type]
            const foundAmount = Math.floor(baseAmount * randomMultiplier * eventBonus * resourceMultiplier)

            newResources[expedition.type] += foundAmount
            antsToFree += expedition.antsCount

            // Notificación de expedición completada
            if (gameSettings.notificationsEnabled) {
              gameNotifications.expeditionCompleted(expedition.type, foundAmount, expedition.antsCount)
            }
          })

          // Liberar hormigas de expediciones completadas
          let antsFreed = 0
          newState.ants = prev.ants.map((ant) => {
            if (ant.status === "working" && antsFreed < antsToFree) {
              antsFreed++
              return { ...ant, status: "idle" as const }
            }
            return ant
          })

          newState.resources = newResources
          newState.expeditions = prev.expeditions.filter((exp) => prev.currentTime < exp.endTime)
        }

        // Completar investigación (con bonificación de eventos)
        if (prev.currentResearch && prev.currentTime >= prev.currentResearch.endTime) {
          newState.researchedTechs = [...prev.researchedTechs, prev.currentResearch.techId]
          newState.currentResearch = null

          // Notificación de investigación completada
          if (gameSettings.notificationsEnabled) {
            const tech = TECHNOLOGIES[prev.currentResearch.techId]
            if (tech) {
              gameNotifications.researchCompleted(tech.name)
            }
          }
        }

        // Verificar límite de población
        if (gameSettings.notificationsEnabled && !canLayEgg() && prev.currentTime >= prev.queen.nextEggTime) {
          gameNotifications.populationLimit()
        }

        // Verificar recursos bajos
        if (gameSettings.notificationsEnabled) {
          const resourceThreshold = 50
          Object.entries(newState.resources).forEach(([resource, amount]) => {
            if (amount < resourceThreshold && amount > 0) {
              // Solo notificar una vez cada 5 minutos para evitar spam
              const lastNotificationKey = `lowResource_${resource}`
              const lastNotification = localStorage.getItem(lastNotificationKey)
              const now = Date.now()

              if (!lastNotification || now - Number.parseInt(lastNotification) > 5 * 60 * 1000) {
                gameNotifications.lowResources(resource)
                localStorage.setItem(lastNotificationKey, now.toString())
              }
            }
          })
        }

        // Verificar logros
        newState = checkAchievements(newState)

        return newState
      })
    }

    const interval = setInterval(processGameEvents, 1000)
    return () => clearInterval(interval)
  }, [gameSettings, checkAchievements])

  // Función para evolucionar larva a tipo específico
  const evolveToType = (larvaId: string, antType: "worker" | "soldier" | "cultivator") => {
    setGameState((prev) => {
      const larva = prev.larvae.find((l) => l.id === larvaId)
      if (!larva || prev.currentTime < larva.evolveTime) return prev

      const newAnt: Ant = {
        id: `ant-${larvaId}`,
        type: antType,
        status: "idle",
        experience: 0,
      }

      const newState = {
        ...prev,
        larvae: prev.larvae.filter((l) => l.id !== larvaId),
        ants: [...prev.ants, newAnt],
      }

      // Notificación de evolución manual
      if (gameSettings.notificationsEnabled) {
        const typeNames = { worker: "obrera", soldier: "soldado", cultivator: "cultivadora" }
        gameNotifications.larvaEvolved(1, typeNames[antType])
      }

      return newState
    })
  }

  // Función para asignar/desasignar hormigas
  const assignAnt = (antId: string, chamberId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      ants: prev.ants.map((ant) =>
        ant.id === antId
          ? {
              ...ant,
              status: chamberId ? "assigned" : "idle",
              assignment: chamberId || undefined,
            }
          : ant,
      ),
      chambers: prev.chambers.map((chamber) => ({
        ...chamber,
        assignedAnts:
          chamberId === chamber.id
            ? [...chamber.assignedAnts.filter((id) => id !== antId), antId]
            : chamber.assignedAnts.filter((id) => id !== antId),
      })),
    }))
  }

  const canBuildChamber = useCallback(
    (type: keyof typeof CHAMBER_COSTS.build) => {
      const cost = CHAMBER_COSTS.build[type]
      const availableAnts = getAvailableAnts()
      const info = CHAMBER_INFO[type]
      const royalLevel = getRoyalLevel()
      const currentCount = gameState.chambers.filter((c) => c.type === type).length

      const hasResources =
        gameState.resources.food >= (cost.food || 0) &&
        gameState.resources.dirt >= (cost.dirt || 0) &&
        gameState.resources.wood >= (cost.wood || 0) &&
        gameState.resources.leaves >= (cost.leaves || 0) &&
        availableAnts >= cost.ants

      const hasRoyalLevel = royalLevel >= info.requiresRoyalLevel
      const maxNurseries = gameState.researchedTechs.includes("expandedNurseries") ? 3 : 1
      const actualMaxCount = type === "nursery" ? maxNurseries : info.maxCount
      const withinLimit = currentCount < actualMaxCount

      const hasCompatibleConnection = gameState.chambers.some((chamber) => {
        const hasFreeTunnel = chamber.tunnels - chamber.connectedChambers.length > 0
        const canConnectToThis = canConnect(chamber.type, type)
        return hasFreeTunnel && canConnectToThis
      })

      const hasRequiredTech = type !== "mushroom_farm" || gameState.researchedTechs.includes("mushroomCultivation")

      return hasResources && hasRoyalLevel && withinLimit && hasCompatibleConnection && hasRequiredTech
    },
    [gameState, getAvailableAnts, canConnect],
  )

  const buildChamber = (type: keyof typeof CHAMBER_COSTS.build) => {
    if (!canBuildChamber(type)) return

    const cost = CHAMBER_COSTS.build[type]
    const info = CHAMBER_INFO[type]

    const chamberWithFreeTunnel = gameState.chambers.find((c) => {
      const hasFreeTunnel = c.tunnels - c.connectedChambers.length > 0
      const canConnectToThis = canConnect(c.type, type)
      return hasFreeTunnel && canConnectToThis
    })

    if (!chamberWithFreeTunnel) return

    const newChamberId = `chamber-${Date.now()}`

    setGameState((prev) => ({
      ...prev,
      resources: {
        food: prev.resources.food - (cost.food || 0),
        dirt: prev.resources.dirt - (cost.dirt || 0),
        wood: prev.resources.wood - (cost.wood || 0),
        leaves: prev.resources.leaves - (cost.leaves || 0),
      },
      chambers: [
        ...prev.chambers.map((c) =>
          c.id === chamberWithFreeTunnel.id ? { ...c, connectedChambers: [...c.connectedChambers, newChamberId] } : c,
        ),
        {
          id: newChamberId,
          type,
          level: 1,
          tunnels: info.baseTunnels,
          connectedChambers: [],
          assignedAnts: [],
        },
      ],
      ants: prev.ants.map((ant, index) =>
        index < cost.ants && ant.status === "idle" ? { ...ant, status: "building" as const } : ant,
      ),
    }))

    // Sonido de construcción iniciada
    soundSystem.playConstructionSound("constructionStart")

    // Notificación de construcción iniciada
    if (gameSettings.notificationsEnabled) {
      notifyInfo("Construcción Iniciada", `Se ha iniciado la construcción de ${info.name}`)
    }

    // Liberar hormigas después de un tiempo (con bonificación de eventos)
    const timers = getTimers(gameSettings, gameState.eventEffects)
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        ants: prev.ants.map((ant) => (ant.status === "building" ? { ...ant, status: "idle" as const } : ant)),
      }))

      // Notificación de construcción completada
      if (gameSettings.notificationsEnabled) {
        gameNotifications.constructionCompleted(info.name)
      }
    }, timers.CONSTRUCTION_TIME)
  }

  const startExpedition = (resourceType: "food" | "dirt" | "wood" | "leaves", antsCount: number) => {
    const availableAnts = getAvailableAnts()
    if (antsCount > availableAnts || antsCount <= 0) return

    // Aplicar bonificación de eventos a la velocidad de expedición
    const baseTime = EXPLORATION_TIME + Math.random() * 60 * 1000
    const speedBonus = 1 + gameState.eventEffects.expeditionBonus
    const explorationTime = Math.max(30000, baseTime / speedBonus) // Mínimo 30 segundos

    const locations = LOCATIONS[resourceType]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]

    const expedition: Expedition = {
      id: `expedition-${Date.now()}`,
      type: resourceType,
      antsCount,
      startTime: gameState.currentTime,
      endTime: gameState.currentTime + explorationTime,
      location: randomLocation,
    }

    setGameState((prev) => {
      let antsAssigned = 0
      return {
        ...prev,
        expeditions: [...prev.expeditions, expedition],
        ants: prev.ants.map((ant) => {
          if (ant.status === "idle" && antsAssigned < antsCount) {
            antsAssigned++
            return { ...ant, status: "working" as const }
          }
          return ant
        }),
      }
    })

    // Notificación de expedición iniciada
    if (gameSettings.notificationsEnabled) {
      notifyInfo(
        "Expedición Enviada",
        `${antsCount} hormiga${antsCount > 1 ? "s" : ""} enviada${antsCount > 1 ? "s" : ""} a ${randomLocation} por ${resourceType}`,
      )
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.max(0, Math.floor(ms / 1000))
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getNextEggProgress = () => {
    const timers = getTimers(gameSettings, gameState.eventEffects)
    const timeLeft = gameState.queen.nextEggTime - gameState.currentTime
    const progress = Math.max(0, 100 - (timeLeft / timers.EGG_LAYING) * 100)
    return Math.min(100, progress)
  }

  const getMaxPopulation = () => {
    const nurseries = gameState.chambers.filter((c) => c.type === "nursery")
    return nurseries.reduce((total, nursery) => total + nursery.level * 5, 0)
  }

  const getCurrentPopulation = () => {
    return gameState.eggs.length + gameState.larvae.length
  }

  const canLayEgg = () => {
    return getCurrentPopulation() < getMaxPopulation()
  }

  const startResearch = (techId: string) => {
    const tech = TECHNOLOGIES[techId]
    if (!tech) return

    const hasLaboratory = gameState.chambers.some((c) => c.type === "laboratory")
    if (!hasLaboratory) return

    const labLevel = Math.max(...gameState.chambers.filter((c) => c.type === "laboratory").map((c) => c.level))
    const speedBonus = labLevel * 0.15
    const timers = getTimers(gameSettings, gameState.eventEffects)
    const researchTime = (tech.researchTime * (1 - speedBonus)) / timers.RESEARCH_MULTIPLIER

    setGameState((prev) => ({
      ...prev,
      resources: {
        food: prev.resources.food - tech.cost.food,
        dirt: prev.resources.dirt - tech.cost.dirt,
        wood: prev.resources.wood - tech.cost.wood,
        leaves: prev.resources.leaves,
      },
      currentResearch: {
        techId,
        startTime: prev.currentTime,
        endTime: prev.currentTime + researchTime,
      },
    }))

    // Notificación de investigación iniciada
    if (gameSettings.notificationsEnabled) {
      gameNotifications.researchStarted(tech.name)
    }
  }

  const getRoyalLevel = () => {
    const royalChamber = gameState.chambers.find((c) => c.type === "royal")
    return royalChamber ? royalChamber.level : 0
  }

  const upgradeChamber = (chamberId: string) => {
    const chamber = gameState.chambers.find((c) => c.id === chamberId)
    if (!chamber) return

    const baseCost = CHAMBER_COSTS.build[chamber.type]
    const upgradeCost = CHAMBER_COSTS.upgrade(baseCost, chamber.level + 1, chamber.type)

    const availableAnts = getAvailableAnts()
    if (
      gameState.resources.food < (upgradeCost.food || 0) ||
      gameState.resources.dirt < (upgradeCost.dirt || 0) ||
      gameState.resources.wood < (upgradeCost.wood || 0) ||
      gameState.resources.leaves < (upgradeCost.leaves || 0) ||
      availableAnts < upgradeCost.ants
    ) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      resources: {
        food: prev.resources.food - (upgradeCost.food || 0),
        dirt: prev.resources.dirt - (upgradeCost.dirt || 0),
        wood: prev.resources.wood - (upgradeCost.wood || 0),
        leaves: prev.resources.leaves - (upgradeCost.leaves || 0),
      },
      chambers: prev.chambers.map((c) => (c.id === chamberId ? { ...c, level: c.level + 1 } : c)),
    }))

    // Sonido de mejora
    soundSystem.playConstructionSound("chamberUpgrade")

    // Notificación de mejora completada
    if (gameSettings.notificationsEnabled) {
      const info = CHAMBER_INFO[chamber.type]
      gameNotifications.chamberUpgraded(info.name, chamber.level + 1)
    }
  }

  const addTunnel = (chamberId: string) => {
    const chamber = gameState.chambers.find((c) => c.id === chamberId)
    if (!chamber) return

    const info = CHAMBER_INFO[chamber.type]
    if (!info.canAddTunnels) return

    const tunnelCost = CHAMBER_COSTS.tunnel
    const availableAnts = getAvailableAnts()

    if (
      gameState.resources.dirt < tunnelCost.dirt ||
      gameState.resources.wood < tunnelCost.wood ||
      availableAnts < tunnelCost.ants
    ) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        dirt: prev.resources.dirt - tunnelCost.dirt,
        wood: prev.resources.wood - tunnelCost.wood,
      },
      chambers: prev.chambers.map((c) => (c.id === chamberId ? { ...c, tunnels: c.tunnels + 1 } : c)),
    }))

    // Notificación de túnel agregado
    if (gameSettings.notificationsEnabled) {
      notifySuccess("Túnel Agregado", `Se ha agregado un nuevo túnel a ${info.name}`)
    }
  }

  // Funciones para atajos de teclado
  const keyboardActions = {
    switchToAnthill: () => {
      soundSystem.playUISound("tabSwitch")
      setCurrentTab("anthill")
    },
    switchToAnts: () => {
      soundSystem.playUISound("tabSwitch")
      setCurrentTab("ants")
    },
    switchToOutside: () => {
      soundSystem.playUISound("tabSwitch")
      setCurrentTab("outside")
    },
    switchToTechnology: () => {
      soundSystem.playUISound("tabSwitch")
      setCurrentTab("technology")
    },
    quickSave: () => {
      GameStorage.saveGame(gameState)
      soundSystem.playSystemSound("save")
      notifySuccess("Guardado Manual", "Tu progreso ha sido guardado")
    },
    openSettings: () => setShowSettings(true),
    openTutorial: () => setShowTutorial(true),
    buildNursery: () => buildChamber("nursery"),
    buildLaboratory: () => buildChamber("laboratory"),
    buildWarehouse: () => buildChamber("warehouse"),
    buildGranary: () => buildChamber("granary"),
    sendFoodExpedition: () => startExpedition("food", 1),
    sendDirtExpedition: () => startExpedition("dirt", 1),
    sendWoodExpedition: () => startExpedition("wood", 1),
    sendLeavesExpedition: () => startExpedition("leaves", 1),
    evolveAllToWorkers: () => {
      const readyLarvae = gameState.larvae.filter((larva) => gameState.currentTime >= larva.evolveTime)
      readyLarvae.forEach((larva) => evolveToType(larva.id, "worker"))
    },
    evolveAllToSoldiers: () => {
      if (!gameState.researchedTechs.includes("soldierCaste")) return
      const readyLarvae = gameState.larvae.filter((larva) => gameState.currentTime >= larva.evolveTime)
      readyLarvae.forEach((larva) => evolveToType(larva.id, "soldier"))
    },
    evolveAllToCultivators: () => {
      if (!gameState.researchedTechs.includes("specializedCultivators")) return
      const readyLarvae = gameState.larvae.filter((larva) => gameState.currentTime >= larva.evolveTime)
      readyLarvae.forEach((larva) => evolveToType(larva.id, "cultivator"))
    },
    upgradeRoyalChamber: () => {
      const royalChamber = gameState.chambers.find((c) => c.type === "royal")
      if (royalChamber) upgradeChamber(royalChamber.id)
    },
    upgradeAllNurseries: () => {
      const nurseries = gameState.chambers.filter((c) => c.type === "nursery")
      nurseries.forEach((nursery) => upgradeChamber(nursery.id))
    },
  }

  // Activar atajos de teclado
  useKeyboardShortcuts(keyboardShortcuts, keyboardActions)

  if (!gameLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🐜</div>
          <div className="text-lg">Cargando Reino de las Hormigas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4">
      <GameTutorialModal />
      <SaveLoadModal onLoadGame={loadGame} onNewGame={newGame} />
      <GameSettingsModal settings={gameSettings} onSettingsChange={handleSettingsChange} />
      <KeyboardShortcutsModal shortcuts={keyboardShortcuts} onShortcutsChange={handleShortcutsChange} />

      {/* Modal de Eventos Aleatorios */}
      <RandomEventModal
        event={currentEvent}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onChoice={handleEventChoice}
      />

      {/* Sistema de Notificaciones */}
      {gameSettings.notificationsEnabled && (
        <NotificationSystem
          notifications={notifications}
          onDismiss={dismissNotification}
          onDismissAll={dismissAll}
          maxVisible={5}
          position="top-right"
          showHistory={true}
          soundConfig={soundConfig}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">🐜 Reino de las Hormigas</h1>
          <p className="text-amber-700">Construye tu imperio subterráneo</p>
          <div className="text-xs text-muted-foreground mt-2">
            Presiona las teclas 1-4 para navegar | H para ayuda | S para guardar
            {gameSettings.notificationsEnabled && <span className="ml-2">| 🔔 Notificaciones activadas</span>}
            {activeEvents.length > 0 && <span className="ml-2">| ⚡ {activeEvents.length} evento(s) activo(s)</span>}
          </div>
        </header>

        {/* Mostrar eventos activos */}
        {activeEvents.length > 0 && (
          <div className="mb-4">
            <ActiveEventsDisplay activeEvents={activeEvents} currentTime={gameState.currentTime} />
          </div>
        )}

        {/* Panel de Estado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                Reina
                {gameState.eventEffects.populationBonus > 0 && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    +{Math.round(gameState.eventEffects.populationBonus * 100)}%
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Próximo huevo:</div>
                <Progress value={getNextEggProgress()} className="h-2" />
                <div className="text-xs">{formatTime(gameState.queen.nextEggTime - gameState.currentTime)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Población</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Egg className="h-3 w-3" />
                  <span>Huevos: {gameState.eggs.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Baby className="h-3 w-3" />
                  <span>Larvas: {gameState.larvae.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bug className="h-3 w-3" />
                  <span>Hormigas: {gameState.ants.length}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Disponibles: {getAvailableAnts()} | Capacidad: {getCurrentPopulation()}/{getMaxPopulation()}
                </div>
                <div className="text-xs text-blue-600">Z/X/V para evolucionar larvas rápidamente</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Recursos
                {(gameState.eventEffects.resourceMultiplier.food !== 1 ||
                  gameState.eventEffects.resourceMultiplier.dirt !== 1 ||
                  gameState.eventEffects.resourceMultiplier.wood !== 1 ||
                  gameState.eventEffects.resourceMultiplier.leaves !== 1) && (
                  <Badge variant="outline" className="text-xs text-blue-600">
                    Evento
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>🍯 Comida: {gameState.resources.food}</span>
                  {gameState.eventEffects.resourceMultiplier.food !== 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{gameState.eventEffects.resourceMultiplier.food.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>🟤 Tierra: {gameState.resources.dirt}</span>
                  {gameState.eventEffects.resourceMultiplier.dirt !== 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{gameState.eventEffects.resourceMultiplier.dirt.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>🪵 Madera: {gameState.resources.wood}</span>
                  {gameState.eventEffects.resourceMultiplier.wood !== 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{gameState.eventEffects.resourceMultiplier.wood.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>🍃 Hojas: {gameState.resources.leaves}</span>
                  {gameState.eventEffects.resourceMultiplier.leaves !== 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{gameState.eventEffects.resourceMultiplier.leaves.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-2">A/S/D/F para expediciones rápidas</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Cámaras
                {(gameState.eventEffects.constructionBonus > 0 || gameState.eventEffects.expeditionBonus > 0) && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    Bonificado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">Total: {gameState.chambers.length}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {gameState.chambers.map((chamber) => (
                  <Badge key={chamber.id} variant="secondary" className="text-xs">
                    {chamber.type}
                  </Badge>
                ))}
              </div>
              {gameState.chambers.some((c) => c.type === "mushroom_farm") && (
                <div className="text-xs text-green-600 mt-2">
                  🍄 Produciendo comida automáticamente
                  {gameState.ants.some((ant) => ant.type === "cultivator" && ant.status === "assigned") && (
                    <div className="text-xs text-green-700">⚡ Bonificación por cultivadoras</div>
                  )}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                💾{" "}
                {gameSettings.autoSaveEnabled
                  ? `Auto-guardado cada ${gameSettings.autoSaveInterval}s`
                  : "Auto-guardado desactivado"}
              </div>
              <div className="text-xs text-blue-600">Q/W/E/R para construcción rápida</div>
              {gameState.eventEffects.constructionBonus > 0 && (
                <div className="text-xs text-green-600">
                  🏗️ Construcción +{Math.round(gameState.eventEffects.constructionBonus * 100)}%
                </div>
              )}
              {gameState.eventEffects.expeditionBonus > 0 && (
                <div className="text-xs text-green-600">
                  🎒 Expediciones +{Math.round(gameState.eventEffects.expeditionBonus * 100)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mapas del Juego */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="anthill" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Hormiguero{" "}
              <Badge variant="outline" className="ml-1 text-xs">
                1
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Hormigas{" "}
              <Badge variant="outline" className="ml-1 text-xs">
                2
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="outside" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Exterior{" "}
              <Badge variant="outline" className="ml-1 text-xs">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="technology" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Tecnología{" "}
              <Badge variant="outline" className="ml-1 text-xs">
                4
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anthill" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista del Hormiguero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {gameState.chambers
                    .sort((a, b) => {
                      if (a.type === "royal") return -1
                      if (b.type === "royal") return 1
                      if (a.type === "nursery") return -1
                      if (b.type === "nursery") return 1
                      return 0
                    })
                    .map((chamber) => (
                      <ChamberUpgrade
                        key={chamber.id}
                        chamber={chamber}
                        resources={gameState.resources}
                        availableAnts={getAvailableAnts()}
                        onUpgrade={upgradeChamber}
                        onAddTunnel={addTunnel}
                        royalLevel={getRoyalLevel()}
                      />
                    ))}

                  <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">➕</div>
                    <div className="text-sm text-muted-foreground">Nueva Cámara</div>
                    <div className="text-xs text-blue-600 mt-1">Q/W/E/R</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Construir Nueva Cámara</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.keys(CHAMBER_COSTS.build)
                      .filter((type) => type !== "royal")
                      .map((type) => (
                        <Button
                          key={type}
                          variant={selectedChamberType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedChamberType(type as keyof typeof CHAMBER_COSTS.build)}
                          className="capitalize"
                        >
                          {type === "mushroom_farm" ? "🍄" : ""} {type.replace("_", " ")}
                          {type === "nursery" && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              Q
                            </Badge>
                          )}
                          {type === "laboratory" && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              W
                            </Badge>
                          )}
                          {type === "warehouse" && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              E
                            </Badge>
                          )}
                          {type === "granary" && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              R
                            </Badge>
                          )}
                        </Button>
                      ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConstructionRequirements
                      chamberType={selectedChamberType}
                      chambers={gameState.chambers}
                      royalLevel={getRoyalLevel()}
                      researchedTechs={gameState.researchedTechs}
                    />

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium capitalize">{selectedChamberType.replace("_", " ")}</h4>
                            <div className="text-sm text-muted-foreground">
                              Costo:{" "}
                              {Object.entries(CHAMBER_COSTS.build[selectedChamberType])
                                .map(([resource, amount]) => {
                                  const icon =
                                    resource === "food"
                                      ? "🍯"
                                      : resource === "dirt"
                                        ? "🟤"
                                        : resource === "wood"
                                          ? "🪵"
                                          : resource === "leaves"
                                            ? "🍃"
                                            : ""
                                  return `${amount}${icon}`
                                })
                                .join(" ")}
                            </div>
                            {gameState.eventEffects.constructionBonus > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                ⚡ Construcción acelerada (+{Math.round(gameState.eventEffects.constructionBonus * 100)}
                                %)
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => buildChamber(selectedChamberType)}
                            disabled={!canBuildChamber(selectedChamberType)}
                          >
                            Construir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ants" className="space-y-4">
            <AntManagement
              ants={gameState.ants}
              chambers={gameState.chambers}
              larvae={gameState.larvae}
              currentTime={gameState.currentTime}
              researchedTechs={gameState.researchedTechs}
              onEvolveToType={evolveToType}
              onAssignAnt={assignAnt}
            />
          </TabsContent>

          <TabsContent value="outside" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Expediciones Activas
                  {gameState.eventEffects.expeditionBonus > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      +{Math.round(gameState.eventEffects.expeditionBonus * 100)}% velocidad
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.expeditions.length > 0 ? (
                  <div className="space-y-3">
                    {gameState.expeditions.map((expedition) => {
                      const progress = Math.min(
                        100,
                        ((gameState.currentTime - expedition.startTime) / (expedition.endTime - expedition.startTime)) *
                          100,
                      )
                      const timeLeft = expedition.endTime - gameState.currentTime

                      return (
                        <div key={expedition.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">
                                {expedition.type === "food" && "🍯"}
                                {expedition.type === "dirt" && "🟤"}
                                {expedition.type === "wood" && "🪵"}
                                {expedition.type === "leaves" && "🍃"}
                                {expedition.location}
                              </span>
                              <div className="text-sm text-muted-foreground">
                                {expedition.antsCount} hormigas explorando
                              </div>
                            </div>
                            <div className="text-sm font-medium">{formatTime(timeLeft)}</div>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">No hay expediciones activas</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar Expedición</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(["food", "dirt", "wood", "leaves"] as const).map((resourceType) => (
                    <div key={resourceType} className="relative">
                      <ExpeditionCard
                        resourceType={resourceType}
                        onStartExpedition={startExpedition}
                        availableAnts={getAvailableAnts()}
                      />
                      <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                        {resourceType === "food" && "A"}
                        {resourceType === "dirt" && "S"}
                        {resourceType === "wood" && "D"}
                        {resourceType === "leaves" && "F"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Hormigas disponibles: {getAvailableAnts()} | Presiona A/S/D/F para enviar 1 hormiga rápidamente
                  {gameState.eventEffects.expeditionBonus > 0 && (
                    <div className="text-green-600">
                      ⚡ Expediciones aceleradas (+{Math.round(gameState.eventEffects.expeditionBonus * 100)}%)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Árbol Tecnológico
                  {gameState.eventEffects.researchBonus > 0 && (
                    <Badge variant="outline" className="text-xs text-blue-600">
                      +{Math.round(gameState.eventEffects.researchBonus * 100)}% velocidad
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.chambers.some((c) => c.type === "laboratory") ? (
                  <TechnologyTree
                    researchedTechs={gameState.researchedTechs}
                    currentResearch={gameState.currentResearch}
                    resources={gameState.resources}
                    onStartResearch={startResearch}
                    currentTime={gameState.currentTime}
                    hasGranary={gameState.chambers.some((c) => c.type === "granary")}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl mb-4">🔬</div>
                      <h3 className="text-lg font-medium mb-2">Laboratorio Requerido para Investigar</h3>
                      <p className="text-muted-foreground mb-4">
                        Construye un laboratorio para poder investigar tecnologías
                      </p>
                      <div className="text-xs text-blue-600">Presiona W para construir laboratorio rápidamente</div>
                    </div>

                    <div className="opacity-75">
                      <TechnologyTree
                        researchedTechs={gameState.researchedTechs}
                        currentResearch={null}
                        resources={gameState.resources}
                        onStartResearch={() => {}}
                        currentTime={gameState.currentTime}
                        hasGranary={gameState.chambers.some((c) => c.type === "granary")}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
