"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Zap, CloudRain, AlertTriangle, Gift, Sparkles, Heart } from "lucide-react"

export interface RandomEvent {
  id: string
  type: "positive" | "negative" | "neutral" | "choice"
  category: "weather" | "discovery" | "visitor" | "disaster" | "opportunity" | "mystery"
  title: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  duration?: number // en ms, para eventos temporales
  effects: {
    immediate?: {
      resources?: { food?: number; dirt?: number; wood?: number; leaves?: number }
      population?: { eggs?: number; larvae?: number; ants?: number }
      chambers?: { damage?: number; boost?: number }
    }
    temporary?: {
      duration: number // en ms
      resourceMultiplier?: { food?: number; dirt?: number; wood?: number; leaves?: number }
      expeditionBonus?: number
      constructionBonus?: number
      researchBonus?: number
      populationBonus?: number
    }
    choices?: Array<{
      id: string
      text: string
      effects: RandomEvent["effects"]["immediate"]
      consequences?: string
    }>
  }
  requirements?: {
    minAnts?: number
    minChambers?: number
    hasResearch?: string[]
    minResources?: { food?: number; dirt?: number; wood?: number; leaves?: number }
  }
  cooldown?: number // tiempo antes de que pueda volver a aparecer
  onlyOnce?: boolean // evento único
}

