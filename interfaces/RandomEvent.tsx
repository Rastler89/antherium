export interface RandomEvent {
    id: string
    type: "positive" | "negative" | "neutral" | "choice"
    category: "weather" | "discovery" | "visitor" | "disaster" | "opportunity" | "mystery"
    title: string
    description: string
    icon: string
    rarity: "common" | "uncommon" | "rare" | "legendary"
    duration?: number // en ms, para eventos temporales
    effects: {
      immediate?: {
        resources?: { food?: number; dirt?: number; wood?: number; leaves?: number }
        population?: { eggs?: number; larvae?: number; ants?: number }
        chambers?: { damage?: number; boost?: number }
      }
      temporary?: {
        duration: number // en ms
        resourceMultiplier?: { food?: number; dirt?: number; wood?: number; leaves?: number }
        expeditionBonus?: number
        constructionBonus?: number
        researchBonus?: number
        populationBonus?: number
      }
      choices?: Array<{
        id: string
        text: string
        effects: RandomEvent["effects"]["immediate"]
        consequences?: string
      }>
    }
    requirements?: {
      minAnts?: number
      minChambers?: number
      hasResearch?: string[]
      minResources?: { food?: number; dirt?: number; wood?: number; leaves?: number }
    }
    cooldown?: number // tiempo antes de que pueda volver a aparecer
    onlyOnce?: boolean // evento único
  }