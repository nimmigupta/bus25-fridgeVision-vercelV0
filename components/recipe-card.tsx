"use client"

import { useState } from "react"
import { Heart, Clock, Users, Flame, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import type { Recipe } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RecipeCardProps {
  recipe: Recipe
  onFavoriteChange?: () => void
}

export function RecipeCard({ recipe, onFavoriteChange }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(() => storage.isFavorite(recipe.id))
  const [showAllIngredients, setShowAllIngredients] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const toggleFavorite = () => {
    if (isFavorite) {
      storage.removeFavorite(recipe.id)
    } else {
      storage.addFavorite(recipe)
    }
    setIsFavorite(!isFavorite)
    onFavoriteChange?.()
  }

  const displayedIngredients = showAllIngredients ? recipe.ingredients : recipe.ingredients.slice(0, 4)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl leading-tight">{recipe.name}</CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">{recipe.description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn("shrink-0", isFavorite && "text-destructive hover:text-destructive")}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {recipe.prepTime} + {recipe.cookTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          {recipe.calories && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4" />
              <span>{recipe.calories} cal</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Ingredients</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {displayedIngredients.map((ingredient, i) => (
              <li key={i}>• {ingredient}</li>
            ))}
          </ul>
          {recipe.ingredients.length > 4 && (
            <button
              onClick={() => setShowAllIngredients(!showAllIngredients)}
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              {showAllIngredients ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show {recipe.ingredients.length - 4} more ingredients
                </>
              )}
            </button>
          )}
        </div>

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Cooking Instructions</h4>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {showInstructions ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show steps
                  </>
                )}
              </button>
            </div>
            {showInstructions && (
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                {recipe.instructions.map((instruction, i) => (
                  <li key={i} className="leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
