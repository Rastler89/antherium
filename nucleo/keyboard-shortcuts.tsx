"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Keyboard, Zap, Home, TreePine, Users, Settings } from "lucide-react"

export interface KeyboardShortcuts {
  // Navegación
  switchToAnthill: string
  switchToAnts: string
  switchToOutside: string
  switchToTechnology: string

  // Acciones rápidas
  quickSave: string
  openSettings: string
  openTutorial: string

  // Construcción
  buildNursery: string
  buildLaboratory: string
  buildWarehouse: string
  buildGranary: string

  // Expediciones
  sendFoodExpedition: string
  sendDirtExpedition: string
  sendWoodExpedition: string
  sendLeavesExpedition: string

  // Gestión de hormigas
  evolveAllToWorkers: string
  evolveAllToSoldiers: string
  evolveAllToCultivators: string

  // Cámaras
  upgradeRoyalChamber: string
  upgradeAllNurseries: string
}

const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  // Navegación (1-4)
  switchToAnthill: "1",
  switchToAnts: "2",
  switchToOutside: "3",
  switchToTechnology: "4",

  // Acciones rápidas
  quickSave: "shift+s",
  openSettings: "c", // configuración
  openTutorial: "h", // help

  // Construcción (q, w, e, r)
  buildNursery: "q",
  buildLaboratory: "w",
  buildWarehouse: "e",
  buildGranary: "r",

  // Expediciones (a, s, d, f)
  sendFoodExpedition: "a",
  sendDirtExpedition: "s",
  sendWoodExpedition: "d",
  sendLeavesExpedition: "f",

  // Gestión de hormigas (z, x, c)
  evolveAllToWorkers: "z",
  evolveAllToSoldiers: "x",
  evolveAllToCultivators: "v",

  // Cámaras (shift + teclas)
  upgradeRoyalChamber: "shift+r",
  upgradeAllNurseries: "shift+n",
}

const SHORTCUT_CATEGORIES = {
  navigation: {
    name: "Navegación",
    icon: Home,
    shortcuts: [
      { key: "switchToAnthill", name: "Ir a Hormiguero", description: "Cambia a la vista del hormiguero" },
      { key: "switchToAnts", name: "Ir a Hormigas", description: "Cambia a la gestión de hormigas" },
      { key: "switchToOutside", name: "Ir a Exterior", description: "Cambia a las expediciones" },
      { key: "switchToTechnology", name: "Ir a Tecnología", description: "Cambia al árbol tecnológico" },
    ],
  },
  actions: {
    name: "Acciones Rápidas",
    icon: Zap,
    shortcuts: [
      { key: "quickSave", name: "Guardado Rápido", description: "Guarda el juego inmediatamente" },
      { key: "openSettings", name: "Abrir Configuración", description: "Abre el panel de configuración" },
      { key: "openTutorial", name: "Abrir Tutorial", description: "Abre la guía del juego" },
    ],
  },
  construction: {
    name: "Construcción",
    icon: Home,
    shortcuts: [
      { key: "buildNursery", name: "Construir Guardería", description: "Construye una guardería si es posible" },
      { key: "buildLaboratory", name: "Construir Laboratorio", description: "Construye un laboratorio si es posible" },
      { key: "buildWarehouse", name: "Construir Almacén", description: "Construye un almacén si es posible" },
      { key: "buildGranary", name: "Construir Granero", description: "Construye un granero si es posible" },
    ],
  },
  expeditions: {
    name: "Expediciones",
    icon: TreePine,
    shortcuts: [
      { key: "sendFoodExpedition", name: "Expedición de Comida", description: "Envía 1 hormiga por comida" },
      { key: "sendDirtExpedition", name: "Expedición de Tierra", description: "Envía 1 hormiga por tierra" },
      { key: "sendWoodExpedition", name: "Expedición de Madera", description: "Envía 1 hormiga por madera" },
      { key: "sendLeavesExpedition", name: "Expedición de Hojas", description: "Envía 1 hormiga por hojas" },
    ],
  },
  ants: {
    name: "Gestión de Hormigas",
    icon: Users,
    shortcuts: [
      {
        key: "evolveAllToWorkers",
        name: "Evolucionar a Obreras",
        description: "Evoluciona todas las larvas listas a obreras",
      },
      {
        key: "evolveAllToSoldiers",
        name: "Evolucionar a Soldados",
        description: "Evoluciona todas las larvas listas a soldados",
      },
      {
        key: "evolveAllToCultivators",
        name: "Evolucionar a Cultivadoras",
        description: "Evoluciona todas las larvas listas a cultivadoras",
      },
    ],
  },
  chambers: {
    name: "Mejoras de Cámaras",
    icon: Settings,
    shortcuts: [
      { key: "upgradeRoyalChamber", name: "Mejorar Cámara Real", description: "Mejora la cámara real si es posible" },
      { key: "upgradeAllNurseries", name: "Mejorar Guarderías", description: "Mejora todas las guarderías posibles" },
    ],
  },
}

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcuts
  onShortcutsChange: (shortcuts: KeyboardShortcuts) => void
}

