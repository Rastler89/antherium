"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, Plus } from "lucide-react"
import { Crown } from "lucide-react"

export interface Chamber {
  id: string
  type:
    | "royal"
    | "nursery"
    | "storage"
    | "barracks"
    | "laboratory"
    | "warehouse"
    | "granary"
    | "dining"
    | "mushroom_farm"
  level: number
  tunnels: number // Número de túneles que tiene esta cámara
  connectedChambers: string[] // IDs de cámaras conectadas a través de túneles
}

export const CHAMBER_INFO = {
  royal: {
    name: "Cámara Real",
    icon: "👑",
    description: "El corazón del hormiguero donde reside la reina",
    benefits: (level: number) => `Desbloquea construcciones nivel ${level}`,
    baseTunnels: 3, // La cámara real empieza con más túneles
    maxCount: 1,
    requiresRoyalLevel: 0,
    canAddTunnels: false, // NO se pueden agregar túneles a la cámara real
    allowedConnections: ["barracks", "dining", "warehouse"], // Solo puede conectar a estas
  },
  nursery: {
    name: "Guardería",
    icon: "🍼",
    description: "Permite criar huevos y larvas",
    benefits: (level: number) => `Capacidad: ${level * 5} huevos/larvas`, // Reducido de 10 a 5
    baseTunnels: 1,
    maxCount: 1, // Se puede aumentar con tecnología
    requiresRoyalLevel: 1,
    canAddTunnels: true,
    allowedConnections: ["royal", "nursery"], // Solo puede conectar a cámara real u otras guarderías
  },
  dining: {
    name: "Comedor",
    icon: "🍽️",
    description: "Lugar donde las hormigas se alimentan",
    benefits: (level: number) => `Eficiencia alimentaria +${level * 10}%`,
    baseTunnels: 2,
    maxCount: 1,
    requiresRoyalLevel: 2,
    canAddTunnels: true,
    allowedConnections: ["royal", "granary"], // Solo puede conectar a cámara real y granero
  },
  storage: {
    name: "Almacén General",
    icon: "📦",
    description: "Almacena recursos básicos",
    benefits: (level: number) => `Capacidad: ${level * 100} recursos`,
    baseTunnels: 1,
    maxCount: 3,
    requiresRoyalLevel: 2,
    canAddTunnels: true,
    allowedConnections: ["royal"], // Solo puede conectar a cámara real
  },
  warehouse: {
    name: "Almacén",
    icon: "🏪",
    description: "Almacena tierra y madera",
    benefits: (level: number) => `Capacidad: ${level * 200} tierra/madera`,
    baseTunnels: 1,
    maxCount: 2,
    requiresRoyalLevel: 2,
    canAddTunnels: true,
    allowedConnections: ["royal"], // Solo puede conectar a cámara real
  },
  granary: {
    name: "Granero",
    icon: "🌾",
    description: "Almacena comida",
    benefits: (level: number) => `Capacidad: ${level * 300} comida`,
    baseTunnels: 1,
    maxCount: 2,
    requiresRoyalLevel: 2,
    canAddTunnels: true,
    allowedConnections: ["dining"], // Solo puede conectar al comedor
  },
  laboratory: {
    name: "Laboratorio",
    icon: "🔬",
    description: "Investiga tecnologías",
    benefits: (level: number) => `Velocidad investigación +${level * 15}%`,
    baseTunnels: 1,
    maxCount: 1,
    requiresRoyalLevel: 3,
    canAddTunnels: true,
    allowedConnections: ["royal"], // Solo puede conectar a cámara real
  },
  barracks: {
    name: "Cuartel",
    icon: "⚔️",
    description: "Entrena hormigas soldado",
    benefits: (level: number) => `Entrena ${level} soldados simultáneamente`,
    baseTunnels: 2, // Los cuarteles necesitan más túneles para movimiento
    maxCount: 2,
    requiresRoyalLevel: 4,
    canAddTunnels: true,
    allowedConnections: ["royal"], // Solo puede conectar a cámara real
  },
  mushroom_farm: {
    name: "Granja de Hongos",
    icon: "🍄",
    description: "Cultiva hongos para alimentar la colonia",
    benefits: (level: number) => `Convierte ${level * 1.05} hojas/min en comida`,
    baseTunnels: 1,
    maxCount: 1, // Solo una permitida
    requiresRoyalLevel: 3,
    canAddTunnels: true,
    allowedConnections: ["dining"], // Solo puede conectar al comedor
  },
}

