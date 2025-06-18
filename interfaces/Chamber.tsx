export default interface Chamber {
    id: string
    type: string
    level: number
    assignedAnts: string[] // IDs de hormigas asignadas
    tunnels: number
    connectedChambers: string[]
  }