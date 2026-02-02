import { normalizePreferences, selectMeal, type MealPreferences } from "@/lib/meal-filter";
import { generateShoppingList } from "@/lib/shopping-list";
import { Meal, coerceToMeal } from "@/lib/meal-database";
import { promptLlmWithTemplate, parseJsonFromLlmResponse } from "@/lib/prompt-llm";

// Vercel: use Node runtime (required for fs, long fetch). Pro allows 60s; Hobby allows 10s.
export const runtime = "nodejs";
export const maxDuration = 60;

/** Save LLM response to file (local only). Skipped on Vercel (read-only fs). */
async function saveLlmResponseToFile(responseText: string): Promise<void> {
  if (process.env.VERCEL) return;
  try {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 23);
    const outDir = path.join(process.cwd(), "outputs");
    await mkdir(outDir, { recursive: true });
    const filePath = path.join(outDir, `response_${timestamp}.txt`);
    await writeFile(filePath, responseText, "utf-8");
  } catch (err) {
    console.warn("Could not save LLM response to file:", err);
  }
}

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Create placeholder meal for eating out
function createEatingOutMeal(mealType: "breakfast" | "lunch" | "dinner"): Meal {
  return {
    id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: "Eating Out",
    description: "This meal slot is reserved for dining out or ordering in",
    prepTime: "0 min",
    servings: 1,
    tags: ["Eating Out"],
    ingredients: [],
    mealType,
    cuisine: [],
    proteinSources: [],
    carbSources: [],
    fatSources: [],
    estimatedCalories: 0,
    estimatedProtein: 0,
    estimatedCarbs: 0,
    estimatedFats: 0,
    containsAllergens: [],
    dietaryRestrictions: [],
    medicalFriendly: [],
    medicationSafe: [],
  };
}

// Check if a meal slot should be eating out
function isEatingOut(day: string, mealType: "breakfast" | "lunch" | "dinner", eatingOutMeals: string[]): boolean {
  const mealKey = `${day} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
  return eatingOutMeals.includes(mealKey);
}

// Build variables for the weekly meal-plan prompt from user preferences
function buildWeeklyPlanPromptVariables(preferences: MealPreferences): Record<string, string | number | string[]> {
  return {
    calories: preferences.calories,
    proteinPercent: preferences.proteinPercent,
    carbsPercent: preferences.carbsPercent,
    fatsPercent: preferences.fatsPercent,
    proteinSources: preferences.proteinSources,
    carbSources: preferences.carbSources,
    fatSources: preferences.fatSources,
    allergies: preferences.allergies,
    restrictions: preferences.restrictions,
    medicalConditions: preferences.medicalConditions,
    medications: preferences.medications,
    cuisines: preferences.cuisines,
    cuisineNotes: preferences.cuisineNotes,
    fridgeInventory: preferences.fridgeInventory,
    mealExamples: preferences.mealExamples,
    additionalNotes: preferences.additionalNotes,
  };
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const preferences: MealPreferences = normalizePreferences(raw);
    const apiKey = (process.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_KEY ?? "").trim().replace(/^["']|["']$/g, "");
    const useLlm = !!apiKey;
    let fallbackReason: "no_api_key" | "llm_error" | null = useLlm ? null : "no_api_key";

    if (!useLlm) {
      console.warn(
        "[generate-meal-plan] OPENROUTER_API_KEY not set. Add it in Vercel → Project → Settings → Environment Variables (Production), then redeploy."
      );
    }

    if (useLlm) {
      try {
        const variables = buildWeeklyPlanPromptVariables(preferences);
        const responseText = await promptLlmWithTemplate("generate-weekly-meal-plan.txt", variables);
        await saveLlmResponseToFile(responseText);
        const parsed = parseJsonFromLlmResponse(responseText);
        const rawMeals = Array.isArray(parsed) ? parsed : [];
        const meals: Meal[] = rawMeals.slice(0, 21).map((obj, i) => {
          const prefix = i < 7 ? "bf" : i < 14 ? "ln" : "dn";
          return coerceToMeal(obj, prefix);
        });

        const weeklyPlan: DayPlan[] = [];
        const allMeals: Meal[] = [];

        for (let i = 0; i < 7; i++) {
          const day = DAYS_OF_WEEK[i];
          const breakfast = isEatingOut(day, "breakfast", preferences.eatingOutMeals)
            ? createEatingOutMeal("breakfast")
            : meals[i] ?? createEatingOutMeal("breakfast");
          const lunch = isEatingOut(day, "lunch", preferences.eatingOutMeals)
            ? createEatingOutMeal("lunch")
            : meals[7 + i] ?? createEatingOutMeal("lunch");
          const dinner = isEatingOut(day, "dinner", preferences.eatingOutMeals)
            ? createEatingOutMeal("dinner")
            : meals[14 + i] ?? createEatingOutMeal("dinner");

          if (breakfast.name !== "Eating Out") allMeals.push(breakfast);
          if (lunch.name !== "Eating Out") allMeals.push(lunch);
          if (dinner.name !== "Eating Out") allMeals.push(dinner);

          weeklyPlan.push({ day, breakfast, lunch, dinner });
        }

        const shoppingList = generateShoppingList(allMeals, preferences.fridgeInventory);
        return Response.json({ plan: weeklyPlan, shoppingList, usedLlm: true });
      } catch (llmError) {
        fallbackReason = "llm_error";
        const message = llmError instanceof Error ? llmError.message : String(llmError);
        console.error("[generate-meal-plan] LLM failed, falling back to static database:", message);
        if (message.includes("timeout") || message.includes("aborted")) {
          console.warn(
            "[generate-meal-plan] Tip: Vercel Hobby allows 10s; Pro allows 60s. Set OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct for faster responses."
          );
        }
        // Fall through to static plan
      }
    }

    const weeklyPlan: DayPlan[] = [];
    const allMeals: Meal[] = [];
    const usedMealNames: string[] = [];

    for (const day of DAYS_OF_WEEK) {
      const breakfast = isEatingOut(day, "breakfast", preferences.eatingOutMeals)
        ? createEatingOutMeal("breakfast")
        : selectMeal("breakfast", preferences, usedMealNames);
      const lunch = isEatingOut(day, "lunch", preferences.eatingOutMeals)
        ? createEatingOutMeal("lunch")
        : selectMeal("lunch", preferences, usedMealNames);
      const dinner = isEatingOut(day, "dinner", preferences.eatingOutMeals)
        ? createEatingOutMeal("dinner")
        : selectMeal("dinner", preferences, usedMealNames);

      if (breakfast.name !== "Eating Out") {
        usedMealNames.push(breakfast.name);
        allMeals.push(breakfast);
      }
      if (lunch.name !== "Eating Out") {
        usedMealNames.push(lunch.name);
        allMeals.push(lunch);
      }
      if (dinner.name !== "Eating Out") {
        usedMealNames.push(dinner.name);
        allMeals.push(dinner);
      }
      weeklyPlan.push({ day, breakfast, lunch, dinner });
    }

    const shoppingList = generateShoppingList(allMeals, preferences.fridgeInventory);
    return Response.json({ plan: weeklyPlan, shoppingList, usedLlm: false, fallbackReason: fallbackReason ?? undefined });
  } catch (error) {
    console.error("Failed to generate meal plan:", error);
    return Response.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