export const CHAMBER_COSTS = {
  // Costos base para construir
  build: {
    royal: { food: 200, dirt: 300, wood: 150, ants: 10 },
    nursery: { food: 10, dirt: 20, ants: 2 },
    dining: { food: 25, dirt: 30, wood: 15, ants: 3 },
    storage: { food: 5, dirt: 30, wood: 10, ants: 3 },
    barracks: { food: 15, dirt: 25, wood: 15, ants: 4 },
    laboratory: { food: 50, dirt: 100, wood: 75, ants: 5 },
    warehouse: { food: 20, dirt: 80, wood: 60, ants: 4 },
    granary: { food: 30, dirt: 50, wood: 40, ants: 3 },
    mushroom_farm: { food: 40, dirt: 60, wood: 80, leaves: 20, ants: 4 }, // Requiere hojas
  },
  // Costo para agregar un túnel a una cámara
  tunnel: { dirt: 10, wood: 3, ants: 1 },
  // Multiplicador de costo por nivel - La Cámara Real es mucho más costosa
  upgrade: (baseCost: any, level: number, chamberType: string) => {
    const multiplier = chamberType === "royal" ? level * 2.5 : level * 1.5
    return {
      food: Math.floor((baseCost.food || 0) * multiplier),
      dirt: Math.floor((baseCost.dirt || 0) * multiplier),
      wood: Math.floor((baseCost.wood || 0) * multiplier),
      leaves: Math.floor((baseCost.leaves || 0) * multiplier),
      ants: Math.floor(baseCost.ants * (chamberType === "royal" ? level * 2 : level * 1.2)),
    }
  },
}

interface ChamberUpgradeProps {
  chamber: Chamber
  resources: { food: number; dirt: number; wood: number; leaves: number }
  availableAnts: number
  onUpgrade: (chamberId: string) => void
  onAddTunnel: (chamberId: string) => void
  royalLevel: number
}

export default function ChamberUpgrade({
  chamber,
  resources,
  availableAnts,
  onUpgrade,
  onAddTunnel,
  royalLevel,
}: ChamberUpgradeProps) {
  const info = CHAMBER_INFO[chamber.type]
  const baseCost = CHAMBER_COSTS.build[chamber.type]
  const upgradeCost = CHAMBER_COSTS.upgrade(baseCost, chamber.level + 1, chamber.type)
  const tunnelCost = CHAMBER_COSTS.tunnel

  const canUpgrade = () => {
    return (
      resources.food >= (upgradeCost.food || 0) &&
      resources.dirt >= (upgradeCost.dirt || 0) &&
      resources.wood >= (upgradeCost.wood || 0) &&
      resources.leaves >= (upgradeCost.leaves || 0) &&
      availableAnts >= upgradeCost.ants &&
      chamber.level < (chamber.type === "royal" ? 10 : 5)
    )
  }

  const canAddTunnel = () => {
    return (
      info.canAddTunnels &&
      resources.dirt >= tunnelCost.dirt &&
      resources.wood >= tunnelCost.wood &&
      availableAnts >= tunnelCost.ants &&
      chamber.tunnels < 8 // Máximo 8 túneles por cámara
    )
  }

  const getFreeTunnels = () => {
    return chamber.tunnels - chamber.connectedChambers.length
  }

  const maxLevel = chamber.type === "royal" ? 10 : 5

  return (
    <Card
      className={`${chamber.type === "royal" ? "bg-purple-100 border-2 border-purple-400" : chamber.type === "mushroom_farm" ? "bg-green-100 border-2 border-green-400" : "bg-amber-100 border-2 border-amber-300"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-lg">{info.icon}</span>
            {info.name}
            {chamber.type === "royal" && <Crown className="h-4 w-4 text-purple-600" />}
          </CardTitle>
          <Badge variant={chamber.type === "royal" ? "default" : "secondary"}>Nivel {chamber.level}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
        <p className="text-xs font-medium mb-2">{info.benefits(chamber.level)}</p>

        {/* Información de túneles */}
        <div className="bg-white/50 rounded p-2 mb-3">
          <div className="text-xs font-medium mb-1">🕳️ Túneles: {chamber.tunnels}</div>
          <div className="text-xs text-muted-foreground">
            Libres: {getFreeTunnels()} | Conectados: {chamber.connectedChambers.length}
          </div>
          {!info.canAddTunnels && <div className="text-xs text-red-600 mt-1">No se pueden agregar túneles</div>}
        </div>

        <div className="space-y-2">
          {/* Botón para mejorar nivel */}
          {chamber.level < maxLevel && (
            <div>
              <div className="text-xs mb-1">
                <strong>Mejorar a nivel {chamber.level + 1}:</strong>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {upgradeCost.food > 0 && `${upgradeCost.food}🍯 `}
                {upgradeCost.dirt > 0 && `${upgradeCost.dirt}🟤 `}
                {upgradeCost.wood > 0 && `${upgradeCost.wood}🪵 `}
                {upgradeCost.leaves > 0 && `${upgradeCost.leaves}🍃 `}
                {upgradeCost.ants}🐜
              </div>
              <Button size="sm" className="w-full mb-2" disabled={!canUpgrade()} onClick={() => onUpgrade(chamber.id)}>
                <ArrowUp className="h-3 w-3 mr-1" />
                Mejorar Nivel
              </Button>
            </div>
          )}

          {/* Botón para agregar túnel */}
          {info.canAddTunnels && chamber.tunnels < 8 && (
            <div>
              <div className="text-xs mb-1">
                <strong>Agregar túnel:</strong>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {tunnelCost.dirt}🟤 {tunnelCost.wood}🪵 {tunnelCost.ants}🐜
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={!canAddTunnel()}
                onClick={() => onAddTunnel(chamber.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar Túnel
              </Button>
            </div>
          )}

          {chamber.level >= maxLevel && (!info.canAddTunnels || chamber.tunnels >= 8) && (
            <Badge variant="outline" className="w-full justify-center">
              Completamente Desarrollada
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
