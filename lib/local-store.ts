// LocalStorage utilities for FridgeVision

import type { AppSettings, UserPreferences, SavedRecipe } from "./models"

const KEYS = {
  SETTINGS: "fridgevision_settings",
  PREFERENCES: "fridgevision_preferences",
  FAVORITES: "fridgevision_favorites",
} as const

// Default values
const DEFAULT_SETTINGS: AppSettings = {
  googleAIStudioKey: "",
  visionModel: "gemini-2.0-flash-exp",
  recipeModel: "gemini-2.0-flash-exp",
  useCalorieTarget: false,
}

const DEFAULT_PREFERENCES: UserPreferences = {
  diet: "Healthy",
  cuisines: [],
  calorieTarget: 500,
  useCalorieTarget: false,
}

// Settings
export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(KEYS.SETTINGS)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === "undefined") return
  try {
    const current = getSettings()
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }))
  } catch (error) {
    console.error("[v0] Failed to save settings:", error)
  }
}

// Preferences
export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  try {
    const stored = localStorage.getItem(KEYS.PREFERENCES)
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") return
  try {
    const current = getPreferences()
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify({ ...current, ...preferences }))
  } catch (error) {
    console.error("[v0] Failed to save preferences:", error)
  }
}

// Favorites
export function getFavorites(): SavedRecipe[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(KEYS.FAVORITES)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveFavorite(recipe: SavedRecipe): void {
  if (typeof window === "undefined") return
  try {
    const favorites = getFavorites()
    const exists = favorites.find((f) => f.id === recipe.id)
    if (!exists) {
      favorites.push(recipe)
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites))
    }
  } catch (error) {
    console.error("[v0] Failed to save favorite:", error)
  }
}

export function removeFavorite(recipeId: string): void {
  if (typeof window === "undefined") return
  try {
    const favorites = getFavorites()
    const filtered = favorites.filter((f) => f.id !== recipeId)
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered))
  } catch (error) {
    console.error("[v0] Failed to remove favorite:", error)
  }
}

export function isFavorite(recipeId: string): boolean {
  if (typeof window === "undefined") return false
  const favorites = getFavorites()
  return favorites.some((f) => f.id === recipeId)
}
