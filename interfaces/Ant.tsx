export default interface Ant {
    id: string
    type: "worker" | "soldier" | "cultivator"
    status: "idle" | "working" | "building" | "assigned"
    assignment?: string // ID de la cámara asignada
    experience: number
  }