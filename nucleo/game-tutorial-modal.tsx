"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Crown, Home, TreePine, Beaker } from "lucide-react"

export default function GameTutorialModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed top-4 right-4 z-50">
          <HelpCircle className="h-4 w-4 mr-2" />
          ¿Cómo jugar?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">🐜 Guía del Reino de las Hormigas</DialogTitle>
          <DialogDescription>Aprende a construir y gestionar tu imperio subterráneo</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Básicos</TabsTrigger>
            <TabsTrigger value="construction">Construcción</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="technology">Tecnología</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Conceptos Básicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🐜 Ciclo de Vida</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • La <strong>Reina</strong> pone un huevo cada 3 minutos
                    </li>
                    <li>
                      • Los <strong>Huevos</strong> eclosionan en 5 minutos → Larvas
                    </li>
                    <li>
                      • Las <strong>Larvas</strong> evolucionan en 7 minutos → Hormigas
                    </li>
                    <li>
                      • Las <strong>Hormigas</strong> pueden trabajar, explorar y construir
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📊 Límites de Población</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • La <strong>Guardería</strong> limita cuántos huevos/larvas puedes tener
                    </li>
                    <li>• Guardería Nivel 1 = máximo 10 huevos + larvas</li>
                    <li>• Mejora la guardería para aumentar la capacidad</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">⏰ Tiempo Real</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• El juego funciona en tiempo real</li>
                    <li>• Las acciones tienen tiempos de espera</li>
                    <li>• Planifica tus movimientos con anticipación</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="construction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Sistema de Construcción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">👑 Cámara Real</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • Es el <strong>corazón</strong> de tu hormiguero
                    </li>
                    <li>
                      • Solo puedes tener <strong>una</strong>
                    </li>
                    <li>• Su nivel determina qué construcciones puedes hacer</li>
                    <li>• Es la más costosa de mejorar</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🕳️ Sistema de Túneles</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Cada cámara tiene túneles para conectarse</li>
                    <li>
                      • Necesitas un <strong>túnel libre</strong> para construir nuevas cámaras
                    </li>
                    <li>• Puedes agregar más túneles a cualquier cámara</li>
                    <li>• Los túneles cuestan: 10🟤 3🪵 1🐜</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🏗️ Requisitos de Construcción</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • <strong>Nivel de Cámara Real:</strong> Cada construcción requiere cierto nivel
                    </li>
                    <li>
                      • <strong>Túneles libres:</strong> Necesitas conectividad
                    </li>
                    <li>
                      • <strong>Recursos:</strong> Comida, tierra, madera
                    </li>
                    <li>
                      • <strong>Hormigas:</strong> Trabajadoras disponibles
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🏠 Tipos de Cámaras</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • <strong>Guardería:</strong> Aumenta capacidad de población
                    </li>
                    <li>
                      • <strong>Almacén/Granero:</strong> Almacena recursos
                    </li>
                    <li>
                      • <strong>Laboratorio:</strong> Investiga tecnologías
                    </li>
                    <li>
                      • <strong>Cuartel:</strong> Entrena soldados
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Gestión de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">📦 Tipos de Recursos</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • <strong>🍯 Comida:</strong> Para mantener la colonia
                    </li>
                    <li>
                      • <strong>🟤 Tierra:</strong> Para construcción básica
                    </li>
                    <li>
                      • <strong>🪵 Madera:</strong> Para estructuras avanzadas
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🔍 Sistema de Expediciones</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • Envía hormigas a <strong>explorar</strong> diferentes ubicaciones
                    </li>
                    <li>• Más hormigas = más recursos encontrados</li>
                    <li>
                      • Las expediciones toman <strong>2-3 minutos</strong>
                    </li>
                    <li>
                      • Los recursos encontrados son <strong>aleatorios</strong>
                    </li>
                    <li>• Las hormigas están ocupadas durante la expedición</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🎯 Estrategia de Recursos</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Balancea entre exploración y construcción</li>
                    <li>• No envíes todas las hormigas a explorar</li>
                    <li>• Construye almacenes para guardar más recursos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Árbol Tecnológico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🔬 Investigación</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • Construye un <strong>Laboratorio</strong> para investigar
                    </li>
                    <li>• Las tecnologías mejoran diferentes aspectos</li>
                    <li>• Algunas tecnologías requieren otras como prerequisito</li>
                    <li>• Laboratorios de mayor nivel investigan más rápido</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🧬 Categorías de Tecnología</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>
                      • <strong>Biología:</strong> Mejora reproducción y desarrollo
                    </li>
                    <li>
                      • <strong>Ingeniería:</strong> Desbloquea nuevas construcciones
                    </li>
                    <li>
                      • <strong>Exploración:</strong> Mejora eficiencia de expediciones
                    </li>
                    <li>
                      • <strong>Militar:</strong> Desbloquea hormigas soldado
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">💡 Consejos</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Prioriza tecnologías que mejoren tu economía temprano</li>
                    <li>• "Construcción Avanzada" desbloquea edificios importantes</li>
                    <li>• "Guarderías Expandidas" permite tener hasta 3 guarderías</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>¡Entendido!</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
