"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, X, Crown, Bug, TreePine, Beaker, AlertTriangle, CheckCircle, Info, Home } from "lucide-react"
import { useSoundSystem, type SoundConfig } from "./sound-system"

export interface GameNotification {
  id: string
  type: "success" | "warning" | "info" | "error" | "achievement"
  category: "population" | "resources" | "construction" | "research" | "expedition" | "system" | "achievement"
  title: string
  message: string
  timestamp: number
  duration?: number // en ms, undefined = permanente hasta que se cierre
  icon?: string
  progress?: number // 0-100 para notificaciones con progreso
  actions?: Array<{
    label: string
    action: () => void
    variant?: "default" | "outline" | "destructive"
  }>
  data?: any // datos adicionales para la notificación
}

interface NotificationSystemProps {
  notifications: GameNotification[]
  onDismiss: (id: string) => void
  onDismissAll: () => void
  maxVisible?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  showHistory?: boolean
  soundConfig?: SoundConfig // Nueva prop
}

const NOTIFICATION_ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: AlertTriangle,
  achievement: Crown,
}

const NOTIFICATION_COLORS = {
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  error: "bg-red-50 border-red-200 text-red-800",
  achievement: "bg-purple-50 border-purple-200 text-purple-800",
}

const CATEGORY_ICONS = {
  population: Bug,
  resources: TreePine,
  construction: Home,
  research: Beaker,
  expedition: TreePine,
  system: Info,
  achievement: Crown,
}

