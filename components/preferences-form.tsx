"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  X, Plus, Zap, Atom, Activity, Snowflake, Box, CloudUpload, ImageIcon, Loader2, Navigation, 
  Beef, Wheat, Droplets, Globe, Cookie, Sparkles, ShieldAlert, Orbit, Library, Pill, Users 
} from "lucide-react";
import {
  PREFERENCES_FORM_STRINGS as S,
  PROTEIN_SOURCES,
  CARB_SOURCES,
  FAT_SOURCES,
  COMMON_ALLERGIES,
  DIETARY_RESTRICTIONS,
  CUISINE_OPTIONS,
  MEDICAL_CONDITIONS,
  COMMON_MEDICATIONS,
} from "@/lib/preferences-form-strings";

export interface MealPreferences {
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatsPercent: number;
  proteinSources: string[];
  carbSources: string[];
  fatSources: string[];
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  restrictions: string[];
  cuisines: string[];
  cuisineNotes: string;
  recipeInventory: string[];
  fridgeInventory: string[];
  mealServiceMeals: string[];
  eatingOutMeals: string[];
  numberOfPeople: number;
  mealExamples: string;
  additionalNotes: string;
}

interface PreferencesFormProps {
  onSubmit: (data: MealPreferences) => void;
  isLoading: boolean;
}

