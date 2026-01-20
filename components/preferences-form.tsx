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
  Beef, Wheat, Droplets, Globe, Cookie, Sparkles, ShieldAlert, Orbit, Library, Pill 
} from "lucide-react";

const PROTEIN_SOURCES = [
  "Chicken",
  "Beef",
  "Pork",
  "Fish",
  "Shrimp",
  "Eggs",
  "Tofu",
  "Tempeh",
  "Legumes",
  "Greek Yogurt",
  "Cottage Cheese",
  "Turkey",
  "Lamb",
  "Salmon",
  "Tuna",
];

const CARB_SOURCES = [
  "Rice",
  "Pasta",
  "Bread",
  "Potatoes",
  "Sweet Potatoes",
  "Quinoa",
  "Oats",
  "Beans",
  "Lentils",
  "Fruit",
  "Corn",
  "Couscous",
  "Barley",
  "Bulgur",
];

const FAT_SOURCES = [
  "Olive Oil",
  "Avocado",
  "Nuts",
  "Seeds",
  "Butter",
  "Coconut Oil",
  "Cheese",
  "Dark Chocolate",
  "Nut Butters",
  "Fatty Fish",
  "Whole Eggs",
  "Ghee",
];

const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk/Dairy",
  "Eggs",
  "Wheat/Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Celery",
  "Sulfites",
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Low-Fat",
  "Halal",
  "Kosher",
  "Low-Sodium",
  "Diabetic-Friendly",
];

const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "Indian",
  "American",
  "French",
  "Thai",
  "Japanese",
  "Greek",
  "Middle Eastern",
  "Korean",
];

const MEDICAL_CONDITIONS = [
  { name: "Type 1 Diabetes", tip: "Low glycemic index foods, consistent carb intake" },
  { name: "Type 2 Diabetes", tip: "Low sugar, low glycemic, high fiber" },
  { name: "Hypertension", tip: "Low sodium, DASH diet friendly" },
  { name: "High Cholesterol", tip: "Low saturated fat, high fiber" },
  { name: "Heart Disease", tip: "Heart-healthy fats, low sodium" },
  { name: "Celiac Disease", tip: "Strict gluten-free" },
  { name: "IBS", tip: "Low FODMAP options" },
  { name: "Crohn's Disease", tip: "Easy to digest, low fiber during flares" },
  { name: "GERD/Acid Reflux", tip: "Avoid acidic, spicy, fatty foods" },
  { name: "Kidney Disease", tip: "Low sodium, potassium, phosphorus" },
  { name: "Gout", tip: "Low purine foods" },
  { name: "PCOS", tip: "Low glycemic, anti-inflammatory" },
  { name: "Hypothyroidism", tip: "Iodine-rich, selenium foods" },
  { name: "Anemia", tip: "Iron-rich foods with vitamin C" },
  { name: "Osteoporosis", tip: "Calcium and vitamin D rich" },
];

