"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { CHAMBER_INFO, type Chamber } from "./chamber-upgrade"

interface ConstructionRequirementsProps {
  chamberType: keyof typeof CHAMBER_INFO
  chambers: Chamber[]
  royalLevel: number
  researchedTechs: string[]
}

export default function ConstructionRequirements({
  chamberType,
  chambers,
  royalLevel,
  researchedTechs,
}: ConstructionRequirementsProps) {
  const info = CHAMBER_INFO[chamberType]
  const currentCount = chambers.filter((c) => c.type === chamberType).length

  // Calcular túneles libres totales
  const totalFreeTunnels = chambers.reduce((total, chamber) => {
    return total + (chamber.tunnels - chamber.connectedChambers.length)
  }, 0)

  // Calcular límite máximo de nursery basado en tecnología
  const maxNurseries = researchedTechs.includes("expandedNurseries") ? 3 : 1
  const actualMaxCount = chamberType === "nursery" ? maxNurseries : info.maxCount

  const requirements = [
    {
      name: "Nivel de Cámara Real",
      required: info.requiresRoyalLevel,
      current: royalLevel,
      met: royalLevel >= info.requiresRoyalLevel,
    },
    {
      name: "Límite de construcciones",
      required: actualMaxCount,
      current: currentCount,
      met: currentCount < actualMaxCount,
      isLimit: true,
    },
    {
      name: "Túneles libres disponibles",
      required: 1,
      current: totalFreeTunnels,
      met: totalFreeTunnels >= 1,
    },
  ]

  const allRequirementsMet = requirements.every((req) => req.met)

  return (
    <Card className={`${allRequirementsMet ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {allRequirementsMet ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          Requisitos para {info.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span>{req.name}:</span>
              <div className="flex items-center gap-1">
                {req.isLimit ? (
                  <span className={req.met ? "text-green-600" : "text-red-600"}>
                    {req.current}/{req.required}
                  </span>
                ) : (
                  <span className={req.met ? "text-green-600" : "text-red-600"}>
                    {req.current} / {req.required}
                  </span>
                )}
                {req.met ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {!allRequirementsMet && (
          <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
            {totalFreeTunnels < 1
              ? "Necesitas construir más túneles para conectar nuevas cámaras"
              : "No se pueden construir más " + info.name.toLowerCase() + "s"}
          </div>
        )}

        {allRequirementsMet && (
          <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
            ✓ Todos los requisitos cumplidos. Puedes construir esta cámara.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
