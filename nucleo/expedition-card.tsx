"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pickaxe } from "lucide-react"

interface ExpeditionCardProps {
  resourceType: "food" | "dirt" | "wood" | "leaves"
  onStartExpedition: (resourceType: "food" | "dirt" | "wood" | "leaves", antsCount: number) => void
  availableAnts: number
}

const RESOURCE_INFO = {
  food: {
    icon: "🍯",
    name: "Comida",
    description: "Buscar frutas y néctar",
    color: "bg-green-50 border-green-200",
    locations: ["Bosque", "Pradera", "Jardín"],
  },
  dirt: {
    icon: "🟤",
    name: "Tierra",
    description: "Excavar y recolectar tierra",
    color: "bg-amber-50 border-amber-200",
    locations: ["Colina", "Cantera", "Monte"],
  },
  wood: {
    icon: "🪵",
    name: "Madera",
    description: "Recolectar ramas y corteza",
    color: "bg-orange-50 border-orange-200",
    locations: ["Bosque", "Arboleda", "Selva"],
  },
  leaves: {
    icon: "🍃",
    name: "Hojas",
    description: "Recolectar hojas caídas",
    color: "bg-emerald-50 border-emerald-200",
    locations: ["Bosque", "Arboleda", "Sendero"],
  },
}

export default function ExpeditionCard({ resourceType, onStartExpedition, availableAnts }: ExpeditionCardProps) {
  const [antsToSend, setAntsToSend] = useState(1)
  const info = RESOURCE_INFO[resourceType]

  const handleStartExpedition = () => {
    if (antsToSend > 0 && antsToSend <= availableAnts) {
      onStartExpedition(resourceType, antsToSend)
      setAntsToSend(1)
    }
  }

  const estimatedResources = Math.floor(antsToSend * 3 * 1.25) // Estimación promedio

  return (
    <Card className={info.color}>
      <CardContent className="pt-4">
        <div className="text-center mb-3">
          <div className="text-3xl mb-1">{info.icon}</div>
          <h3 className="font-medium">{info.name}</h3>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor={`ants-${resourceType}`} className="text-xs">
              Hormigas a enviar
            </Label>
            <Input
              id={`ants-${resourceType}`}
              type="number"
              min="1"
              max={availableAnts}
              value={antsToSend}
              onChange={(e) =>
                setAntsToSend(Math.max(1, Math.min(availableAnts, Number.parseInt(e.target.value) || 1)))
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>Recursos estimados: ~{estimatedResources}</div>
            <div>Tiempo: 2-3 minutos</div>
          </div>

          <Button
            size="sm"
            onClick={handleStartExpedition}
            disabled={availableAnts === 0 || antsToSend > availableAnts}
            className="w-full"
          >
            <Pickaxe className="h-3 w-3 mr-1" />
            Enviar Expedición
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
