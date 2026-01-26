import { normalizePreferences, selectMeal, type MealPreferences } from "@/lib/meal-filter";
import { generateShoppingList } from "@/lib/shopping-list";
import { Meal } from "@/lib/meal-database";

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
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

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const preferences: MealPreferences = normalizePreferences(raw);

  const weeklyPlan: DayPlan[] = [];
  const allMeals: Meal[] = [];
  const usedMealNames: string[] = [];

  // Generate meal plan for each day
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

    // Track used meals to avoid repetition
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

    weeklyPlan.push({
      day,
      breakfast,
      lunch,
      dinner,
    });
  }

  // Generate shopping list (exclude eating out meals)
  const shoppingList = generateShoppingList(allMeals, preferences.fridgeInventory);

    return Response.json({
      plan: weeklyPlan,
      shoppingList,
    });
  } catch (error) {
    console.error("Failed to generate meal plan:", error);
    return Response.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
