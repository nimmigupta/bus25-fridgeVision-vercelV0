"use client"

import { Apple, Droplets, Flame, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function HealthyEatingPage() {
  const tips = [
    {
      icon: Apple,
      title: "Eat the Rainbow",
      description:
        "Include a variety of colorful fruits and vegetables in your diet for diverse nutrients and antioxidants.",
    },
    {
      icon: Droplets,
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily. Proper hydration supports digestion and overall health.",
    },
    {
      icon: Flame,
      title: "Balance Your Plate",
      description:
        "Fill half your plate with vegetables, a quarter with lean protein, and a quarter with whole grains.",
    },
    {
      icon: Heart,
      title: "Mindful Eating",
      description: "Eat slowly, savor your food, and listen to your body's hunger and fullness cues.",
    },
  ]

  const nutrients = [
    { name: "Protein", daily: "50-60g", sources: "Chicken, fish, beans, tofu, eggs" },
    { name: "Fiber", daily: "25-30g", sources: "Whole grains, vegetables, fruits, legumes" },
    { name: "Healthy Fats", daily: "44-77g", sources: "Avocado, nuts, olive oil, fatty fish" },
    { name: "Vitamins", daily: "Varies", sources: "Colorful fruits and vegetables" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Healthy Eating Guide</h1>
          <p className="text-sm text-muted-foreground">Learn about nutrition and build better eating habits</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Essential Tips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {tips.map((tip, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <tip.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                        <CardDescription className="mt-1.5">{tip.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Daily Nutrient Goals</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {nutrients.map((nutrient, i) => (
                    <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold">{nutrient.name}</h3>
                        <span className="text-sm text-primary font-medium">{nutrient.daily}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Sources: {nutrient.sources}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Meal Planning Tips</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">1.</span>
                    <span>Plan your meals for the week ahead to reduce food waste and save time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">2.</span>
                    <span>Prep ingredients in advance - wash, chop, and store vegetables for quick cooking</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">3.</span>
                    <span>
                      Batch cook staples like grains, proteins, and sauces to mix and match throughout the week
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">4.</span>
                    <span>Keep healthy snacks visible and accessible - fruits, nuts, and cut vegetables</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">5.</span>
                    <span>Use your freezer wisely - freeze portions of soups, stews, and cooked grains</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