export const RANDOM_EVENTS: Record<string, RandomEvent> = {
  // Eventos de Clima
  heavyRain: {
    id: "heavyRain",
    type: "positive",
    category: "weather",
    title: "Lluvia Abundante",
    description: "Una lluvia torrencial ha empapado el suelo, facilitando la excavación y el crecimiento de plantas.",
    icon: "🌧️",
    rarity: "common",
    duration: 5 * 60 * 1000, // 5 minutos
    effects: {
      immediate: {
        resources: { dirt: 50, leaves: 20 },
      },
      temporary: {
        duration: 5 * 60 * 1000,
        expeditionBonus: 0.3,
        constructionBonus: 0.2,
      },
    },
  },

  drought: {
    id: "drought",
    type: "negative",
    category: "weather",
    title: "Sequía",
    description:
      "Una sequía severa ha endurecido el suelo y marchitado las plantas. Las expediciones serán más difíciles.",
    icon: "☀️",
    rarity: "uncommon",
    duration: 8 * 60 * 1000, // 8 minutos
    effects: {
      temporary: {
        duration: 8 * 60 * 1000,
        expeditionBonus: -0.4,
        resourceMultiplier: { food: 0.7 },
      },
    },
  },

  perfectWeather: {
    id: "perfectWeather",
    type: "positive",
    category: "weather",
    title: "Clima Perfecto",
    description: "Las condiciones climáticas son ideales. Todas las actividades de la colonia son más eficientes.",
    icon: "🌤️",
    rarity: "rare",
    duration: 10 * 60 * 1000, // 10 minutos
    effects: {
      temporary: {
        duration: 10 * 60 * 1000,
        expeditionBonus: 0.5,
        constructionBonus: 0.3,
        researchBonus: 0.25,
        resourceMultiplier: { food: 1.3, dirt: 1.2, wood: 1.2, leaves: 1.4 },
      },
    },
  },

  // Eventos de Descubrimiento
  ancientTreasure: {
    id: "ancientTreasure",
    type: "positive",
    category: "discovery",
    title: "Tesoro Ancestral",
    description: "Tus hormigas han descubierto un antiguo tesoro enterrado lleno de recursos valiosos.",
    icon: "💎",
    rarity: "rare",
    effects: {
      immediate: {
        resources: { food: 200, dirt: 150, wood: 100, leaves: 75 },
      },
    },
    requirements: {
      minAnts: 5,
    },
    cooldown: 30 * 60 * 1000, // 30 minutos
  },

  fertileSoil: {
    id: "fertileSoil",
    type: "positive",
    category: "discovery",
    title: "Suelo Fértil",
    description: "Se ha encontrado una veta de suelo extremadamente fértil que beneficiará la producción de hongos.",
    icon: "🌱",
    rarity: "uncommon",
    effects: {
      temporary: {
        duration: 15 * 60 * 1000, // 15 minutos
        resourceMultiplier: { food: 2.0 },
      },
    },
    requirements: {
      hasResearch: ["mushroomCultivation"],
    },
  },

  mysteriousSpores: {
    id: "mysteriousSpores",
    type: "choice",
    category: "mystery",
    title: "Esporas Misteriosas",
    description: "Tus hormigas han encontrado esporas de origen desconocido. ¿Qué decides hacer con ellas?",
    icon: "🍄",
    rarity: "uncommon",
    effects: {
      choices: [
        {
          id: "cultivate",
          text: "Cultivar las esporas (Arriesgado)",
          effects: { resources: { food: 100 } },
          consequences: "Las esporas podrían ser beneficiosas... o peligrosas",
        },
        {
          id: "study",
          text: "Estudiar las esporas",
          effects: { resources: { leaves: 50 } },
          consequences: "Conocimiento seguro pero limitado",
        },
        {
          id: "ignore",
          text: "Ignorar las esporas",
          effects: {},
          consequences: "Mejor prevenir que lamentar",
        },
      ],
    },
  },

  // Eventos de Visitantes
  friendlyAnts: {
    id: "friendlyAnts",
    type: "positive",
    category: "visitor",
    title: "Hormigas Amigas",
    description: "Una colonia vecina ha enviado hormigas para ayudar temporalmente con el trabajo.",
    icon: "🤝",
    rarity: "common",
    effects: {
      temporary: {
        duration: 10 * 60 * 1000, // 10 minutos
        constructionBonus: 0.5,
        expeditionBonus: 0.3,
      },
    },
    requirements: {
      minAnts: 3,
    },
  },

  tradingCaravan: {
    id: "tradingCaravan",
    type: "choice",
    category: "opportunity",
    title: "Caravana Comerciante",
    description: "Una caravana de comerciantes ha llegado. Ofrecen intercambiar recursos.",
    icon: "🚛",
    rarity: "uncommon",
    effects: {
      choices: [
        {
          id: "trade_food",
          text: "Intercambiar 100 comida por 150 madera",
          effects: { resources: { food: -100, wood: 150 } },
          consequences: "Buen intercambio de comida por madera",
        },
        {
          id: "trade_dirt",
          text: "Intercambiar 200 tierra por 100 comida",
          effects: { resources: { dirt: -200, food: 100 } },
          consequences: "Intercambio de tierra por comida",
        },
        {
          id: "no_trade",
          text: "No comerciar",
          effects: {},
          consequences: "Conservas tus recursos",
        },
      ],
    },
    requirements: {
      minResources: { food: 100 },
    },
  },

  royalVisitor: {
    id: "royalVisitor",
    type: "positive",
    category: "visitor",
    title: "Visita Real",
    description:
      "Una reina de otra colonia ha venido a visitar, impresionada por tu progreso. Te otorga un regalo real.",
    icon: "👑",
    rarity: "legendary",
    effects: {
      immediate: {
        resources: { food: 300, dirt: 200, wood: 200, leaves: 100 },
      },
      temporary: {
        duration: 20 * 60 * 1000, // 20 minutos
        researchBonus: 0.5,
        populationBonus: 0.3,
      },
    },
    requirements: {
      minChambers: 5,
      minAnts: 15,
    },
    onlyOnce: true,
  },

  // Eventos de Desastre
  tunnelCollapse: {
    id: "tunnelCollapse",
    type: "negative",
    category: "disaster",
    title: "Colapso de Túnel",
    description: "Un túnel ha colapsado debido a la inestabilidad del suelo. Algunas hormigas están atrapadas.",
    icon: "💥",
    rarity: "uncommon",
    effects: {
      immediate: {
        population: { ants: -2 },
        resources: { dirt: -50 },
      },
    },
    requirements: {
      minAnts: 5,
      minChambers: 3,
    },
  },

  pestInvasion: {
    id: "pestInvasion",
    type: "choice",
    category: "disaster",
    title: "Invasión de Plagas",
    description: "Insectos hostiles han invadido parte de tu territorio. ¿Cómo respondes?",
    icon: "🦗",
    rarity: "uncommon",
    effects: {
      choices: [
        {
          id: "fight",
          text: "Luchar contra las plagas",
          effects: { population: { ants: -1 }, resources: { food: 50 } },
          consequences: "Pierdes hormigas pero recuperas territorio",
        },
        {
          id: "negotiate",
          text: "Negociar territorio",
          effects: { resources: { food: -100 } },
          consequences: "Pagas tributo pero evitas bajas",
        },
        {
          id: "retreat",
          text: "Retirarse temporalmente",
          effects: { resources: { food: -50, dirt: -30 } },
          consequences: "Pierdes recursos pero mantienes la población",
        },
      ],
    },
    requirements: {
      minAnts: 3,
    },
  },

  fungalInfection: {
    id: "fungalInfection",
    type: "negative",
    category: "disaster",
    title: "Infección Fúngica",
    description: "Una infección fúngica ha afectado tus granjas de hongos, reduciendo la producción de comida.",
    icon: "🦠",
    rarity: "rare",
    effects: {
      temporary: {
        duration: 12 * 60 * 1000, // 12 minutos
        resourceMultiplier: { food: 0.3 },
      },
    },
    requirements: {
      hasResearch: ["mushroomCultivation"],
    },
  },

  // Eventos de Oportunidad
  scientificBreakthrough: {
    id: "scientificBreakthrough",
    type: "positive",
    category: "opportunity",
    title: "Avance Científico",
    description: "Tus investigadores han hecho un descubrimiento que acelera todas las investigaciones futuras.",
    icon: "🔬",
    rarity: "rare",
    effects: {
      temporary: {
        duration: 15 * 60 * 1000, // 15 minutos
        researchBonus: 0.75,
      },
    },
    requirements: {
      hasResearch: ["advancedConstruction"],
    },
  },

  abundantHarvest: {
    id: "abundantHarvest",
    type: "positive",
    category: "opportunity",
    title: "Cosecha Abundante",
    description: "Las plantas cercanas han dado una cosecha excepcional. Tus expediciones encuentran más recursos.",
    icon: "🌾",
    rarity: "common",
    effects: {
      temporary: {
        duration: 8 * 60 * 1000, // 8 minutos
        expeditionBonus: 0.6,
        resourceMultiplier: { food: 1.5, leaves: 2.0 },
      },
    },
  },

  inspirationalLeader: {
    id: "inspirationalLeader",
    type: "positive",
    category: "opportunity",
    title: "Líder Inspirador",
    description:
      "Una de tus hormigas ha demostrado cualidades de liderazgo excepcionales, motivando a toda la colonia.",
    icon: "⭐",
    rarity: "uncommon",
    effects: {
      temporary: {
        duration: 12 * 60 * 1000, // 12 minutos
        constructionBonus: 0.4,
        expeditionBonus: 0.3,
        populationBonus: 0.2,
      },
    },
    requirements: {
      minAnts: 8,
    },
  },

  // Eventos Misteriosos
  ancientRelic: {
    id: "ancientRelic",
    type: "choice",
    category: "mystery",
    title: "Reliquia Ancestral",
    description: "Se ha descubierto una reliquia antigua de poder desconocido. Su energía es palpable.",
    icon: "🔮",
    rarity: "legendary",
    effects: {
      choices: [
        {
          id: "activate",
          text: "Activar la reliquia",
          effects: { resources: { food: 500, dirt: 300, wood: 300, leaves: 200 } },
          consequences: "Poder inmenso... pero ¿a qué costo?",
        },
        {
          id: "study_relic",
          text: "Estudiar la reliquia",
          effects: { resources: { food: 100, dirt: 100, wood: 100, leaves: 100 } },
          consequences: "Conocimiento seguro y recursos moderados",
        },
        {
          id: "seal_relic",
          text: "Sellar la reliquia",
          effects: {},
          consequences: "Evitas riesgos desconocidos",
        },
      ],
    },
    requirements: {
      minChambers: 6,
      hasResearch: ["advancedConstruction"],
    },
    onlyOnce: true,
  },

  timeDistortion: {
    id: "timeDistortion",
    type: "positive",
    category: "mystery",
    title: "Distorsión Temporal",
    description: "Una extraña anomalía temporal acelera todos los procesos de tu colonia por un tiempo limitado.",
    icon: "⏰",
    rarity: "legendary",
    effects: {
      temporary: {
        duration: 5 * 60 * 1000, // 5 minutos
        expeditionBonus: 1.0, // 100% más rápido
        constructionBonus: 1.0,
        researchBonus: 1.0,
        populationBonus: 1.0,
      },
    },
    requirements: {
      minAnts: 20,
    },
    cooldown: 60 * 60 * 1000, // 1 hora
  },
}

