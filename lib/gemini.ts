// Gemini API client for vision and recipe generation

import type { DetectionResult, Recipe, UserPreferences } from "./models"

export class GeminiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "GeminiError"
  }
}

export async function analyzeImage(
  imageData: string,
  apiKey: string,
  model = "gemini-2.0-flash-exp",
): Promise<DetectionResult> {
  if (!apiKey) {
    throw new GeminiError("API key is required. Please configure it in Settings.")
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Identify edible items in this image. Return JSON only (no markdown): {"isFood":boolean, "items":[{"name":string, "confidence":number, "quantityHint":string}]}. If uncertain or no food, set isFood=false.',
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new GeminiError(error.error?.message || `API request failed: ${response.status}`, error.error?.code)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new GeminiError("No response from vision model")
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new GeminiError("Invalid response format from vision model")
    }

    const result: DetectionResult = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    if (error instanceof GeminiError) throw error
    throw new GeminiError(error instanceof Error ? error.message : "Failed to analyze image")
  }
}

export async function generateRecipes(
  items: string[],
  preferences: UserPreferences,
  apiKey: string,
  model = "gemini-2.0-flash-exp",
): Promise<Recipe[]> {
  if (!apiKey) {
    throw new GeminiError("API key is required. Please configure it in Settings.")
  }

  try {
    const dietInfo =
      preferences.diet === "Vegetarian"
        ? "vegetarian only"
        : preferences.diet === "Non-vegetarian"
          ? "can include meat/fish"
          : "healthy and balanced"

    const cuisineInfo = preferences.cuisines.length > 0 ? `Cuisines: ${preferences.cuisines.join(", ")}` : "Any cuisine"

    const calorieInfo =
      preferences.useCalorieTarget && preferences.calorieTarget
        ? `Target ~${preferences.calorieTarget} calories per serving`
        : ""

    const prompt = `Using these ingredients: ${items.join(", ")}

Generate exactly 5 diverse, practical recipes.
Diet: ${dietInfo}
${cuisineInfo}
${calorieInfo}

Return JSON array only (no markdown):
[{
  "id": "unique-id",
  "title": "Recipe Name",
  "cuisine": "cuisine-type",
  "isVegetarian": boolean,
  "caloriesPerServing": number (approx),
  "proteinGrams": number (approx),
  "ingredients": ["item 1", "item 2"],
  "steps": ["step 1", "step 2"],
  "source": "gemini_flash"
}]

Keep estimates marked as approximate. No medical/dietary claims.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new GeminiError(error.error?.message || `API request failed: ${response.status}`, error.error?.code)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new GeminiError("No response from recipe model")
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new GeminiError("Invalid response format from recipe model")
    }

    const recipes: Recipe[] = JSON.parse(jsonMatch[0])

    // Validate we got at least 5 recipes
    if (recipes.length < 5) {
      throw new GeminiError("Received fewer than 5 recipes. Please try again.")
    }

    return recipes
  } catch (error) {
    if (error instanceof GeminiError) throw error
    throw new GeminiError(error instanceof Error ? error.message : "Failed to generate recipes")
  }
}

export async function testConnection(apiKey: string, model: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }],
        }),
      },
    )

    return response.ok
  } catch {
    return false
  }
}
