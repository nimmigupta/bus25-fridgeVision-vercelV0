"use client"

import { useState, useEffect } from "react"
import { Save, ExternalLink, CheckCircle2, XCircle, Loader2, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/storage"
import { testApiKey } from "@/lib/actions"
import type { UserPreferences, ApiSettings } from "@/lib/types"

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    skillLevel: "beginner",
    cookingTime: "any",
  })
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    visionModel: "gemini-2.5-flash",
    recipeModel: "gemini-2.5-flash",
  })
  const [apiKey, setApiKey] = useState("")
  const [isTestingKey, setIsTestingKey] = useState(false)
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setPreferences(storage.getPreferences())
    setApiKey(storage.getApiKey() || "")
    setApiSettings(storage.getApiSettings())
  }, [])

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to test",
        variant: "destructive",
      })
      return
    }

    setIsTestingKey(true)
    setKeyTestResult(null)

    try {
      const result = await testApiKey(apiKey.trim(), apiSettings.visionModel)
      setKeyTestResult(result)

      if (result.success) {
        toast({
          title: "API Key Valid",
          description: "Your Gemini API key is working correctly",
        })
      } else {
        toast({
          title: "API Key Invalid",
          description: result.error || "Failed to validate API key",
          variant: "destructive",
        })
      }
    } catch (error) {
      setKeyTestResult({ success: false, error: "Failed to test API key" })
      toast({
        title: "Test Failed",
        description: "Could not test the API key",
        variant: "destructive",
      })
    } finally {
      setIsTestingKey(false)
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    setSaveSuccess(false)

    storage.savePreferences(preferences)
    storage.saveApiSettings(apiSettings)

    if (apiKey.trim()) {
      storage.saveApiKey(apiKey.trim())
    } else {
      storage.clearApiKey()
    }

    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      })

      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    }, 300)
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
  }

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"]
  const allergyOptions = ["Nuts", "Shellfish", "Eggs", "Soy", "Fish", "Wheat"]
  const cuisineOptions = ["Italian", "Mexican", "Asian", "Mediterranean", "American", "Indian"]

  const visionModels = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended)", description: "Fast and accurate vision" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Highest quality, slower" },
    { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Experimental model" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Previous generation" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Previous generation" },
  ]

  const recipeModels = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended)", description: "Fast recipe generation" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "More detailed recipes" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Previous generation" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Previous generation" },
    { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Experimental model" },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your recipe preferences</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Gemini API Configuration</CardTitle>
              </div>
              <CardDescription>
                Get started by adding your free Google AI API key.{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Click here to get your API key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <p className="font-semibold">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Visit Google AI Studio and create a free API key</li>
                  <li>Copy your API key (starts with "AIza...")</li>
                  <li>Paste it in the field below and click "Test"</li>
                  <li>Once validated, click "Save Preferences" at the bottom</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Label htmlFor="api-key" className="text-base font-semibold">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setKeyTestResult(null)
                    }}
                    className="font-mono text-sm flex-1"
                  />
                  <Button
                    onClick={handleTestApiKey}
                    disabled={isTestingKey || !apiKey.trim()}
                    variant="outline"
                    size="default"
                  >
                    {isTestingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
                  </Button>
                </div>

                {keyTestResult && (
                  <div
                    className={`flex items-center gap-2 text-sm p-3 rounded-lg ${keyTestResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-destructive/10 text-destructive border border-destructive/20"}`}
                  >
                    {keyTestResult.success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>API key is valid! Don't forget to save your settings below.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>
                          {keyTestResult.error || "API key validation failed. Please check your key and try again."}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally in your browser and never shared with anyone.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="vision-model" className="text-base font-semibold">
                  Vision Model
                </Label>
                <Select
                  value={apiSettings.visionModel}
                  onValueChange={(value) => setApiSettings({ ...apiSettings, visionModel: value })}
                >
                  <SelectTrigger id="vision-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visionModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.label}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Model used for analyzing fridge images and detecting ingredients
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="recipe-model" className="text-base font-semibold">
                  Recipe Generation Model
                </Label>
                <Select
                  value={apiSettings.recipeModel}
                  onValueChange={(value) => setApiSettings({ ...apiSettings, recipeModel: value })}
                >
                  <SelectTrigger id="recipe-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.label}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Model used for generating personalized recipes based on your ingredients
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dietary Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Restrictions</CardTitle>
              <CardDescription>Select any dietary restrictions you follow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diet-${option}`}
                      checked={preferences.dietaryRestrictions.includes(option)}
                      onCheckedChange={() => {
                        setPreferences({
                          ...preferences,
                          dietaryRestrictions: toggleArrayItem(preferences.dietaryRestrictions, option),
                        })
                      }}
                    />
                    <Label htmlFor={`diet-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>Let us know about any food allergies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {allergyOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergy-${option}`}
                      checked={preferences.allergies.includes(option)}
                      onCheckedChange={() => {
                        setPreferences({
                          ...preferences,
                          allergies: toggleArrayItem(preferences.allergies, option),
                        })
                      }}
                    />
                    <Label htmlFor={`allergy-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cuisine Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Preferences</CardTitle>
              <CardDescription>Choose your favorite types of cuisine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {cuisineOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-${option}`}
                      checked={preferences.cuisinePreferences.includes(option)}
                      onCheckedChange={() => {
                        setPreferences({
                          ...preferences,
                          cuisinePreferences: toggleArrayItem(preferences.cuisinePreferences, option),
                        })
                      }}
                    />
                    <Label htmlFor={`cuisine-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cooking Skill Level */}
          <Card>
            <CardHeader>
              <CardTitle>Cooking Skill Level</CardTitle>
              <CardDescription>Help us suggest appropriate recipes</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.skillLevel}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    skillLevel: value as UserPreferences["skillLevel"],
                  })
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="cursor-pointer">
                    Beginner - Simple recipes with basic techniques
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="cursor-pointer">
                    Intermediate - Moderate complexity
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="cursor-pointer">
                    Advanced - Complex techniques welcome
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Cooking Time Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Cooking Time Preference</CardTitle>
              <CardDescription>How much time do you typically have?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.cookingTime}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    cookingTime: value as UserPreferences["cookingTime"],
                  })
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quick" id="quick" />
                  <Label htmlFor="quick" className="cursor-pointer">
                    Quick - Under 30 minutes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">
                    Medium - 30-60 minutes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any" />
                  <Label htmlFor="any" className="cursor-pointer">
                    Any - No time restrictions
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-20 z-40 mb-8">
            <Button onClick={handleSave} size="lg" className="w-full shadow-lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
