import { normalizePreferences, selectMeal, type MealPreferences } from "@/lib/meal-filter";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const mealType = raw?.mealType;
    const currentMealName = typeof raw?.currentMealName === "string" ? raw.currentMealName : "";

    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      return Response.json(
        { error: "Invalid meal type" },
        { status: 400 }
      );
    }

    const mealPrefs: MealPreferences = normalizePreferences(raw);

    // Select a new meal, excluding the current one
    const newMeal = selectMeal(mealType, mealPrefs, [currentMealName]);

    return Response.json(newMeal);
  } catch (error) {
    console.error("Failed to regenerate meal:", error);
    return Response.json(
      { error: "Failed to regenerate meal" },
      { status: 500 }
    );
  }
}
