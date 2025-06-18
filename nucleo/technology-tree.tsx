"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Zap, Users, Building, Beaker } from "lucide-react"

export interface Technology {
  id: string
  name: string
  description: string
  category: "biology" | "engineering" | "exploration" | "military"
  cost: { food: number; dirt: number; wood: number }
  researchTime: number
  prerequisites: string[]
  effects: {
    eggLayingSpeedBonus?: number
    hatchingSpeedBonus?: number
    evolutionSpeedBonus?: number
    explorationSpeedBonus?: number
    explorationEfficiencyBonus?: number
    maxPopulationBonus?: number
    newUnits?: string[]
    newBuildings?: string[]
    maxNurseriesBonus?: number
  }
}

export const TECHNOLOGIES: Record<string, Technology> = {
  // Biología
  fertilityBoost: {
    id: "fertilityBoost",
    name: "Fertilidad Mejorada",
    description: "La reina pone huevos 25% más rápido",
    category: "biology",
    cost: { food: 100, dirt: 50, wood: 25 },
    researchTime: 5 * 60 * 1000,
    prerequisites: [],
    effects: { eggLayingSpeedBonus: 0.25 },
  },
  rapidDevelopment: {
    id: "rapidDevelopment",
    name: "Desarrollo Rápido",
    description: "Huevos y larvas se desarrollan 30% más rápido",
    category: "biology",
    cost: { food: 150, dirt: 75, wood: 50 },
    researchTime: 7 * 60 * 1000,
    prerequisites: ["fertilityBoost"],
    effects: { hatchingSpeedBonus: 0.3, evolutionSpeedBonus: 0.3 },
  },

  // Ingeniería
  advancedConstruction: {
    id: "advancedConstruction",
    name: "Construcción Avanzada",
    description: "Desbloquea nuevas construcciones",
    category: "engineering",
    cost: { food: 75, dirt: 150, wood: 100 },
    researchTime: 6 * 60 * 1000,
    prerequisites: [],
    effects: { newBuildings: ["laboratory", "warehouse", "dining"] },
  },

  // Nueva tecnología para granja de hongos
  mushroomCultivation: {
    id: "mushroomCultivation",
    name: "Alimentación por Hongos",
    description: "Desbloquea la granja de hongos para producir comida",
    category: "biology",
    cost: { food: 200, dirt: 100, wood: 150 },
    researchTime: 10 * 60 * 1000,
    prerequisites: [], // Se desbloqueará automáticamente al construir granero
    effects: { newBuildings: ["mushroom_farm"] },
  },

  // Nueva tecnología para hormigas cultivadoras
  specializedCultivators: {
    id: "specializedCultivators",
    name: "Cultivadoras Especializadas",
    description: "Permite entrenar hormigas especializadas en cultivo de hongos",
    category: "biology",
    cost: { food: 300, dirt: 150, wood: 200 },
    researchTime: 12 * 60 * 1000,
    prerequisites: ["mushroomCultivation"],
    effects: { newUnits: ["cultivator"] },
  },

  // Exploración
  scoutTraining: {
    id: "scoutTraining",
    name: "Entrenamiento de Exploradoras",
    description: "Las expediciones son 20% más rápidas y eficientes",
    category: "exploration",
    cost: { food: 80, dirt: 60, wood: 120 },
    researchTime: 4 * 60 * 1000,
    prerequisites: [],
    effects: { explorationSpeedBonus: 0.2, explorationEfficiencyBonus: 0.2 },
  },

  // Militar
  soldierCaste: {
    id: "soldierCaste",
    name: "Casta de Soldados",
    description: "Desbloquea hormigas soldado",
    category: "military",
    cost: { food: 120, dirt: 100, wood: 80 },
    researchTime: 8 * 60 * 1000,
    prerequisites: [],
    effects: { newUnits: ["soldier"] },
  },

  // Nueva tecnología para expandir guarderías
  expandedNurseries: {
    id: "expandedNurseries",
    name: "Guarderías Expandidas",
    description: "Permite construir hasta 3 guarderías",
    category: "biology",
    cost: { food: 200, dirt: 150, wood: 100 },
    researchTime: 10 * 60 * 1000,
    prerequisites: ["rapidDevelopment"],
    effects: { maxNurseriesBonus: 2 }, // Aumenta el límite a 3
  },
}

