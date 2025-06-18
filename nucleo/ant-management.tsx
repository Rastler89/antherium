"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bug, Users, Sword, Sprout, Baby } from "lucide-react"

export interface Ant {
  id: string
  type: "worker" | "soldier" | "cultivator"
  status: "idle" | "working" | "building" | "assigned"
  assignment?: string // ID de la cámara asignada
  experience: number
}

export interface Chamber {
  id: string
  type: string
  level: number
  assignedAnts: string[] // IDs de hormigas asignadas
}

interface AntManagementProps {
  ants: Ant[]
  chambers: Chamber[]
  larvae: Array<{ id: string; evolveTime: number }>
  currentTime: number
  researchedTechs: string[]
  onEvolveToType: (larvaId: string, antType: "worker" | "soldier" | "cultivator") => void
  onAssignAnt: (antId: string, chamberId: string | null) => void
}

const ANT_INFO = {
  worker: {
    name: "Obrera",
    icon: "🐜",
    description: "Hormiga versátil para construcción y exploración",
    color: "bg-amber-100 border-amber-300",
    abilities: ["Construcción", "Exploración", "Recolección"],
  },
  soldier: {
    name: "Soldado",
    icon: "⚔️",
    description: "Hormiga especializada en combate y defensa",
    color: "bg-red-100 border-red-300",
    abilities: ["Combate", "Defensa", "Patrullaje"],
  },
  cultivator: {
    name: "Cultivadora",
    icon: "🍄",
    description: "Hormiga especializada en cultivo de hongos",
    color: "bg-green-100 border-green-300",
    abilities: ["Cultivo de Hongos", "Botánica", "Fermentación"],
  },
}

const STATUS_INFO = {
  idle: { name: "Libre", color: "bg-gray-100", icon: "⭕" },
  working: { name: "Trabajando", color: "bg-blue-100", icon: "🔄" },
  building: { name: "Construyendo", color: "bg-orange-100", icon: "🏗️" },
  assigned: { name: "Asignada", color: "bg-green-100", icon: "📍" },
}

