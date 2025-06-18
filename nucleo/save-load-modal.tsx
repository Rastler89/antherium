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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Upload, Download, Trash2 } from "lucide-react"
import { GameStorage } from "./game-storage"



export default function SaveLoadModal({ onLoadGame, onNewGame }: SaveLoadModalProps) {
  const [open, setOpen] = useState(false)
  const [importData, setImportData] = useState("")
  const [exportData, setExportData] = useState("")

  const handleExport = () => {
    const data = GameStorage.exportSave()
    setExportData(data)
  }

  const handleImport = () => {
    if (GameStorage.importSave(importData)) {
      alert("¡Datos importados correctamente!")
      setImportData("")
      onLoadGame()
      setOpen(false)
    } else {
      alert("Error: Los datos no son válidos")
    }
  }

  const handleClearSave = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todos los datos guardados?")) {
      GameStorage.clearSave()
      alert("Datos eliminados")
      setOpen(false)
    }
  }

  const hasSave = GameStorage.hasSavedGame()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed top-4 left-4 z-50">
          <Save className="h-4 w-4 mr-2" />
          Guardar/Cargar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Gestión de Partidas
          </DialogTitle>
          <DialogDescription>Guarda, carga o gestiona tus partidas guardadas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Partida Guardada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Partida Guardada</CardTitle>
            </CardHeader>
            <CardContent>
              {hasSave ? (
                <div className="space-y-3">
                  <div className="text-sm text-green-600">✓ Tienes una partida guardada</div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onLoadGame()
                        setOpen(false)
                      }}
                      className="flex-1"
                    >
                      Continuar Partida
                    </Button>
                    <Button
                      onClick={() => {
                        onNewGame()
                        setOpen(false)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Nueva Partida
                    </Button>
                  </div>
                  <Button onClick={handleClearSave} variant="destructive" size="sm" className="w-full">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar Partida Guardada
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">No hay partidas guardadas</div>
                  <Button
                    onClick={() => {
                      onNewGame()
                      setOpen(false)
                    }}
                    className="w-full"
                  >
                    Comenzar Nueva Partida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exportar Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exportar Partida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="h-3 w-3 mr-1" />
                  Exportar Datos
                </Button>
                {exportData && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Copia estos datos para hacer backup:</div>
                    <Textarea
                      value={exportData}
                      readOnly
                      className="h-20 text-xs"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Importar Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Importar Partida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">Pega los datos de tu partida guardada:</div>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Pega aquí los datos exportados..."
                  className="h-20 text-xs"
                />
                <Button onClick={handleImport} disabled={!importData.trim()} className="w-full">
                  <Upload className="h-3 w-3 mr-1" />
                  Importar Datos
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center">
            El juego se guarda automáticamente cada 30 segundos
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
