import { normalizePreferences, selectMeal, type MealPreferences } from "@/lib/meal-filter";
import { generateShoppingList } from "@/lib/shopping-list";
import { Meal, coerceToMeal } from "@/lib/meal-database";
import { promptLlmWithTemplate, parseJsonFromLlmResponse } from "@/lib/prompt-llm";

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
    const useLlm = !!process.env.OPENROUTER_API_KEY;

    if (useLlm) {
      try {
        const variables = buildWeeklyPlanPromptVariables(preferences);
        const responseText = await promptLlmWithTemplate("generate-weekly-meal-plan.txt", variables);
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
        return Response.json({ plan: weeklyPlan, shoppingList });
      } catch (llmError) {
        console.error("LLM meal plan failed, falling back to static database:", llmError);
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
    return Response.json({ plan: weeklyPlan, shoppingList });
  } catch (error) {
    console.error("Failed to generate meal plan:", error);
    return Response.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
