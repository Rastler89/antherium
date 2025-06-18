export default interface Expedition {
    id: string
    type: "food" | "dirt" | "wood" | "leaves"
    antsCount: number
    startTime: number
    endTime: number
    location: string
  }