export default function KeyboardShortcutsModal({ shortcuts, onShortcutsChange }: KeyboardShortcutsModalProps) {
  const [open, setOpen] = useState(false)
  const [tempShortcuts, setTempShortcuts] = useState<KeyboardShortcuts>(shortcuts)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  useEffect(() => {
    setTempShortcuts(shortcuts)
  }, [shortcuts])

  const handleSave = () => {
    onShortcutsChange(tempShortcuts)
    setOpen(false)
  }

  const handleReset = () => {
    setTempShortcuts(DEFAULT_SHORTCUTS)
  }

  const updateShortcut = (key: keyof KeyboardShortcuts, value: string) => {
    setTempShortcuts((prev) => ({ ...prev, [key]: value.toLowerCase() }))
  }

  const handleKeyCapture = (e: React.KeyboardEvent, shortcutKey: keyof KeyboardShortcuts) => {
    e.preventDefault()

    const keys = []
    if (e.ctrlKey) keys.push("ctrl")
    if (e.altKey) keys.push("alt")
    if (e.shiftKey) keys.push("shift")

    const key = e.key.toLowerCase()
    if (key !== "control" && key !== "alt" && key !== "shift") {
      keys.push(key)
    }

    const shortcut = keys.join("+")
    updateShortcut(shortcutKey, shortcut)
    setEditingKey(null)
  }

  const formatShortcut = (shortcut: string) => {
    return shortcut
      .split("+")
      .map((key) => {
        switch (key) {
          case "ctrl":
            return "Ctrl"
          case "alt":
            return "Alt"
          case "shift":
            return "Shift"
          case " ":
            return "Space"
          case "arrowup":
            return "↑"
          case "arrowdown":
            return "↓"
          case "arrowleft":
            return "←"
          case "arrowright":
            return "→"
          default:
            return key.toUpperCase()
        }
      })
      .join(" + ")
  }

  const isConflict = (currentKey: keyof KeyboardShortcuts, value: string) => {
    return Object.entries(tempShortcuts).some(
      ([key, shortcut]) => key !== currentKey && shortcut === value && value !== "",
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
          <Keyboard className="h-4 w-4 mr-2" />
          Atajos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atajos de Teclado
          </DialogTitle>
          <DialogDescription>
            Configura teclas rápidas para acciones comunes. Haz clic en un campo y presiona la combinación deseada.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="navigation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {Object.entries(SHORTCUT_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(SHORTCUT_CATEGORIES).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.shortcuts.map((shortcut) => {
                      const currentValue = tempShortcuts[shortcut.key as keyof KeyboardShortcuts]
                      const hasConflict = isConflict(shortcut.key as keyof KeyboardShortcuts, currentValue)

                      return (
                        <div key={shortcut.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{shortcut.name}</div>
                            <div className="text-xs text-muted-foreground">{shortcut.description}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasConflict && (
                              <Badge variant="destructive" className="text-xs">
                                Conflicto
                              </Badge>
                            )}

                            <div className="relative">
                              <Input
                                value={
                                  editingKey === shortcut.key ? "Presiona una tecla..." : formatShortcut(currentValue)
                                }
                                readOnly
                                onClick={() => setEditingKey(shortcut.key)}
                                onKeyDown={(e) => handleKeyCapture(e, shortcut.key as keyof KeyboardShortcuts)}
                                onBlur={() => setEditingKey(null)}
                                className={`w-32 text-center cursor-pointer ${
                                  hasConflict ? "border-red-300 bg-red-50" : ""
                                } ${editingKey === shortcut.key ? "border-blue-300 bg-blue-50" : ""}`}
                                placeholder="Sin asignar"
                              />
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateShortcut(shortcut.key as keyof KeyboardShortcuts, "")}
                              className="text-xs"
                            >
                              Limpiar
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Guía rápida */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">Guía Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="font-medium">Navegación:</div>
                <div className="text-muted-foreground">1-4 para cambiar pestañas</div>
              </div>
              <div>
                <div className="font-medium">Construcción:</div>
                <div className="text-muted-foreground">Q, W, E, R para construir</div>
              </div>
              <div>
                <div className="font-medium">Expediciones:</div>
                <div className="text-muted-foreground">A, S, D, F para enviar</div>
              </div>
              <div>
                <div className="font-medium">Evolución:</div>
                <div className="text-muted-foreground">Z, X, V para evolucionar</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Restaurar por defecto
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Atajos</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook para manejar los atajos de teclado
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcuts,
  actions: {
    switchToAnthill: () => void
    switchToAnts: () => void
    switchToOutside: () => void
    switchToTechnology: () => void
    quickSave: () => void
    openSettings: () => void
    openTutorial: () => void
    buildNursery: () => void
    buildLaboratory: () => void
    buildWarehouse: () => void
    buildGranary: () => void
    sendFoodExpedition: () => void
    sendDirtExpedition: () => void
    sendWoodExpedition: () => void
    sendLeavesExpedition: () => void
    evolveAllToWorkers: () => void
    evolveAllToSoldiers: () => void
    evolveAllToCultivators: () => void
    upgradeRoyalChamber: () => void
    upgradeAllNurseries: () => void
  },
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No procesar si estamos escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const keys = []
      if (e.ctrlKey) keys.push("ctrl")
      if (e.altKey) keys.push("alt")
      if (e.shiftKey) keys.push("shift")
      keys.push(e.key.toLowerCase())

      const pressedShortcut = keys.join("+")

      // Buscar qué acción corresponde a este atajo
      const actionKey = Object.entries(shortcuts).find(([_, shortcut]) => shortcut === pressedShortcut)?.[0]

      if (actionKey && actions[actionKey as keyof typeof actions]) {
        e.preventDefault()
        actions[actionKey as keyof typeof actions]()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, actions])
}

// Función para cargar atajos desde localStorage
export const loadKeyboardShortcuts = (): KeyboardShortcuts => {
  try {
    const saved = localStorage.getItem("ant-game-shortcuts")
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SHORTCUTS, ...parsed }
    }
  } catch (error) {
    console.error("Error loading shortcuts:", error)
  }
  return DEFAULT_SHORTCUTS
}

// Función para guardar atajos en localStorage
export const saveKeyboardShortcuts = (shortcuts: KeyboardShortcuts): void => {
  try {
    localStorage.setItem("ant-game-shortcuts", JSON.stringify(shortcuts))
  } catch (error) {
    console.error("Error saving shortcuts:", error)
  }
}

export { DEFAULT_SHORTCUTS }