const COMMON_MEDICATIONS = [
  { name: "Warfarin (Coumadin)", interactions: "Avoid vitamin K-rich foods (leafy greens), limit cranberry, avoid grapefruit" },
  { name: "Statins (Lipitor, Crestor)", interactions: "Avoid grapefruit and grapefruit juice" },
  { name: "MAO Inhibitors", interactions: "Avoid tyramine-rich foods (aged cheese, cured meats, fermented foods, soy sauce)" },
  { name: "Metformin", interactions: "Limit alcohol, take with food to reduce stomach upset" },
  { name: "Lisinopril/ACE Inhibitors", interactions: "Avoid high potassium foods (bananas, oranges, potatoes)" },
  { name: "Levothyroxine (Synthroid)", interactions: "Avoid soy, high-fiber foods, calcium, and coffee near dose time" },
  { name: "Methotrexate", interactions: "Avoid alcohol, increase folic acid intake" },
  { name: "Blood Thinners (Aspirin)", interactions: "Limit vitamin E supplements, fish oil, garlic supplements" },
  { name: "Calcium Channel Blockers", interactions: "Avoid grapefruit and grapefruit juice" },
  { name: "Antibiotics (Tetracycline)", interactions: "Avoid dairy products near dose time" },
  { name: "Potassium-Sparing Diuretics", interactions: "Limit high potassium foods" },
  { name: "Lithium", interactions: "Maintain consistent sodium and caffeine intake" },
];

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
      mealExamples,
      additionalNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Calories & Macros */}
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
          {/* Calories */}
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
                <span className="text-sm text-muted-foreground">kcal</span>
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

          {/* Macro Distribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Macro Distribution</Label>
              {!isValidMacros && (
                <span className="text-xs text-destructive">
                  Total: {totalPercent}% (must equal 100%)
                </span>
              )}
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Protein</span>
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

            {/* Carbs */}
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

            {/* Fats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Fats</span>
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

            {/* Macro Summary Bar */}
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

      {/* Protein Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Beef className="h-5 w-5 text-chart-3" />
            Preferred Protein Sources
          </CardTitle>
          <CardDescription>
            Select the protein sources you enjoy eating
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
            Preferred Fat Sources
          </CardTitle>
          <CardDescription>
            Select the healthy fat sources you like
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

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Food Allergies
          </CardTitle>
          <CardDescription>
            Select any food allergies we should avoid
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
          {allergies.filter((a) => !COMMON_ALLERGIES.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies
                .filter((a) => !COMMON_ALLERGIES.includes(a))
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
            Medical Conditions
          </CardTitle>
          <CardDescription>
            Select any medical conditions that may influence your food choices
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
              <p className="font-medium mb-1">Dietary considerations for selected conditions:</p>
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
              placeholder="Add other medication..."
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
          {medications.filter((m) => !COMMON_MEDICATIONS.map((med) => med.name).includes(m)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {medications
                .filter((m) => !COMMON_MEDICATIONS.map((med) => med.name).includes(m))
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
              <p className="font-medium mb-1 text-foreground">Food interaction warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {medications.map((m) => {
                  const med = COMMON_MEDICATIONS.find((medication) => medication.name === m);
                  return med ? (
                    <li key={m}>
                      <span className="font-medium">{m}:</span> {med.interactions}
                    </li>
                  ) : (
                    <li key={m}>
                      <span className="font-medium">{m}:</span> Will check for common interactions
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Atom className="h-5 w-5 text-primary" />
            Dietary Restrictions
          </CardTitle>
          <CardDescription>
            Select any dietary restrictions or preferences
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
              placeholder="Add other restriction..."
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
          {restrictions.filter((r) => !DIETARY_RESTRICTIONS.includes(r)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restrictions
                .filter((r) => !DIETARY_RESTRICTIONS.includes(r))
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

      {/* Cuisine Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-accent" />
            Cuisine Preferences
          </CardTitle>
          <CardDescription>
            Select the cuisines you enjoy and describe your flavor preferences
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
              Describe your cuisine and flavor preferences
            </Label>
            <Textarea
              id="cuisineNotes"
              placeholder="e.g., I love spicy food, prefer lighter sauces over creamy ones, enjoy fusion dishes that combine Asian and Mexican flavors, prefer grilled over fried..."
              value={cuisineNotes}
              onChange={(e) => setCuisineNotes(e.target.value)}
              rows={3}
            />
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
              Press Enter or click + to add. These recipes will be considered when generating your meal plan.
            </p>
          </div>
          {recipeInventory.length > 0 && (
            <div className="space-y-2">
              <Label>Your Saved Recipes ({recipeInventory.length})</Label>
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

      {/* Fridge Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Snowflake className="h-5 w-5 text-chart-2" />
            Fridge Inventory
          </CardTitle>
          <CardDescription>
            Add items you already have at home to help plan your shopping list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fridgeItem">Add items from your fridge/pantry</Label>
            <div className="flex gap-2">
              <Input
                id="fridgeItem"
                placeholder="e.g., eggs, milk, chicken breast, rice, olive oil..."
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
            Meal Plan Service
          </CardTitle>
          <CardDescription>
            Add meals you're receiving from a meal delivery service this week - upload screenshots or type them manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>Upload Screenshots</Label>
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
                <Label>Uploaded Screenshots ({mealServiceImages.length})</Label>
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
              <Label>Meals from Your Service ({mealServiceMeals.length})</Label>
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
            Eating Out / Ordering In
          </CardTitle>
          <CardDescription>
            Select which meals you plan to eat at restaurants or order in this week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Select meals you will eat out or order in</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
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
                  <span className="font-medium text-foreground">{eatingOutMeals.length}</span> meal{eatingOutMeals.length !== 1 ? "s" : ""} will be skipped in your plan. No groceries will be added for these meals.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meal Examples & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Cookie className="h-5 w-5 text-primary" />
            Meal Examples & Notes
          </CardTitle>
          <CardDescription>
            Share meals you enjoy to help us understand your taste - upload photos or type them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label>Upload Photos of Meals You Enjoy</Label>
            <label
              htmlFor="example-image-upload"
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
            >
              {isParsingExampleImage ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing your meal photos...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Upload photos of meals you love</span>
                  <span className="text-xs text-muted-foreground">
                    Restaurant dishes, home-cooked meals, recipes from Pinterest, etc.
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

            {/* Uploaded Images Preview */}
            {mealExampleImages.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Photos ({mealExampleImages.length})</Label>
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or describe meals</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealExamples">
              Meals you enjoy
            </Label>
            <Textarea
              id="mealExamples"
              placeholder="e.g., Grilled salmon with vegetables, Chicken stir-fry, Quinoa salad with feta..."
              value={mealExamples}
              onChange={(e) => setMealExamples(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Meals from uploaded photos will appear here automatically
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              placeholder="e.g., Prefer quick meals under 30 minutes, cooking for 2 people, budget-friendly options..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
            />
          </div>
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
            Generating your cosmic meal plan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Launch Weekly Meal Plan
          </span>
        )}
      </Button>
    </div>
  );
}
