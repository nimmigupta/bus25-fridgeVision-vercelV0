"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { RecipeCard } from "@/components/recipe-card"
import { storage } from "@/lib/storage"
import type { Recipe } from "@/lib/types"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Recipe[]>([])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    setFavorites(storage.getFavorites())
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Favorite Recipes</h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length} saved {favorites.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Start adding recipes to your favorites by tapping the heart icon on any recipe card
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onFavoriteChange={loadFavorites} />
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
