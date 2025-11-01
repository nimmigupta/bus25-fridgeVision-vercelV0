"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { RecipeCard } from "@/components/recipe-card"
import { useToast } from "@/hooks/use-toast"
import { generateRecipes } from "@/lib/actions"
import { storage } from "@/lib/storage"
import type { Recipe, AnalysisResult } from "@/lib/types"

export default function RecipePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [fridgeImage, setFridgeImage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const analysisData = sessionStorage.getItem("analysis_result")
    const imageData = sessionStorage.getItem("fridge_image")

    if (!analysisData) {
      router.push("/")
      return
    }

    const parsedAnalysis = JSON.parse(analysisData)
    setAnalysis(parsedAnalysis)
    setFridgeImage(imageData)

    // Auto-generate recipes
    generateRecipesFromAnalysis(parsedAnalysis)
  }, [router])

  const generateRecipesFromAnalysis = async (analysisData: AnalysisResult) => {
    console.log("[v0] Starting recipe generation with items:", analysisData.items)

    setIsGenerating(true)
    try {
      const preferences = storage.getPreferences()
      const userApiKey = storage.getApiKey()
      const apiSettings = storage.getApiSettings()

      console.log("[v0] Recipe generation settings:", {
        hasApiKey: !!userApiKey,
        model: apiSettings.recipeModel,
        itemCount: analysisData.items.length,
      })

      const generatedRecipes = await generateRecipes(
        analysisData.items,
        preferences,
        3,
        userApiKey || undefined,
        apiSettings.recipeModel,
      )

      console.log("[v0] Recipes generated:", generatedRecipes.length)
      setRecipes(generatedRecipes)

      // Add to history
      generatedRecipes.forEach((recipe) => storage.addToHistory(recipe))
    } catch (error) {
      console.error("[v0] Recipe generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Could not generate recipes"

      let description = "Could not generate recipes. Please try again."
      if (errorMessage.includes("API key") || errorMessage.includes("API_KEY_INVALID")) {
        description =
          "Your API key is invalid. Please check your API key in Settings and make sure it's from Google AI Studio."
      } else if (errorMessage.includes("not valid")) {
        description = "Please verify your Google AI API key in Settings is correct and has access to Gemini models."
      }

      toast({
        title: "Generation failed",
        description,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    if (analysis) {
      generateRecipesFromAnalysis(analysis)
    }
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Your Recipes</h1>
            <p className="text-sm text-muted-foreground">Based on your ingredients</p>
          </div>
        </div>

        {fridgeImage && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                <img src={fridgeImage || "/placeholder.svg"} alt="Your fridge" className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detected Ingredients</CardTitle>
            <CardDescription>{analysis.items.length} items found in your fridge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.items.map((item, i) => (
                <Badge key={i} variant="secondary">
                  {item.name}
                  {item.quantity && ` (${item.quantity})`}
                </Badge>
              ))}
            </div>
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-2">Quick Ideas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recipe Suggestions</h2>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Regenerate
          </Button>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating personalized recipes...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
