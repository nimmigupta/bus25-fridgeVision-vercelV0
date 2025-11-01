import type { Recipe, UserPreferences, ApiSettings } from "./types"

const FAVORITES_KEY = "nutrisnap_favorites"
const PREFERENCES_KEY = "nutrisnap_preferences"
const RECIPE_HISTORY_KEY = "nutrisnap_history"
const API_KEY_KEY = "nutrisnap_api_key"
const API_SETTINGS_KEY = "nutrisnap_api_settings"

export const storage = {
  // Favorites
  getFavorites: (): Recipe[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
  },

  addFavorite: (recipe: Recipe): void => {
    if (typeof window === "undefined") return
    const favorites = storage.getFavorites()
    const exists = favorites.some((r) => r.id === recipe.id)
    if (!exists) {
      favorites.unshift(recipe)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  },

  removeFavorite: (recipeId: string): void => {
    if (typeof window === "undefined") return
    const favorites = storage.getFavorites()
    const filtered = favorites.filter((r) => r.id !== recipeId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
  },

  isFavorite: (recipeId: string): boolean => {
    const favorites = storage.getFavorites()
    return favorites.some((r) => r.id === recipeId)
  },

  // Preferences
  getPreferences: (): UserPreferences => {
    if (typeof window === "undefined") {
      return {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
        skillLevel: "beginner",
        cookingTime: "any",
      }
    }
    const data = localStorage.getItem(PREFERENCES_KEY)
    return data
      ? JSON.parse(data)
      : {
          dietaryRestrictions: [],
          allergies: [],
          cuisinePreferences: [],
          skillLevel: "beginner",
          cookingTime: "any",
        }
  },

  savePreferences: (preferences: UserPreferences): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  },

  // Recipe History
  getHistory: (): Recipe[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(RECIPE_HISTORY_KEY)
    return data ? JSON.parse(data) : []
  },

  addToHistory: (recipe: Recipe): void => {
    if (typeof window === "undefined") return
    const history = storage.getHistory()
    const filtered = history.filter((r) => r.id !== recipe.id)
    filtered.unshift(recipe)
    const limited = filtered.slice(0, 20) // Keep last 20
    localStorage.setItem(RECIPE_HISTORY_KEY, JSON.stringify(limited))
  },

  // API Key Management
  getApiKey: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(API_KEY_KEY)
  },

  saveApiKey: (apiKey: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(API_KEY_KEY, apiKey)
  },

  clearApiKey: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(API_KEY_KEY)
  },

  // API Settings Management
  getApiSettings: (): ApiSettings => {
    if (typeof window === "undefined") {
      return {
        visionModel: "gemini-2.5-flash",
        recipeModel: "gemini-2.5-flash",
      }
    }
    const data = localStorage.getItem(API_SETTINGS_KEY)
    return data
      ? JSON.parse(data)
      : {
          visionModel: "gemini-2.5-flash",
          recipeModel: "gemini-2.5-flash",
        }
  },

  saveApiSettings: (settings: ApiSettings): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings))
  },
}
