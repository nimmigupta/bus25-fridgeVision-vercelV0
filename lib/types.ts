export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: string
  cookTime: string
  servings: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  tags: string[]
  imageUrl?: string
  createdAt: string
}

export interface UserPreferences {
  dietaryRestrictions: string[]
  allergies: string[]
  cuisinePreferences: string[]
  skillLevel: "beginner" | "intermediate" | "advanced"
  cookingTime: "quick" | "medium" | "any"
}

export interface FoodItem {
  name: string
  quantity?: string
  category?: string
}

export interface AnalysisResult {
  items: FoodItem[]
  suggestions: string[]
  expiringItems?: string[]
}

export interface ApiSettings {
  apiKey?: string
  visionModel: string
  recipeModel: string
}