export default function AntManagement({
  ants,
  chambers,
  larvae,
  currentTime,
  researchedTechs,
  onEvolveToType,
  onAssignAnt,
}: AntManagementProps) {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedLarva, setSelectedLarva] = useState<string | null>(null)

  const canCreateSoldiers = researchedTechs.includes("soldierCaste")
  const canCreateCultivators = researchedTechs.includes("specializedCultivators")

  const getAntsByType = (type: "worker" | "soldier" | "cultivator") => {
    return ants.filter((ant) => ant.type === type)
  }

  const getAvailableAnts = () => {
    return ants.filter((ant) => ant.status === "idle")
  }

  const getMushroomFarms = () => {
    return chambers.filter((chamber) => chamber.type === "mushroom_farm")
  }

  const formatTimeLeft = (evolveTime: number) => {
    const timeLeft = Math.max(0, evolveTime - currentTime)
    const minutes = Math.floor(timeLeft / (60 * 1000))
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getEvolutionProgress = (evolveTime: number) => {
    const totalTime = 7 * 60 * 1000 // 7 minutos
    const elapsed = totalTime - (evolveTime - currentTime)
    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Hormigas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {Object.entries(ANT_INFO).map(([type, info]) => {
              const count = getAntsByType(type as any).length
              const available = getAntsByType(type as any).filter((ant) => ant.status === "idle").length
              return (
                <Card key={type} className={info.color}>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{info.icon}</div>
                      <div className="font-medium text-sm">{info.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Total: {count} | Libres: {available}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="evolution">Evolución</TabsTrigger>
              <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(ANT_INFO).map(([type, info]) => {
                  const antsOfType = getAntsByType(type as any)
                  return (
                    <Card key={type} className={info.color}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="text-lg">{info.icon}</span>
                          {info.name}s ({antsOfType.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Habilidades:</div>
                          {info.abilities.map((ability) => (
                            <Badge key={ability} variant="outline" className="text-xs mr-1">
                              {ability}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 text-xs">
                          {Object.entries(STATUS_INFO).map(([status, statusInfo]) => {
                            const count = antsOfType.filter((ant) => ant.status === status).length
                            if (count === 0) return null
                            return (
                              <div key={status} className="flex justify-between">
                                <span>{statusInfo.name}:</span>
                                <span>{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="evolution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Larvas Listas para Evolucionar</CardTitle>
                </CardHeader>
                <CardContent>
                  {larvae.length > 0 ? (
                    <div className="space-y-3">
                      {larvae.map((larva) => {
                        const timeLeft = larva.evolveTime - currentTime
                        const isReady = timeLeft <= 0
                        return (
                          <div key={larva.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <Baby className="h-4 w-4" />
                                <span className="text-sm font-medium">Larva {larva.id.slice(-4)}</span>
                              </div>
                              <div className="text-xs">
                                {isReady ? "¡Lista!" : `${formatTimeLeft(larva.evolveTime)}`}
                              </div>
                            </div>

                            {!isReady && (
                              <Progress value={getEvolutionProgress(larva.evolveTime)} className="h-2 mb-3" />
                            )}

                            {isReady && (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">Selecciona el tipo de hormiga:</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEvolveToType(larva.id, "worker")}
                                    className="flex items-center gap-2"
                                  >
                                    <Bug className="h-3 w-3" />
                                    Obrera
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!canCreateSoldiers}
                                    onClick={() => onEvolveToType(larva.id, "soldier")}
                                    className="flex items-center gap-2"
                                  >
                                    <Sword className="h-3 w-3" />
                                    Soldado
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!canCreateCultivators}
                                    onClick={() => onEvolveToType(larva.id, "cultivator")}
                                    className="flex items-center gap-2"
                                  >
                                    <Sprout className="h-3 w-3" />
                                    Cultivadora
                                  </Button>
                                </div>
                                {!canCreateSoldiers && (
                                  <div className="text-xs text-red-600">
                                    Investiga "Casta de Soldados" para crear soldados
                                  </div>
                                )}
                                {!canCreateCultivators && (
                                  <div className="text-xs text-red-600">
                                    Investiga "Cultivadoras Especializadas" para crear cultivadoras
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">No hay larvas evolucionando</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Asignaciones de Cultivadoras</CardTitle>
                </CardHeader>
                <CardContent>
                  {getMushroomFarms().length > 0 ? (
                    <div className="space-y-4">
                      {getMushroomFarms().map((farm) => {
                        const assignedCultivators = ants.filter(
                          (ant) => ant.type === "cultivator" && ant.assignment === farm.id,
                        )
                        const availableCultivators = ants.filter(
                          (ant) => ant.type === "cultivator" && ant.status === "idle",
                        )

                        return (
                          <div key={farm.id} className="border rounded-lg p-3 bg-green-50">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h4 className="font-medium text-sm">🍄 Granja de Hongos (Nivel {farm.level})</h4>
                                <div className="text-xs text-muted-foreground">
                                  Cultivadoras asignadas: {assignedCultivators.length}
                                </div>
                              </div>
                              <div className="text-xs">
                                Eficiencia: {assignedCultivators.length > 0 ? "+" : ""}
                                {assignedCultivators.length * 25}%
                              </div>
                            </div>

                            <div className="space-y-2">
                              {assignedCultivators.map((ant) => (
                                <div key={ant.id} className="flex justify-between items-center text-xs">
                                  <span>🍄 Cultivadora {ant.id.slice(-4)}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onAssignAnt(ant.id, null)}
                                    className="h-6 px-2"
                                  >
                                    Liberar
                                  </Button>
                                </div>
                              ))}

                              {availableCultivators.length > 0 && (
                                <div className="pt-2 border-t">
                                  <div className="text-xs text-muted-foreground mb-2">Asignar cultivadora:</div>
                                  <Select onValueChange={(antId) => onAssignAnt(antId, farm.id)}>
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Seleccionar cultivadora..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableCultivators.map((ant) => (
                                        <SelectItem key={ant.id} value={ant.id}>
                                          🍄 Cultivadora {ant.id.slice(-4)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Construye una granja de hongos para asignar cultivadoras
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de hormigas disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hormigas Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(ANT_INFO).map(([type, info]) => {
                      const availableAnts = ants.filter((ant) => ant.type === type && ant.status === "idle")
                      return (
                        <div key={type} className={`${info.color} rounded-lg p-3`}>
                          <div className="text-center">
                            <div className="text-lg mb-1">{info.icon}</div>
                            <div className="text-sm font-medium">{info.name}s Libres</div>
                            <div className="text-lg font-bold">{availableAnts.length}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