interface RandomEventSystemProps {
  gameState: any
  onEventTriggered: (event: RandomEvent, choice?: string) => void
  currentTime: number
  gameSettings: any
}

interface ActiveEvent {
  event: RandomEvent
  startTime: number
  endTime?: number
  choice?: string
}

export const useRandomEventSystem = () => {
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([])
  const [eventHistory, setEventHistory] = useState<string[]>([])
  const [lastEventTime, setLastEventTime] = useState(0)
  const [eventCooldowns, setEventCooldowns] = useState<Record<string, number>>({})

  const checkEventRequirements = useCallback((event: RandomEvent, gameState: any): boolean => {
    const { requirements } = event

    if (!requirements) return true

    // Verificar hormigas mínimas
    if (requirements.minAnts && gameState.ants.length < requirements.minAnts) {
      return false
    }

    // Verificar cámaras mínimas
    if (requirements.minChambers && gameState.chambers.length < requirements.minChambers) {
      return false
    }

    // Verificar investigaciones requeridas
    if (requirements.hasResearch) {
      const hasAllResearch = requirements.hasResearch.every((tech) => gameState.researchedTechs.includes(tech))
      if (!hasAllResearch) return false
    }

    // Verificar recursos mínimos
    if (requirements.minResources) {
      const hasEnoughResources = Object.entries(requirements.minResources).every(
        ([resource, amount]) => gameState.resources[resource] >= amount,
      )
      if (!hasEnoughResources) return false
    }

    return true
  }, [])

  const getRandomEvent = useCallback(
    (gameState: any, currentTime: number): RandomEvent | null => {
      // Filtrar eventos disponibles
      const availableEvents = Object.values(RANDOM_EVENTS).filter((event) => {
        // Verificar si es evento único y ya ocurrió
        if (event.onlyOnce && eventHistory.includes(event.id)) {
          return false
        }

        // Verificar cooldown
        if (event.cooldown && eventCooldowns[event.id] && currentTime < eventCooldowns[event.id]) {
          return false
        }

        // Verificar requisitos
        return checkEventRequirements(event, gameState)
      })

      if (availableEvents.length === 0) return null

      // Calcular probabilidades basadas en rareza
      const rarityWeights = {
        common: 100,
        uncommon: 50,
        rare: 20,
        legendary: 5,
      }

      const weightedEvents = availableEvents.flatMap((event) => Array(rarityWeights[event.rarity]).fill(event))

      // Seleccionar evento aleatorio
      const randomIndex = Math.floor(Math.random() * weightedEvents.length)
      return weightedEvents[randomIndex]
    },
    [eventHistory, eventCooldowns, checkEventRequirements],
  )

  const triggerRandomEvent = useCallback(
    (gameState: any, currentTime: number): RandomEvent | null => {
      // Verificar si es tiempo de un nuevo evento (cada 3-8 minutos)
      const minInterval = 3 * 60 * 1000 // 3 minutos
      const maxInterval = 8 * 60 * 1000 // 8 minutos
      const timeSinceLastEvent = currentTime - lastEventTime

      if (timeSinceLastEvent < minInterval) return null

      // Probabilidad creciente con el tiempo
      const probability = Math.min(0.3, ((timeSinceLastEvent - minInterval) / (maxInterval - minInterval)) * 0.3)

      if (Math.random() > probability) return null

      const event = getRandomEvent(gameState, currentTime)
      if (!event) return null

      // Registrar evento
      setLastEventTime(currentTime)
      setEventHistory((prev) => [...prev, event.id])

      // Establecer cooldown si aplica
      if (event.cooldown) {
        setEventCooldowns((prev) => ({
          ...prev,
          [event.id]: currentTime + event.cooldown!,
        }))
      }

      return event
    },
    [lastEventTime, getRandomEvent],
  )

  const addActiveEvent = useCallback((event: RandomEvent, choice?: string) => {
    const activeEvent: ActiveEvent = {
      event,
      startTime: Date.now(),
      endTime: event.duration ? Date.now() + event.duration : undefined,
      choice,
    }

    setActiveEvents((prev) => [...prev, activeEvent])
  }, [])

  const removeActiveEvent = useCallback((eventId: string) => {
    setActiveEvents((prev) => prev.filter((ae) => ae.event.id !== eventId))
  }, [])

  const getActiveEventEffects = useCallback(
    (currentTime: number) => {
      const effects = {
        resourceMultiplier: { food: 1, dirt: 1, wood: 1, leaves: 1 },
        expeditionBonus: 0,
        constructionBonus: 0,
        researchBonus: 0,
        populationBonus: 0,
      }

      activeEvents.forEach((activeEvent) => {
        const { event, endTime } = activeEvent

        // Verificar si el evento sigue activo
        if (endTime && currentTime > endTime) {
          removeActiveEvent(event.id)
          return
        }

        // Aplicar efectos temporales
        if (event.effects.temporary) {
          const temp = event.effects.temporary

          if (temp.resourceMultiplier) {
            Object.entries(temp.resourceMultiplier).forEach(([resource, multiplier]) => {
              effects.resourceMultiplier[resource as keyof typeof effects.resourceMultiplier] *= multiplier
            })
          }

          if (temp.expeditionBonus) effects.expeditionBonus += temp.expeditionBonus
          if (temp.constructionBonus) effects.constructionBonus += temp.constructionBonus
          if (temp.researchBonus) effects.researchBonus += temp.researchBonus
          if (temp.populationBonus) effects.populationBonus += temp.populationBonus
        }
      })

      return effects
    },
    [activeEvents, removeActiveEvent],
  )

  return {
    activeEvents,
    triggerRandomEvent,
    addActiveEvent,
    removeActiveEvent,
    getActiveEventEffects,
    eventHistory,
  }
}