export default function NotificationSystem({
  notifications,
  onDismiss,
  onDismissAll,
  maxVisible = 5,
  position = "top-right",
  showHistory = false,
  soundConfig, // Nueva prop
}: NotificationSystemProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null)

  // Agregar sistema de sonidos
  const soundSystem = useSoundSystem(soundConfig || { enabled: false, volume: 0.7, categories: {} as any })

  // Reproducir sonido cuando aparece una nueva notificación
  useEffect(() => {
    if (notifications.length > 0 && soundConfig?.enabled) {
      const latestNotification = notifications[0]

      // Reproducir sonido basado en el tipo de notificación
      switch (latestNotification.type) {
        case "success":
          soundSystem.playNotificationSound("success")
          break
        case "warning":
          soundSystem.playNotificationSound("warning")
          break
        case "error":
          soundSystem.playNotificationSound("error")
          break
        case "info":
          soundSystem.playNotificationSound("info")
          break
        case "achievement":
          soundSystem.playNotificationSound("achievement")
          break
      }
    }
  }, [notifications, soundConfig, soundSystem]) // Updated dependency array

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (60 * 1000))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days}d`
    if (hours > 0) return `hace ${hours}h`
    if (minutes > 0) return `hace ${minutes}m`
    return "ahora"
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4"
      case "bottom-right":
        return "bottom-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      default:
        return "top-4 right-4"
    }
  }

  const visibleNotifications = notifications.slice(0, maxVisible)
  const hasMoreNotifications = notifications.length > maxVisible

  const NotificationCard = ({
    notification,
    isInHistory = false,
  }: { notification: GameNotification; isInHistory?: boolean }) => {
    const IconComponent = NOTIFICATION_ICONS[notification.type]
    const CategoryIcon = CATEGORY_ICONS[notification.category]
    const colorClass = NOTIFICATION_COLORS[notification.type]

    return (
      <Card
        className={`${colorClass} shadow-lg transition-all duration-300 hover:shadow-xl ${
          isInHistory ? "mb-2" : "mb-3"
        } ${hoveredNotification === notification.id ? "scale-105" : ""}`}
        onMouseEnter={() => !isInHistory && setHoveredNotification(notification.id)}
        onMouseLeave={() => !isInHistory && setHoveredNotification(null)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                {notification.icon ? (
                  <span className="text-2xl">{notification.icon}</span>
                ) : (
                  <div className="flex items-center space-x-1">
                    <CategoryIcon className="h-4 w-4" />
                    <IconComponent className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                </div>

                <p className="text-sm opacity-90 mb-2">{notification.message}</p>

                {notification.progress !== undefined && (
                  <div className="mb-2">
                    <Progress value={notification.progress} className="h-2" />
                    <div className="text-xs opacity-75 mt-1">{notification.progress}% completado</div>
                  </div>
                )}

                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.variant || "outline"}
                        onClick={action.action}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="text-xs opacity-60 mt-2">{formatTime(notification.timestamp)}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Notification Container */}
      <div className={`fixed ${getPositionClasses()} z-50 w-80 max-w-sm`}>
        {visibleNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}

        {hasMoreNotifications && (
          <Card className="bg-gray-50 border-gray-200 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">+{notifications.length - maxVisible} más notificaciones</span>
                <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} className="text-xs">
                  Ver todas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notifications.length > 0 && (
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={onDismissAll} className="text-xs">
              Limpiar todas
            </Button>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistory && isHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Historial de Notificaciones ({notifications.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} isInHistory={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay notificaciones</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <Button variant="outline" onClick={onDismissAll} className="w-full">
                    Limpiar todas las notificaciones
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Hook para gestionar notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<GameNotification[]>([])

  const addNotification = useCallback((notification: Omit<GameNotification, "id" | "timestamp">) => {
    const newNotification: GameNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [newNotification, ...prev])
    return newNotification.id
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<GameNotification>) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }, [])

  // Funciones de conveniencia para tipos específicos de notificaciones
  const notifySuccess = useCallback(
    (title: string, message: string, options?: Partial<GameNotification>) => {
      return addNotification({
        type: "success",
        category: "system",
        title,
        message,
        duration: 5000,
        ...options,
      })
    },
    [addNotification],
  )

  const notifyWarning = useCallback(
    (title: string, message: string, options?: Partial<GameNotification>) => {
      return addNotification({
        type: "warning",
        category: "system",
        title,
        message,
        duration: 8000,
        ...options,
      })
    },
    [addNotification],
  )

  const notifyError = useCallback(
    (title: string, message: string, options?: Partial<GameNotification>) => {
      return addNotification({
        type: "error",
        category: "system",
        title,
        message,
        duration: 10000,
        ...options,
      })
    },
    [addNotification],
  )

  const notifyInfo = useCallback(
    (title: string, message: string, options?: Partial<GameNotification>) => {
      return addNotification({
        type: "info",
        category: "system",
        title,
        message,
        duration: 6000,
        ...options,
      })
    },
    [addNotification],
  )

  const notifyAchievement = useCallback(
    (title: string, message: string, options?: Partial<GameNotification>) => {
      return addNotification({
        type: "achievement",
        category: "achievement",
        title,
        message,
        icon: "🏆",
        ...options,
      })
    },
    [addNotification],
  )

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    updateNotification,
    notifySuccess,
    notifyWarning,
    notifyError,
    notifyInfo,
    notifyAchievement,
  }
}

// Funciones de utilidad para crear notificaciones específicas del juego
export const createGameNotifications = (
  addNotification: (notification: Omit<GameNotification, "id" | "timestamp">) => string,
  soundSystem?: ReturnType<typeof useSoundSystem>,
) => ({
  // Notificaciones de población
  eggLaid: () => {
    soundSystem?.playPopulationSound("eggLaid")
    return addNotification({
      type: "info",
      category: "population",
      title: "Nuevo Huevo",
      message: "La reina ha puesto un nuevo huevo",
      icon: "🥚",
      duration: 3000,
    })
  },

  eggHatched: (count: number) => {
    soundSystem?.playPopulationSound("eggHatched")
    return addNotification({
      type: "success",
      category: "population",
      title: "Huevos Eclosionados",
      message: `${count} huevo${count > 1 ? "s" : ""} ha${count > 1 ? "n" : ""} eclosionado en larva${count > 1 ? "s" : ""}`,
      icon: "🐛",
      duration: 4000,
    })
  },

  larvaEvolved: (count: number, type: string) => {
    soundSystem?.playPopulationSound("larvaEvolved")
    return addNotification({
      type: "success",
      category: "population",
      title: "Larvas Evolucionadas",
      message: `${count} larva${count > 1 ? "s" : ""} ha${count > 1 ? "n" : ""} evolucionado a ${type}${count > 1 ? "s" : ""}`,
      icon: type === "worker" ? "🐜" : type === "soldier" ? "⚔️" : "🍄",
      duration: 4000,
    })
  },

  populationLimit: () => {
    soundSystem?.playPopulationSound("populationLimit")
    return addNotification({
      type: "warning",
      category: "population",
      title: "Límite de Población",
      message: "Has alcanzado el límite de población. Mejora las guarderías para aumentar la capacidad",
      icon: "⚠️",
      duration: 8000,
      actions: [
        {
          label: "Ver Guarderías",
          action: () => {},
        },
      ],
    })
  },

  // Continuar con el resto de notificaciones agregando los sonidos correspondientes...

  constructionCompleted: (chamberType: string) => {
    soundSystem?.playConstructionSound("constructionComplete")
    return addNotification({
      type: "success",
      category: "construction",
      title: "Construcción Completada",
      message: `Se ha completado la construcción de ${chamberType}`,
      icon: "🏗️",
      duration: 5000,
    })
  },

  researchCompleted: (techName: string) => {
    soundSystem?.playResearchSound("researchComplete")
    return addNotification({
      type: "success",
      category: "research",
      title: "Investigación Completada",
      message: `Has completado la investigación de ${techName}`,
      icon: "🔬",
      duration: 6000,
    })
  },

  expeditionCompleted: (type: string, amount: number, antsCount: number) => {
    soundSystem?.playExpeditionSound("expeditionComplete")
    return addNotification({
      type: "success",
      category: "expedition",
      title: "Expedición Completada",
      message: `${antsCount} hormiga${antsCount > 1 ? "s" : ""} ha${antsCount > 1 ? "n" : ""} regresado con ${amount} de ${type}`,
      icon: "🎒",
      duration: 5000,
    })
  },

  firstEgg: () => {
    soundSystem?.playAchievementSound("firstEgg")
    return addNotification({
      type: "achievement",
      category: "achievement",
      title: "¡Primer Huevo!",
      message: "La reina ha puesto su primer huevo",
      icon: "🏆",
    })
  },

  firstWorker: () => {
    soundSystem?.playAchievementSound("firstWorker")
    return addNotification({
      type: "achievement",
      category: "achievement",
      title: "¡Primera Obrera!",
      message: "Tu primera hormiga obrera está lista para trabajar",
      icon: "🏆",
    })
  },

  tenAnts: () => {
    soundSystem?.playAchievementSound("milestone")
    return addNotification({
      type: "achievement",
      category: "achievement",
      title: "¡Colonia Establecida!",
      message: "Has alcanzado 10 hormigas en tu colonia",
      icon: "🏆",
    })
  },

  gameSaved: () => {
    soundSystem?.playSystemSound("save")
    return addNotification({
      type: "success",
      category: "system",
      title: "Juego Guardado",
      message: "Tu progreso ha sido guardado correctamente",
      icon: "💾",
      duration: 2000,
    })
  },

  mushroomProduction: (amount: number) => {
    soundSystem?.playProductionSound("mushroomProduction")
    return addNotification({
      type: "info",
      category: "resources",
      title: "Producción de Hongos",
      message: `Tus granjas han producido ${amount} de comida`,
      icon: "🍄",
      duration: 3000,
    })
  },
})