export function PreferencesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  const [calories, setCalories] = useState(2000);
  const [proteinPercent, setProteinPercent] = useState(30);
  const [carbsPercent, setCarbsPercent] = useState(40);
  const [fatsPercent, setFatsPercent] = useState(30);

  const [proteinSources, setProteinSources] = useState<string[]>([]);
  const [carbSources, setCarbSources] = useState<string[]>([]);
  const [fatSources, setFatSources] = useState<string[]>([]);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [medications, setMedications] = useState<string[]>([]);
  const [customMedication, setCustomMedication] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState("");

  const [cuisines, setCuisines] = useState<string[]>([]);
  const [cuisineNotes, setCuisineNotes] = useState("");
  const [recipeInventory, setRecipeInventory] = useState<string[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState("");
  const [fridgeInventory, setFridgeInventory] = useState<string[]>([]);
  const [currentFridgeItem, setCurrentFridgeItem] = useState("");
  const [mealServiceMeals, setMealServiceMeals] = useState<string[]>([]);
  const [currentMealServiceMeal, setCurrentMealServiceMeal] = useState("");
  const [mealServiceImages, setMealServiceImages] = useState<{ id: string; preview: string; name: string }[]>([]);
  const [isParsingImage, setIsParsingImage] = useState(false);
  const [eatingOutMeals, setEatingOutMeals] = useState<string[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [mealExampleImages, setMealExampleImages] = useState<{ id: string; preview: string; name: string }[]>([]);
  const [isParsingExampleImage, setIsParsingExampleImage] = useState(false);
  const [mealExamples, setMealExamples] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Calculate grams from percentages
  const proteinGrams = Math.round((calories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercent / 100)) / 4);
  const fatsGrams = Math.round((calories * (fatsPercent / 100)) / 9);

  const totalPercent = proteinPercent + carbsPercent + fatsPercent;
  const isValidMacros = totalPercent === 100;

  const adjustMacros = (
    type: "protein" | "carbs" | "fats",
    newValue: number
  ) => {
    const currentTotal =
      (type === "protein" ? newValue : proteinPercent) +
      (type === "carbs" ? newValue : carbsPercent) +
      (type === "fats" ? newValue : fatsPercent);

    if (type === "protein") {
      setProteinPercent(newValue);
      if (currentTotal !== 100) {
        const diff = 100 - newValue;
        const ratio = carbsPercent / (carbsPercent + fatsPercent) || 0.5;
        setCarbsPercent(Math.round(diff * ratio));
        setFatsPercent(Math.round(diff * (1 - ratio)));
      }
    } else if (type === "carbs") {
      setCarbsPercent(newValue);
      if (currentTotal !== 100) {
        const diff = 100 - newValue;
        const ratio = proteinPercent / (proteinPercent + fatsPercent) || 0.5;
        setProteinPercent(Math.round(diff * ratio));
        setFatsPercent(Math.round(diff * (1 - ratio)));
      }
    } else {
      setFatsPercent(newValue);
      if (currentTotal !== 100) {
        const diff = 100 - newValue;
        const ratio = proteinPercent / (proteinPercent + carbsPercent) || 0.5;
        setProteinPercent(Math.round(diff * ratio));
        setCarbsPercent(Math.round(diff * (1 - ratio)));
      }
    }
  };

  const toggleItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList((prev) => [...prev, value.trim()]);
      setValue("");
    }
  };

  const addRecipe = () => {
    if (currentRecipe.trim() && !recipeInventory.includes(currentRecipe.trim())) {
      setRecipeInventory((prev) => [...prev, currentRecipe.trim()]);
      setCurrentRecipe("");
    }
  };

  const removeRecipe = (recipe: string) => {
    setRecipeInventory((prev) => prev.filter((r) => r !== recipe));
  };

  const addFridgeItem = () => {
    if (currentFridgeItem.trim() && !fridgeInventory.includes(currentFridgeItem.trim())) {
      setFridgeInventory((prev) => [...prev, currentFridgeItem.trim()]);
      setCurrentFridgeItem("");
    }
  };

  const removeFridgeItem = (item: string) => {
    setFridgeInventory((prev) => prev.filter((i) => i !== item));
  };

  const addMealServiceMeal = () => {
    if (currentMealServiceMeal.trim() && !mealServiceMeals.includes(currentMealServiceMeal.trim())) {
      setMealServiceMeals((prev) => [...prev, currentMealServiceMeal.trim()]);
      setCurrentMealServiceMeal("");
    }
  };

  const removeMealServiceMeal = (meal: string) => {
    setMealServiceMeals((prev) => prev.filter((m) => m !== meal));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsingImage(true);

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add image preview
        setMealServiceImages((prev) => [
          ...prev,
          { id: imageId, preview: base64Data, name: file.name }
        ]);

        try {
          // Parse image with AI
          const response = await fetch("/api/parse-meal-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: base64Data }),
          });

          if (response.ok) {
            const data = await response.json();
            // Split the meals by newline and add them
            const parsedMeals = data.meals
              .split("\n")
              .map((m: string) => m.trim())
              .filter((m: string) => m.length > 0 && !m.startsWith("I "));
            
            setMealServiceMeals((prev) => {
              const newMeals = parsedMeals.filter((m: string) => !prev.includes(m));
              return [...prev, ...newMeals];
            });
          }
        } catch (error) {
          console.error("Failed to parse meal image:", error);
        }
      };

      reader.readAsDataURL(file);
    }

    setIsParsingImage(false);
    // Reset input
    e.target.value = "";
  };

  const removeImage = (imageId: string) => {
    setMealServiceImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleExampleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsingExampleImage(true);

    for (const file of Array.from(files)) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const imageId = `example-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add image preview
        setMealExampleImages((prev) => [
          ...prev,
          { id: imageId, preview: base64Data, name: file.name },
        ]);

        try {
          // Parse image with AI
          const response = await fetch("/api/parse-meal-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              imageData: base64Data,
              context: "meal examples - extract meal names and descriptions the user might enjoy"
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Append parsed meals to the text area
            setMealExamples((prev) => {
              const newContent = data.meals.trim();
              if (prev.trim()) {
                return `${prev.trim()}\n${newContent}`;
              }
              return newContent;
            });
          }
        } catch (error) {
          console.error("Failed to parse meal example image:", error);
        }
      };

      reader.readAsDataURL(file);
    }

    setIsParsingExampleImage(false);
    e.target.value = "";
  };

  const removeExampleImage = (imageId: string) => {
    setMealExampleImages((prev) => prev.filter((img) => img.id !== imageId));
  };

const handleSubmit = () => {
    onSubmit({
      calories,
      proteinPercent,
      carbsPercent,
      fatsPercent,
      proteinSources,
      carbSources,
      fatSources,
      allergies,
      medicalConditions,
      medications,
      restrictions,
      cuisines,
      cuisineNotes,
      recipeInventory,
      fridgeInventory,
      mealServiceMeals,
      eatingOutMeals,
      numberOfPeople,
      mealExamples,
      additionalNotes,
    });
  };

  const SectionHeader = ({ title, isFirst }: { title: string; isFirst?: boolean }) => (
    <div className={`pb-2 ${isFirst ? "pt-0" : "pt-8"}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-foreground">
            {S.welcome.title}
          </CardTitle>
          <CardDescription className="text-base">
            {S.welcome.description}
          </CardDescription>
        </CardHeader>
      </Card>

      <SectionHeader title={S.sections.taste} isFirst />
      {/* Cuisine Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-accent" />
            {S.cuisine.title}
          </CardTitle>
          <CardDescription>
            {S.cuisine.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={cuisines.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(cuisine, cuisines, setCuisines)}
              >
                {cuisine}
                {cuisines.includes(cuisine) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuisineNotes">
              {S.cuisine.labelCuisineNotes}
            </Label>
            <Textarea
              id="cuisineNotes"
              placeholder={S.cuisine.placeholderCuisineNotes}
              value={cuisineNotes}
              onChange={(e) => setCuisineNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferred Protein Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Beef className="h-5 w-5 text-chart-3" />
            {S.protein.title}
          </CardTitle>
          <CardDescription>
            {S.protein.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PROTEIN_SOURCES.map((source) => (
              <Badge
                key={source}
                variant={proteinSources.includes(source) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(source, proteinSources, setProteinSources)}
              >
                {source}
                {proteinSources.includes(source) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carb Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wheat className="h-5 w-5 text-chart-5" />
            Preferred Carbohydrate Sources
          </CardTitle>
          <CardDescription>
            Select the carb sources you prefer in your meals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CARB_SOURCES.map((source) => (
              <Badge
                key={source}
                variant={carbSources.includes(source) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(source, carbSources, setCarbSources)}
              >
                {source}
                {carbSources.includes(source) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fat Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Droplets className="h-5 w-5 text-amber-400" />
            {S.fats.title}
          </CardTitle>
          <CardDescription>
            {S.fats.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FAT_SOURCES.map((source) => (
              <Badge
                key={source}
                variant={fatSources.includes(source) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(source, fatSources, setFatSources)}
              >
                {source}
                {fatSources.includes(source) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Library className="h-5 w-5 text-primary" />
            Recipe Inventory
          </CardTitle>
          <CardDescription>
            Add your favorite recipes to be considered in meal suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newRecipe">Add a recipe</Label>
            <div className="flex gap-2">
              <Textarea
                id="newRecipe"
                placeholder="Enter a recipe name or describe it (e.g., 'Grandma's chicken soup with vegetables and noodles' or 'Spicy Korean bibimbap with gochujang sauce')..."
                value={currentRecipe}
                onChange={(e) => setCurrentRecipe(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addRecipe();
                  }
                }}
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-auto bg-transparent"
                onClick={addRecipe}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {S.recipeInventory.hintRecipes}
            </p>
          </div>
          {recipeInventory.length > 0 && (
            <div className="space-y-2">
              <Label>{S.recipeInventory.yourSavedRecipes(recipeInventory.length)}</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
                {recipeInventory.map((recipe, index) => (
                  <div
                    key={`${recipe}-${index}`}
                    className="flex items-start justify-between gap-2 rounded-md bg-muted p-2"
                  >
                    <span className="text-sm">{recipe}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeRecipe(recipe)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal Examples & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Cookie className="h-5 w-5 text-primary" />
            {S.mealExamples.title}
          </CardTitle>
          <CardDescription>
            {S.mealExamples.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>{S.mealExamples.labelUploadPhotos}</Label>
            <label
              htmlFor="example-image-upload"
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
            >
              {isParsingExampleImage ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">{S.mealExamples.analyzingPhotos}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CloudUpload className="h-6 w-6 text-muted-foreground" />
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">{S.mealExamples.uploadPhotosHint}</span>
                  <span className="text-xs text-muted-foreground">
                    {S.mealExamples.uploadPhotosSubHint}
                  </span>
                </>
              )}
              <input
                id="example-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleExampleImageUpload}
                disabled={isParsingExampleImage}
              />
            </label>
            {mealExampleImages.length > 0 && (
              <div className="space-y-2">
                <Label>{S.mealExamples.uploadedPhotos(mealExampleImages.length)}</Label>
                <div className="flex flex-wrap gap-2">
                  {mealExampleImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden border"
                    >
                      <img
                        src={img.preview || "/placeholder.svg"}
                        alt={img.name}
                        className="h-20 w-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExampleImage(img.id)}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{S.mealExamples.orDescribeMeals}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mealExamples">{S.mealExamples.labelMealsYouEnjoy}</Label>
            <Textarea
              id="mealExamples"
              placeholder={S.mealExamples.placeholderMealExamples}
              value={mealExamples}
              onChange={(e) => setMealExamples(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Meals from uploaded photos will appear here automatically
            </p>
          </div>
        </CardContent>
      </Card>

      <SectionHeader title="Your dietaty preferences" />
      {/* Daily Calories & Macros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-chart-5" />
            Daily Calories & Macros
          </CardTitle>
          <CardDescription>
            Set your daily calorie target and macro distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="calories" className="text-base font-medium">Daily Calories</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-24 text-center"
                  min={1000}
                  max={5000}
                  step={50}
                />
                <span className="text-sm text-muted-foreground">{S.caloriesMacros.kcal}</span>
              </div>
            </div>
            <Slider
              value={[calories]}
              onValueChange={([val]) => setCalories(val)}
              min={1000}
              max={5000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1000</span>
              <span>5000</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Macro Distribution</Label>
              {!isValidMacros && (
                <span className="text-xs text-destructive">
                  Total: {totalPercent}% (must equal 100%)
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{S.caloriesMacros.protein}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{proteinPercent}%</span>
                  <span className="text-muted-foreground ml-2">({proteinGrams}g)</span>
                </div>
              </div>
              <Slider
                value={[proteinPercent]}
                onValueChange={([val]) => adjustMacros("protein", val)}
                min={10}
                max={60}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Carbohydrates</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{carbsPercent}%</span>
                  <span className="text-muted-foreground ml-2">({carbsGrams}g)</span>
                </div>
              </div>
              <Slider
                value={[carbsPercent]}
                onValueChange={([val]) => adjustMacros("carbs", val)}
                min={10}
                max={70}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{S.caloriesMacros.fats}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{fatsPercent}%</span>
                  <span className="text-muted-foreground ml-2">({fatsGrams}g)</span>
                </div>
              </div>
              <Slider
                value={[fatsPercent]}
                onValueChange={([val]) => adjustMacros("fats", val)}
                min={10}
                max={60}
                step={5}
              />
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden flex mt-4">
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${proteinPercent}%` }}
              />
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${carbsPercent}%` }}
              />
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${fatsPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Atom className="h-5 w-5 text-primary" />
            {S.dietaryRestrictions.title}
          </CardTitle>
          <CardDescription>
            {S.dietaryRestrictions.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <Badge
                key={restriction}
                variant={restrictions.includes(restriction) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(restriction, restrictions, setRestrictions)}
              >
                {restriction}
                {restrictions.includes(restriction) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={S.dietaryRestrictions.placeholderAddOther}
              value={customRestriction}
              onChange={(e) => setCustomRestriction(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addCustomItem(
                  customRestriction,
                  restrictions,
                  setRestrictions,
                  setCustomRestriction
                )
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                addCustomItem(
                  customRestriction,
                  restrictions,
                  setRestrictions,
                  setCustomRestriction
                )
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {restrictions.filter((r) => !(DIETARY_RESTRICTIONS as string[]).includes(r)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restrictions
                .filter((r) => !(DIETARY_RESTRICTIONS as string[]).includes(r))
                .map((restriction) => (
                  <Badge
                    key={restriction}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => toggleItem(restriction, restrictions, setRestrictions)}
                  >
                    {restriction}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SectionHeader title="Medical restrictions" />
      {/* Food Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {S.allergies.title}
          </CardTitle>
          <CardDescription>
            {S.allergies.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <Badge
                key={allergy}
                variant={allergies.includes(allergy) ? "destructive" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(allergy, allergies, setAllergies)}
              >
                {allergy}
                {allergies.includes(allergy) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add other allergy..."
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {allergies.filter((a) => !(COMMON_ALLERGIES as string[]).includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies
                .filter((a) => !(COMMON_ALLERGIES as string[]).includes(a))
                .map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => toggleItem(allergy, allergies, setAllergies)}
                  >
                    {allergy}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-chart-2" />
            {S.medicalConditions.title}
          </CardTitle>
          <CardDescription>
            {S.medicalConditions.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MEDICAL_CONDITIONS.map((condition) => (
              <Badge
                key={condition.name}
                variant={medicalConditions.includes(condition.name) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(condition.name, medicalConditions, setMedicalConditions)}
                title={condition.tip}
              >
                {condition.name}
                {medicalConditions.includes(condition.name) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add other medical condition..."
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addCustomItem(customCondition, medicalConditions, setMedicalConditions, setCustomCondition)
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                addCustomItem(customCondition, medicalConditions, setMedicalConditions, setCustomCondition)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {medicalConditions.filter((c) => !MEDICAL_CONDITIONS.map((m) => m.name).includes(c)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {medicalConditions
                .filter((c) => !MEDICAL_CONDITIONS.map((m) => m.name).includes(c))
                .map((condition) => (
                  <Badge
                    key={condition}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => toggleItem(condition, medicalConditions, setMedicalConditions)}
                  >
                    {condition}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          )}
          {medicalConditions.length > 0 && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">{S.medicalConditions.dietaryConsiderations}</p>
              <ul className="list-disc list-inside space-y-1">
                {medicalConditions.map((c) => {
                  const condition = MEDICAL_CONDITIONS.find((m) => m.name === c);
                  return condition ? (
                    <li key={c}>
                      <span className="font-medium">{c}:</span> {condition.tip}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Pill className="h-5 w-5 text-chart-3" />
            Current Medications
          </CardTitle>
          <CardDescription>
            Add medications you take so we can check for food-drug interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_MEDICATIONS.map((med) => (
              <Badge
                key={med.name}
                variant={medications.includes(med.name) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleItem(med.name, medications, setMedications)}
                title={med.interactions}
              >
                {med.name}
                {medications.includes(med.name) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={S.medications.placeholderAddOther}
              value={customMedication}
              onChange={(e) => setCustomMedication(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addCustomItem(customMedication, medications, setMedications, setCustomMedication)
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="bg-transparent"
              onClick={() =>
                addCustomItem(customMedication, medications, setMedications, setCustomMedication)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {medications.filter((m) => !(COMMON_MEDICATIONS.map((med) => med.name) as string[]).includes(m)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {medications
                .filter((m) => !(COMMON_MEDICATIONS.map((med) => med.name) as string[]).includes(m))
                .map((medication) => (
                  <Badge
                    key={medication}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => toggleItem(medication, medications, setMedications)}
                  >
                    {medication}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          )}
          {medications.length > 0 && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1 text-foreground">{S.medications.foodInteractionWarnings}</p>
              <ul className="list-disc list-inside space-y-1">
                {medications.map((m) => {
                  const med = COMMON_MEDICATIONS.find((medication) => medication.name === m);
                  return med ? (
                    <li key={m}>
                      <span className="font-medium">{m}:</span> {med.interactions}
                    </li>
                  ) : (
                    <li key={m}>
                      <span className="font-medium">{m}:</span> {S.medications.willCheckInteractions}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <SectionHeader title={S.sections.reality} />
      {/* Fridge Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Snowflake className="h-5 w-5 text-chart-2" />
            {S.fridge.title}
          </CardTitle>
          <CardDescription>
            {S.fridge.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fridgeItem">{S.fridge.labelAddItems}</Label>
            <div className="flex gap-2">
              <Input
                id="fridgeItem"
                placeholder={S.fridge.placeholderFridge}
                value={currentFridgeItem}
                onChange={(e) => setCurrentFridgeItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFridgeItem();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-transparent"
                onClick={addFridgeItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              These items will be excluded from your shopping list.
            </p>
          </div>
          {fridgeInventory.length > 0 && (
            <div className="space-y-2">
              <Label>Items in Your Fridge/Pantry ({fridgeInventory.length})</Label>
              <div className="flex flex-wrap gap-2">
                {fridgeInventory.map((item, index) => (
                  <Badge
                    key={`${item}-${index}`}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeFridgeItem(item)}
                  >
                    {item}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal Service Meals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Box className="h-5 w-5 text-chart-1" />
            {S.mealService.title}
          </CardTitle>
          <CardDescription>
            {S.mealService.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>{S.mealService.labelUploadScreenshots}</Label>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="meal-image-upload"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
              >
                {isParsingImage ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Analyzing your meals...</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CloudUpload className="h-6 w-6 text-muted-foreground" />
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Click to upload meal service screenshots</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, or screenshots from HelloFresh, Factor, Blue Apron, etc.
                    </span>
                  </>
                )}
                <input
                  id="meal-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isParsingImage}
                />
              </label>
            </div>

            {/* Uploaded Images Preview */}
            {mealServiceImages.length > 0 && (
              <div className="space-y-2">
                <Label>{S.mealService.uploadedScreenshots(mealServiceImages.length)}</Label>
                <div className="flex flex-wrap gap-2">
                  {mealServiceImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden border"
                    >
                      <img
                        src={img.preview || "/placeholder.svg"}
                        alt={img.name}
                        className="h-20 w-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or type manually</span>
            </div>
          </div>

          {/* Manual Text Entry */}
          <div className="space-y-2">
            <Label htmlFor="mealServiceMeal">Add a meal manually</Label>
            <div className="flex gap-2">
              <Textarea
                id="mealServiceMeal"
                placeholder="e.g., Monday dinner: Teriyaki salmon with steamed vegetables..."
                value={currentMealServiceMeal}
                onChange={(e) => setCurrentMealServiceMeal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMealServiceMeal();
                  }
                }}
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-auto bg-transparent"
                onClick={addMealServiceMeal}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Parsed/Added Meals List */}
          {mealServiceMeals.length > 0 && (
            <div className="space-y-2">
              <Label>{S.mealService.mealsFromService(mealServiceMeals.length)}</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
                {mealServiceMeals.map((meal, index) => (
                  <div
                    key={`${meal}-${index}`}
                    className="flex items-start justify-between gap-2 rounded-md bg-muted p-2"
                  >
                    <span className="text-sm">{meal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeMealServiceMeal(meal)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                These meals will be considered when planning your week to avoid duplicates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eating Out / Ordering In */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Navigation className="h-5 w-5 text-chart-5" />
            {S.eatingOut.title}
          </CardTitle>
          <CardDescription>
            {S.eatingOut.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>{S.eatingOut.labelSelectMeals}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {S.days.map((day) => (
                <div key={day} className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                      const mealKey = `${day} ${meal}`;
                      const isSelected = eatingOutMeals.includes(mealKey);
                      return (
                        <Badge
                          key={mealKey}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => {
                            setEatingOutMeals((prev) =>
                              isSelected
                                ? prev.filter((m) => m !== mealKey)
                                : [...prev, mealKey]
                            );
                          }}
                        >
                          {meal}
                          {isSelected && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {eatingOutMeals.length > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  {S.eatingOut.mealsSkipped(eatingOutMeals.length)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Number of people - for ingredients & portions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-chart-4" />
            {S.numberOfPeople.title}
          </CardTitle>
          <CardDescription>
            {S.numberOfPeople.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="numberOfPeople" className="text-base font-medium">
                {S.numberOfPeople.labelPeople}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="numberOfPeople"
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="w-16 text-center"
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <Slider
              value={[numberOfPeople]}
              onValueChange={([val]) => setNumberOfPeople(val)}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SectionHeader title="Additional notes" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            Anything else we should know?
          </CardTitle>
          <CardDescription>
            e.g. time constraints, budget, household size, or anything else we should know
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="additionalNotes"
            placeholder="e.g., Prefer quick meals under 30 minutes, cooking for 2 people, budget-friendly options..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <Button
        className="w-full bg-gradient-to-r from-primary via-accent to-chart-4 hover:opacity-90 transition-opacity text-primary-foreground font-semibold"
        size="lg"
        onClick={handleSubmit}
        disabled={isLoading || !isValidMacros}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Orbit className="h-5 w-5 animate-spin" />
            {S.submit.generating}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {S.submit.launchPlan}
          </span>
        )}
      </Button>
    </div>
  );
}