export default function RandomEventModal({
  event,
  isOpen,
  onClose,
  onChoice,
}: {
  event: RandomEvent | null
  isOpen: boolean
  onClose: () => void
  onChoice: (choice?: string) => void
}) {
  if (!event) return null

  const getEventIcon = () => {
    switch (event.category) {
      case "weather":
        return <CloudRain className="h-6 w-6" />
      case "discovery":
        return <Sparkles className="h-6 w-6" />
      case "visitor":
        return <Heart className="h-6 w-6" />
      case "disaster":
        return <AlertTriangle className="h-6 w-6" />
      case "opportunity":
        return <Gift className="h-6 w-6" />
      case "mystery":
        return <Zap className="h-6 w-6" />
      default:
        return <Sparkles className="h-6 w-6" />
    }
  }

  const getRarityColor = () => {
    switch (event.rarity) {
      case "common":
        return "bg-gray-100 border-gray-300 text-gray-800"
      case "uncommon":
        return "bg-green-100 border-green-300 text-green-800"
      case "rare":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "legendary":
        return "bg-purple-100 border-purple-300 text-purple-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getTypeColor = () => {
    switch (event.type) {
      case "positive":
        return "border-green-400 bg-green-50"
      case "negative":
        return "border-red-400 bg-red-50"
      case "choice":
        return "border-yellow-400 bg-yellow-50"
      default:
        return "border-blue-400 bg-blue-50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${getTypeColor()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getEventIcon()}
              <span className="text-2xl">{event.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {event.title}
                <Badge className={getRarityColor()}>{event.rarity}</Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">{event.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Efectos inmediatos */}
          {event.effects.immediate && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Efectos Inmediatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {event.effects.immediate.resources && (
                    <div>
                      <strong>Recursos:</strong>
                      {Object.entries(event.effects.immediate.resources).map(([resource, amount]) => (
                        <span key={resource} className={`ml-2 ${amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {amount > 0 ? "+" : ""}
                          {amount} {resource}
                        </span>
                      ))}
                    </div>
                  )}
                  {event.effects.immediate.population && (
                    <div>
                      <strong>Población:</strong>
                      {Object.entries(event.effects.immediate.population).map(([type, amount]) => (
                        <span key={type} className={`ml-2 ${amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {amount > 0 ? "+" : ""}
                          {amount} {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Efectos temporales */}
          {event.effects.temporary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Efectos Temporales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Duración:</strong> {Math.floor(event.effects.temporary.duration / (60 * 1000))} minutos
                  </div>
                  {event.effects.temporary.expeditionBonus && (
                    <div className={event.effects.temporary.expeditionBonus > 0 ? "text-green-600" : "text-red-600"}>
                      Expediciones: {event.effects.temporary.expeditionBonus > 0 ? "+" : ""}
                      {Math.round(event.effects.temporary.expeditionBonus * 100)}%
                    </div>
                  )}
                  {event.effects.temporary.constructionBonus && (
                    <div className={event.effects.temporary.constructionBonus > 0 ? "text-green-600" : "text-red-600"}>
                      Construcción: {event.effects.temporary.constructionBonus > 0 ? "+" : ""}
                      {Math.round(event.effects.temporary.constructionBonus * 100)}%
                    </div>
                  )}
                  {event.effects.temporary.researchBonus && (
                    <div className={event.effects.temporary.researchBonus > 0 ? "text-green-600" : "text-red-600"}>
                      Investigación: {event.effects.temporary.researchBonus > 0 ? "+" : ""}
                      {Math.round(event.effects.temporary.researchBonus * 100)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opciones de elección */}
          {event.type === "choice" && event.effects.choices && (
            <div className="space-y-2">
              <h4 className="font-medium">¿Qué decides hacer?</h4>
              {event.effects.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="w-full text-left h-auto p-3"
                  onClick={() => onChoice(choice.id)}
                >
                  <div>
                    <div className="font-medium">{choice.text}</div>
                    {choice.consequences && (
                      <div className="text-xs text-muted-foreground mt-1">{choice.consequences}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Botón para eventos sin elección */}
          {event.type !== "choice" && (
            <Button onClick={() => onChoice()} className="w-full">
              Continuar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente para mostrar eventos activos
export function ActiveEventsDisplay({
  activeEvents,
  currentTime,
}: {
  activeEvents: ActiveEvent[]
  currentTime: number
}) {
  if (activeEvents.length === 0) return null

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Eventos Activos ({activeEvents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeEvents.map((activeEvent) => {
            const timeLeft = activeEvent.endTime ? activeEvent.endTime - currentTime : 0
            const progress = activeEvent.endTime
              ? Math.max(0, 100 - (timeLeft / activeEvent.event.effects.temporary!.duration) * 100)
              : 100

            return (
              <div key={activeEvent.event.id} className="bg-white rounded p-2 border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{activeEvent.event.icon}</span>
                    <span className="text-sm font-medium">{activeEvent.event.title}</span>
                  </div>
                  {activeEvent.endTime && (
                    <span className="text-xs text-muted-foreground">
                      {Math.max(0, Math.floor(timeLeft / (60 * 1000)))}m{" "}
                      {Math.max(0, Math.floor((timeLeft % (60 * 1000)) / 1000))}s
                    </span>
                  )}
                </div>
                {activeEvent.endTime && <Progress value={progress} className="h-1" />}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
