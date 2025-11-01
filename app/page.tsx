"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, Loader2, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { analyzeFridgeImage } from "@/lib/actions"
import { storage } from "@/lib/storage"

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userApiKey = storage.getApiKey()
    setHasApiKey(!!userApiKey)
  }, [])

  const handleFileSelect = async (file: File) => {
    console.log("[v0] File selected:", file.name, file.type)

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    const userApiKey = storage.getApiKey()

    console.log("[v0] API key check:", {
      hasUserKey: !!userApiKey,
      userKeyLength: userApiKey?.length,
    })

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      setPreview(imageUrl)
      console.log("[v0] Image loaded, starting analysis...")

      setIsAnalyzing(true)
      try {
        const apiSettings = storage.getApiSettings()
        console.log("[v0] Using model:", apiSettings.visionModel)

        const result = await analyzeFridgeImage(imageUrl, userApiKey || undefined, apiSettings.visionModel)
        console.log("[v0] Analysis successful:", result)

        sessionStorage.setItem("analysis_result", JSON.stringify(result))
        sessionStorage.setItem("fridge_image", imageUrl)

        router.push("/recipe")
      } catch (error) {
        console.error("[v0] Analysis error:", error)
        const errorMessage = error instanceof Error ? error.message : "Could not analyze the image"

        let description = "Could not analyze the image. Please try again."
        if (errorMessage.includes("API key") || errorMessage.includes("API_KEY_INVALID")) {
          description =
            "Your API key is invalid. Please check your API key in Settings and make sure it's from Google AI Studio."
        } else if (errorMessage.includes("not valid")) {
          description = "Please verify your Google AI API key in Settings is correct and has access to Gemini models."
        }

        toast({
          title: "Analysis failed",
          description,
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">NutriSnap</h1>
          <p className="text-muted-foreground text-lg">Snap your fridge, get instant recipe ideas</p>
        </div>

        {!hasApiKey && (
          <Alert className="max-w-2xl mx-auto mb-6 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-sm">
                Add your free Google AI API key to start analyzing fridge photos and generating recipes.
              </span>
              <Button variant="outline" size="sm" onClick={() => router.push("/settings")} className="shrink-0">
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Fridge Photo</CardTitle>
            <CardDescription>Take a photo of your fridge or pantry to discover recipes you can make</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preview ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted flex items-center justify-center p-2 w-fit mx-auto">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Fridge preview"
                    className="w-[200px] h-[200px] object-cover"
                  />
                </div>
                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing your ingredients...</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, HEIC up to 10MB</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <div className="flex gap-3">
              <Button onClick={handleUploadClick} disabled={isAnalyzing} className="flex-1" size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Choose Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-2xl mx-auto mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Snap</h3>
              <p className="text-xs text-muted-foreground">Take a photo of your fridge</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Analyze</h3>
              <p className="text-xs text-muted-foreground">AI identifies ingredients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Cook</h3>
              <p className="text-xs text-muted-foreground">Get personalized recipes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