interface TechnologyTreeProps {
  researchedTechs: string[]
  currentResearch: { techId: string; startTime: number; endTime: number } | null
  resources: { food: number; dirt: number; wood: number }
  onStartResearch: (techId: string) => void
  currentTime: number
  hasGranary: boolean // Nueva prop para saber si tiene granero
}

export default function TechnologyTree({
  researchedTechs,
  currentResearch,
  resources,
  onStartResearch,
  currentTime,
  hasGranary,
}: TechnologyTreeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("biology")

  const canResearch = (tech: Technology) => {
    if (researchedTechs.includes(tech.id)) return false
    if (currentResearch) return false
    if (resources.food < tech.cost.food) return false
    if (resources.dirt < tech.cost.dirt) return false
    if (resources.wood < tech.cost.wood) return false

    // Verificar prerequisitos
    const hasPrerequisites = tech.prerequisites.every((prereq) => researchedTechs.includes(prereq))

    // Verificar si la tecnología de hongos está disponible
    if (tech.id === "mushroomCultivation" && !hasGranary) {
      return false
    }

    return hasPrerequisites
  }

  const getResearchProgress = () => {
    if (!currentResearch) return 0
    const elapsed = currentTime - currentResearch.startTime
    const total = currentResearch.endTime - currentResearch.startTime
    return Math.min(100, (elapsed / total) * 100)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000))
    const seconds = Math.floor((ms % (60 * 1000)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const categories = [
    { id: "biology", name: "Biología", icon: Clock, color: "bg-green-100 border-green-300" },
    { id: "engineering", name: "Ingeniería", icon: Building, color: "bg-blue-100 border-blue-300" },
    { id: "exploration", name: "Exploración", icon: Zap, color: "bg-yellow-100 border-yellow-300" },
    { id: "military", name: "Militar", icon: Users, color: "bg-red-100 border-red-300" },
  ]

  const techsByCategory = Object.values(TECHNOLOGIES).reduce(
    (acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = []
      acc[tech.category].push(tech)
      return acc
    },
    {} as Record<string, Technology[]>,
  )

  return (
    <div className="space-y-4">
      {/* Investigación Actual */}
      {currentResearch && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Investigando: {TECHNOLOGIES[currentResearch.techId]?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getResearchProgress()} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              Tiempo restante: {formatTime(currentResearch.endTime - currentTime)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorías */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techsByCategory[category.id]?.map((tech) => {
                const isResearched = researchedTechs.includes(tech.id)
                const canStart = canResearch(tech)
                const isBlocked = tech.prerequisites.some((prereq) => !researchedTechs.includes(prereq))
                const needsGranary = tech.id === "mushroomCultivation" && !hasGranary

                return (
                  <Card key={tech.id} className={`${category.color} ${isResearched ? "opacity-75" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {tech.id === "specializedCultivators" && "🍄"}
                          {tech.name}
                        </CardTitle>
                        {isResearched && <Badge variant="secondary">✓</Badge>}
                        {needsGranary && <Badge variant="destructive">Requiere Granero</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">{tech.description}</p>

                      <div className="space-y-2">
                        <div className="text-xs">
                          <strong>Costo:</strong> {tech.cost.food}🍯 {tech.cost.dirt}🟤 {tech.cost.wood}🪵
                        </div>
                        <div className="text-xs">
                          <strong>Tiempo:</strong> {formatTime(tech.researchTime)}
                        </div>

                        {tech.prerequisites.length > 0 && (
                          <div className="text-xs">
                            <strong>Requiere:</strong>{" "}
                            {tech.prerequisites.map((prereq) => TECHNOLOGIES[prereq]?.name).join(", ")}
                          </div>
                        )}

                        {needsGranary && (
                          <div className="text-xs text-red-600">
                            <strong>Especial:</strong> Construye un granero para desbloquear
                          </div>
                        )}

                        {tech.id === "specializedCultivators" && (
                          <div className="text-xs text-green-600">
                            <strong>Desbloquea:</strong> Hormigas cultivadoras especializadas
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-3"
                        disabled={!canStart || isResearched}
                        onClick={() => onStartResearch(tech.id)}
                      >
                        {isResearched
                          ? "Investigado"
                          : needsGranary
                            ? "Requiere Granero"
                            : isBlocked
                              ? "Bloqueado"
                              : !canStart
                                ? "Sin recursos"
                                : "Investigar"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
