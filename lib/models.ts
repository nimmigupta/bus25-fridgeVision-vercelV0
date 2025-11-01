// Core TypeScript types for FridgeVision

export interface DetectedItem {
  name: string
  confidence: number
  quantityHint?: string
}

export interface DetectionResult {
  isFood: boolean
  items: DetectedItem[]
}

export type DietType = "Healthy" | "Vegetarian" | "Non-vegetarian"

export interface UserPreferences {
  diet: DietType
  cuisines: string[]
  calorieTarget?: number
  useCalorieTarget: boolean
}

export interface Recipe {
  id: string
  title: string
  cuisine: string
  isVegetarian: boolean
  caloriesPerServing?: number
  proteinGrams?: number
  ingredients: string[]
  steps: string[]
  source: "gemini_flash"
  detectedItems?: string[]
}

export interface AppSettings {
  googleAIStudioKey: string
  visionModel: string
  recipeModel: string
  useCalorieTarget: boolean
}

export interface SavedRecipe extends Recipe {
  savedAt: number
}
