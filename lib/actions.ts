"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import type { FoodItem, Recipe, UserPreferences } from "./types"

function getGenAI(userApiKey?: string) {
  const apiKey = userApiKey || process.env.GOOGLE_AI_API_KEY

  console.log("[v0] API Key check:", {
    hasUserKey: !!userApiKey,
    hasEnvKey: !!process.env.GOOGLE_AI_API_KEY,
    envKeyLength: process.env.GOOGLE_AI_API_KEY?.length || 0,
    userKeyLength: userApiKey?.length || 0,
  })

  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not configured. Please add it in the Vars section or provide your own key in Settings.",
    )
  }

  return new GoogleGenerativeAI(apiKey)
}

export async function analyzeFridgeImage(
  imageUrl: string,
  userApiKey?: string,
  model = "gemini-2.0-flash-exp",
): Promise<{ items: FoodItem[]; suggestions: string[] }> {
  try {
    const genAI = getGenAI(userApiKey)
    const genModel = genAI.getGenerativeModel({ model })

    // Convert image URL to base64
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    const result = await genModel.generateContent([
      {
        inlineData: {
          mimeType: blob.type,
          data: base64,
        },
      },
      {
        text: 'Analyze this fridge/pantry image and list all visible food items. For each item, identify the name and estimate quantity if visible. Also provide 2-3 quick suggestions for what could be made. Return as JSON with format: { "items": [{"name": "item", "quantity": "amount"}], "suggestions": ["suggestion1", "suggestion2"] }',
      },
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return { items: [], suggestions: [] }
  } catch (error) {
    console.error("[v0] Error analyzing image:", error)
    throw error
  }
}

export async function generateRecipes(
  items: FoodItem[],
  preferences: UserPreferences,
  count = 3,
  userApiKey?: string,
  model = "gemini-1.5-flash",
): Promise<Recipe[]> {
  try {
    const genAI = getGenAI(userApiKey)
    const genModel = genAI.getGenerativeModel({ model })

    const itemsList = items.map((i) => `${i.name}${i.quantity ? ` (${i.quantity})` : ""}`).join(", ")

    const prompt = `Generate ${count} creative recipes using these ingredients: ${itemsList}.

User preferences:
- Dietary restrictions: ${preferences.dietaryRestrictions.join(", ") || "none"}
- Allergies: ${preferences.allergies.join(", ") || "none"}
- Cuisine preferences: ${preferences.cuisinePreferences.join(", ") || "any"}
- Skill level: ${preferences.skillLevel}
- Cooking time: ${preferences.cookingTime}

Return ONLY a JSON array of recipes with this exact format:
[{
  "name": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": 4,
  "calories": 350,
  "protein": 25,
  "carbs": 40,
  "fat": 12,
  "tags": ["healthy", "quick"]
}]`

    const result = await genModel.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const recipes = JSON.parse(jsonMatch[0])
      return recipes.map((r: any) => ({
        ...r,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      }))
    }

    return []
  } catch (error) {
    console.error("[v0] Error generating recipes:", error)
    throw error
  }
}

export async function testApiKey(
  apiKey: string,
  model = "gemini-2.5-flash",
): Promise<{ success: boolean; error?: string }> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const genModel = genAI.getGenerativeModel({ model })

    const result = await genModel.generateContent("Say 'API key is valid' if you can read this.")
    const text = result.response.text()

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to validate API key",
    }
  }
}
