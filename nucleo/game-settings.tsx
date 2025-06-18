"use client"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, Volume2, VolumeX, Zap, Clock } from "lucide-react"
import SoundSystemConfig, { type SoundConfig, DEFAULT_SOUND_CONFIG } from "./sound-system"

const DEFAULT_SETTINGS: GameSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 30, // 30 segundos
  gameSpeed: 1.0,
  soundEnabled: true,
  notificationsEnabled: true,
  showDetailedStats: false,
  compactUI: false,
  autoEvolutionDelay: 2, // 2 minutos
  soundConfig: DEFAULT_SOUND_CONFIG, // Agregar configuración de sonidos por defecto
}

const SAVE_INTERVALS = [
  { value: 10, label: "10 segundos", description: "Muy frecuente" },
  { value: 30, label: "30 segundos", description: "Recomendado" },
  { value: 60, label: "1 minuto", description: "Normal" },
  { value: 120, label: "2 minutos", description: "Menos frecuente" },
  { value: 300, label: "5 minutos", description: "Poco frecuente" },
]

const GAME_SPEEDS = [
  { value: 0.5, label: "0.5x", description: "Lento", icon: "🐌" },
  { value: 1.0, label: "1x", description: "Normal", icon: "🐜" },
  { value: 1.5, label: "1.5x", description: "Rápido", icon: "🏃" },
  { value: 2.0, label: "2x", description: "Muy rápido", icon: "⚡" },
]

const EVOLUTION_DELAYS = [
  { value: 0, label: "Inmediata", description: "Sin espera extra" },
  { value: 1, label: "1 minuto", description: "Poco tiempo" },
  { value: 2, label: "2 minutos", description: "Recomendado" },
  { value: 5, label: "5 minutos", description: "Más tiempo" },
  { value: 10, label: "10 minutos", description: "Mucho tiempo" },
]

export default function GameSettingsModal({ settings, onSettingsChange }: GameSettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings)

  useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const handleSave = () => {
    onSettingsChange(tempSettings)
    setOpen(false)
  }

  const handleReset = () => {
    setTempSettings(DEFAULT_SETTINGS)
  }

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }))
  }

  const getIntervalLabel = (seconds: number) => {
    const interval = SAVE_INTERVALS.find((i) => i.value === seconds)
    return interval ? interval.label : `${seconds}s`
  }

  const getSpeedLabel = (speed: number) => {
    const speedOption = GAME_SPEEDS.find((s) => s.value === speed)
    return speedOption ? `${speedOption.icon} ${speedOption.label}` : `${speed}x`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed top-4 right-20 z-50">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Juego
          </DialogTitle>
          <DialogDescription>Personaliza tu experiencia de juego</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guardado Automático */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardado Automático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Guardado automático</Label>
                  <div className="text-xs text-muted-foreground">Guarda automáticamente tu progreso</div>
                </div>
                <Switch
                  id="auto-save"
                  checked={tempSettings.autoSaveEnabled}
                  onCheckedChange={(checked) => updateSetting("autoSaveEnabled", checked)}
                />
              </div>

              {tempSettings.autoSaveEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label>Frecuencia de guardado</Label>
                    <div className="text-xs text-muted-foreground mb-2">
                      Cada {getIntervalLabel(tempSettings.autoSaveInterval)}
                    </div>
                  </div>
                  <Select
                    value={tempSettings.autoSaveInterval.toString()}
                    onValueChange={(value) => updateSetting("autoSaveInterval", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAVE_INTERVALS.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          <div className="flex justify-between items-center w-full">
                            <span>{interval.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {interval.description}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Velocidad del Juego */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Velocidad del Juego
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Velocidad de simulación</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Actual: {getSpeedLabel(tempSettings.gameSpeed)}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GAME_SPEEDS.map((speed) => (
                  <Button
                    key={speed.value}
                    variant={tempSettings.gameSpeed === speed.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting("gameSpeed", speed.value)}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="text-lg">{speed.icon}</span>
                    <span className="text-xs">{speed.label}</span>
                    <span className="text-xs text-muted-foreground">{speed.description}</span>
                  </Button>
                ))}
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Velocidades altas pueden afectar el rendimiento
              </div>
            </CardContent>
          </Card>

          {/* Evolución Automática */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Evolución de Larvas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiempo extra antes de evolución automática</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Las larvas esperan {tempSettings.autoEvolutionDelay} minutos extra antes de evolucionar
                  automáticamente
                </div>
              </div>
              <Select
                value={tempSettings.autoEvolutionDelay.toString()}
                onValueChange={(value) => updateSetting("autoEvolutionDelay", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVOLUTION_DELAYS.map((delay) => (
                    <SelectItem key={delay.value} value={delay.value.toString()}>
                      <div className="flex justify-between items-center w-full">
                        <span>{delay.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {delay.description}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Interfaz y Experiencia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Interfaz y Experiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound">Sonidos</Label>
                  <div className="text-xs text-muted-foreground">Efectos de sonido del juego</div>
                </div>
                <div className="flex items-center gap-2">
                  {tempSettings.soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-red-600" />
                  )}
                  <Switch
                    id="sound"
                    checked={tempSettings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificaciones</Label>
                  <div className="text-xs text-muted-foreground">Alertas de eventos importantes</div>
                </div>
                <Switch
                  id="notifications"
                  checked={tempSettings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSetting("notificationsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detailed-stats">Estadísticas detalladas</Label>
                  <div className="text-xs text-muted-foreground">Mostrar información adicional</div>
                </div>
                <Switch
                  id="detailed-stats"
                  checked={tempSettings.showDetailedStats}
                  onCheckedChange={(checked) => updateSetting("showDetailedStats", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-ui">Interfaz compacta</Label>
                  <div className="text-xs text-muted-foreground">Reduce el espacio entre elementos</div>
                </div>
                <Switch
                  id="compact-ui"
                  checked={tempSettings.compactUI}
                  onCheckedChange={(checked) => updateSetting("compactUI", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Sonidos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Configuración de Sonidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SoundSystemConfig
                config={tempSettings.soundConfig}
                onConfigChange={(soundConfig) => updateSetting("soundConfig", soundConfig)}
              />
            </CardContent>
          </Card>

          {/* Información de Configuración Actual */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Configuración Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium">Guardado:</div>
                  <div className="text-muted-foreground">
                    {tempSettings.autoSaveEnabled ? getIntervalLabel(tempSettings.autoSaveInterval) : "Desactivado"}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Velocidad:</div>
                  <div className="text-muted-foreground">{getSpeedLabel(tempSettings.gameSpeed)}</div>
                </div>
                <div>
                  <div className="font-medium">Evolución:</div>
                  <div className="text-muted-foreground">+{tempSettings.autoEvolutionDelay} min extra</div>
                </div>
                <div>
                  <div className="font-medium">Sonido:</div>
                  <div className="text-muted-foreground">{tempSettings.soundEnabled ? "Activado" : "Desactivado"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Restaurar por defecto
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Configuración</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Función para cargar configuración desde localStorage
export const loadGameSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem("ant-game-settings")
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error("Error loading settings:", error)
  }
  return DEFAULT_SETTINGS
}

// Función para guardar configuración en localStorage
export const saveGameSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem("ant-game-settings", JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving settings:", error)
  }
}

export { DEFAULT_SETTINGS }
