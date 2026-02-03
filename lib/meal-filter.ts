import { Meal, getMealsByType, generateMealId } from "./meal-database";

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
  /** How many times per week the user wants to cook (1–7). Used for batch-cooking suggestions (e.g. stew for 2 meals). */
  cookTimesPerWeek: number;
  /** How much to reuse the same ingredients across recipes (1–5). 1 = maximize reuse (save money/time, less shopping), 5 = lots of variety (more different ingredients). */
  ingredientVariety: number;
  mealExamples: string;
  additionalNotes: string;
}

export function normalizePreferences(input: Partial<MealPreferences>): MealPreferences {
  return {
    calories: typeof input.calories === "number" ? input.calories : 2000,
    proteinPercent: typeof input.proteinPercent === "number" ? input.proteinPercent : 30,
    carbsPercent: typeof input.carbsPercent === "number" ? input.carbsPercent : 40,
    fatsPercent: typeof input.fatsPercent === "number" ? input.fatsPercent : 30,
    proteinSources: Array.isArray(input.proteinSources) ? input.proteinSources : [],
    carbSources: Array.isArray(input.carbSources) ? input.carbSources : [],
    fatSources: Array.isArray(input.fatSources) ? input.fatSources : [],
    allergies: Array.isArray(input.allergies) ? input.allergies : [],
    medicalConditions: Array.isArray(input.medicalConditions) ? input.medicalConditions : [],
    medications: Array.isArray(input.medications) ? input.medications : [],
    restrictions: Array.isArray(input.restrictions) ? input.restrictions : [],
    cuisines: Array.isArray(input.cuisines) ? input.cuisines : [],
    cuisineNotes: typeof input.cuisineNotes === "string" ? input.cuisineNotes : "",
    recipeInventory: Array.isArray(input.recipeInventory) ? input.recipeInventory : [],
    fridgeInventory: Array.isArray(input.fridgeInventory) ? input.fridgeInventory : [],
    mealServiceMeals: Array.isArray(input.mealServiceMeals) ? input.mealServiceMeals : [],
    eatingOutMeals: Array.isArray(input.eatingOutMeals) ? input.eatingOutMeals : [],
    cookTimesPerWeek: typeof input.cookTimesPerWeek === "number" && input.cookTimesPerWeek >= 1 && input.cookTimesPerWeek <= 7
      ? Math.round(input.cookTimesPerWeek)
      : 7,
    ingredientVariety: typeof input.ingredientVariety === "number" && input.ingredientVariety >= 1 && input.ingredientVariety <= 5
      ? Math.round(input.ingredientVariety)
      : 3,
    mealExamples: typeof input.mealExamples === "string" ? input.mealExamples : "",
    additionalNotes: typeof input.additionalNotes === "string" ? input.additionalNotes : "",
  };
}

// Medication interaction rules
const MEDICATION_INTERACTIONS: Record<string, string[]> = {
  "Warfarin (Coumadin)": ["Leafy Greens", "Cranberry", "Grapefruit", "Vitamin K"],
  "Statins (Lipitor, Crestor)": ["Grapefruit"],
  "MAO Inhibitors": ["Aged Cheese", "Cured Meats", "Fermented Foods", "Soy Sauce"],
  "Lisinopril/ACE Inhibitors": ["Bananas", "Oranges", "Potatoes", "High Potassium"],
  "Levothyroxine (Synthroid)": ["Soy", "High-Fiber Foods", "Calcium"],
  "Methotrexate": ["Alcohol"],
  "Blood Thinners (Aspirin)": ["Vitamin E", "Fish Oil", "Garlic"],
  "Calcium Channel Blockers": ["Grapefruit"],
  "Antibiotics (Tetracycline)": ["Dairy Products"],
  "Potassium-Sparing Diuretics": ["Bananas", "Oranges", "Potatoes", "High Potassium"],
  "Lithium": [],
};

// Medical condition dietary requirements
const MEDICAL_REQUIREMENTS: Record<string, { avoid: string[]; prefer: string[] }> = {
  "Type 1 Diabetes": { avoid: ["High Sugar"], prefer: ["Low Glycemic"] },
  "Type 2 Diabetes": { avoid: ["High Sugar"], prefer: ["Low Glycemic", "High Fiber"] },
  "Hypertension": { avoid: ["High Sodium"], prefer: ["Low Sodium"] },
  "High Cholesterol": { avoid: ["High Saturated Fat"], prefer: ["High Fiber", "Low Fat"] },
  "Heart Disease": { avoid: ["High Sodium", "High Saturated Fat"], prefer: ["Heart-Healthy Fats"] },
  "Celiac Disease": { avoid: ["Wheat/Gluten"], prefer: ["Gluten-Free"] },
  "IBS": { avoid: ["High FODMAP"], prefer: ["Low FODMAP"] },
  "Crohn's Disease": { avoid: ["High Fiber"], prefer: ["Easy to Digest"] },
  "GERD/Acid Reflux": { avoid: ["Acidic", "Spicy", "Fatty"], prefer: ["Low Acid"] },
  "Kidney Disease": { avoid: ["High Sodium", "High Potassium", "High Phosphorus"], prefer: ["Low Sodium"] },
  "Gout": { avoid: ["High Purine"], prefer: ["Low Purine"] },
  "PCOS": { avoid: ["High Sugar"], prefer: ["Low Glycemic", "Anti-Inflammatory"] },
  "Hypothyroidism": { avoid: [], prefer: ["Iodine-Rich", "Selenium"] },
  "Anemia": { avoid: [], prefer: ["Iron-Rich", "Vitamin C"] },
  "Osteoporosis": { avoid: [], prefer: ["Calcium-Rich", "Vitamin D"] },
};

// Check if meal contains allergens
function hasAllergens(meal: Meal, allergies: string[]): boolean {
  if (allergies.length === 0) return false;
  return meal.containsAllergens.some((allergen) =>
    allergies.some((userAllergy) =>
      allergen.toLowerCase().includes(userAllergy.toLowerCase()) ||
      userAllergy.toLowerCase().includes(allergen.toLowerCase())
    )
  );
}

// Check if meal matches dietary restrictions
function matchesRestrictions(meal: Meal, restrictions: string[]): boolean {
  if (restrictions.length === 0) return true;

  // If user has specific restrictions, meal must match at least one
  const hasVegan = restrictions.includes("Vegan");
  const hasVegetarian = restrictions.includes("Vegetarian");
  const hasPescatarian = restrictions.includes("Pescatarian");
  const hasKeto = restrictions.includes("Keto");
  const hasPaleo = restrictions.includes("Paleo");
  const hasLowCarb = restrictions.includes("Low-Carb");
  const hasLowFat = restrictions.includes("Low-Fat");
  const hasLowSodium = restrictions.includes("Low-Sodium");
  const hasDiabeticFriendly = restrictions.includes("Diabetic-Friendly");

  // Check vegan
  if (hasVegan && !meal.dietaryRestrictions.includes("Vegan")) {
    return false;
  }

  // Check vegetarian (vegan meals also count as vegetarian)
  if (hasVegetarian && !hasVegan) {
    if (!meal.dietaryRestrictions.includes("Vegetarian") && !meal.dietaryRestrictions.includes("Vegan")) {
      return false;
    }
  }

  // Check pescatarian
  if (hasPescatarian) {
    const isPescatarian = meal.dietaryRestrictions.includes("Pescatarian") ||
      meal.proteinSources.some((p) => ["Fish", "Salmon", "Tuna", "Shrimp"].includes(p));
    if (!isPescatarian && !meal.dietaryRestrictions.includes("Vegetarian") && !meal.dietaryRestrictions.includes("Vegan")) {
      return false;
    }
  }

  // Check keto (very low carb, high fat)
  if (hasKeto) {
    const carbRatio = meal.estimatedCarbs / meal.estimatedCalories;
    if (carbRatio > 0.1) return false; // More than 10% carbs
  }

  // Check low-carb
  if (hasLowCarb) {
    const carbRatio = meal.estimatedCarbs / meal.estimatedCalories;
    if (carbRatio > 0.25) return false; // More than 25% carbs
  }

  // Check low-fat
  if (hasLowFat) {
    const fatRatio = meal.estimatedFats / meal.estimatedCalories;
    if (fatRatio > 0.2) return false; // More than 20% fat
  }

  // Check low-sodium (simplified - would need actual sodium data)
  if (hasLowSodium) {
    // Assume meals with processed ingredients are higher sodium
    const highSodiumIngredients = ["Soy Sauce", "Cured Meats", "Cheese", "Processed"];
    if (meal.ingredients.some((ing) => highSodiumIngredients.some((hsi) => ing.includes(hsi)))) {
      return false;
    }
  }

  // Check diabetic-friendly (low glycemic)
  if (hasDiabeticFriendly) {
    if (!meal.medicalFriendly.includes("Type 2 Diabetes")) {
      return false;
    }
  }

  return true;
}

// Check if meal is safe for medical conditions
function isMedicalFriendly(meal: Meal, medicalConditions: string[]): boolean {
  if (medicalConditions.length === 0) return true;

  // Check if meal is explicitly marked as friendly for any of the conditions
  return medicalConditions.some((condition) => meal.medicalFriendly.includes(condition));
}

// Check if meal is safe with medications
function isMedicationSafe(meal: Meal, medications: string[]): boolean {
  if (medications.length === 0) return true;

  for (const medication of medications) {
    const interactions = MEDICATION_INTERACTIONS[medication] || [];
    if (interactions.length > 0) {
      // Check if meal contains any interacting ingredients
      const mealIngredients = meal.ingredients.join(" ").toLowerCase();
      const hasInteraction = interactions.some((interaction) =>
        mealIngredients.includes(interaction.toLowerCase())
      );

      // Also check allergens that might interact
      const allergenInteractions: Record<string, string[]> = {
        "Warfarin (Coumadin)": ["Leafy Greens"],
        "Statins (Lipitor, Crestor)": ["Grapefruit"],
        "Lisinopril/ACE Inhibitors": ["Bananas", "Potatoes"],
      };

      const allergenList = allergenInteractions[medication] || [];
      const hasAllergenInteraction = allergenList.some((allergen) =>
        mealIngredients.includes(allergen.toLowerCase())
      );

      if (hasInteraction || hasAllergenInteraction) {
        return false;
      }
    }
  }

  return true;
}

// Check if meal matches preferred sources
function matchesPreferredSources(
  meal: Meal,
  proteinSources: string[],
  carbSources: string[],
  fatSources: string[]
): boolean {
  // If no preferences specified, all meals match
  if (proteinSources.length === 0 && carbSources.length === 0 && fatSources.length === 0) {
    return true;
  }

  // Check protein sources
  if (proteinSources.length > 0) {
    const hasPreferredProtein = meal.proteinSources.some((ps) =>
      proteinSources.some((ups) =>
        ps.toLowerCase().includes(ups.toLowerCase()) || ups.toLowerCase().includes(ps.toLowerCase())
      )
    );
    if (!hasPreferredProtein) return false;
  }

  // Check carb sources (more lenient - if meal has any preferred carb, it's good)
  if (carbSources.length > 0) {
    const hasPreferredCarb = meal.carbSources.some((cs) =>
      carbSources.some((ucs) =>
        cs.toLowerCase().includes(ucs.toLowerCase()) || ucs.toLowerCase().includes(cs.toLowerCase())
      )
    );
    // Don't fail if no preferred carbs - just prefer meals that have them
  }

  // Check fat sources (more lenient)
  if (fatSources.length > 0) {
    const hasPreferredFat = meal.fatSources.some((fs) =>
      fatSources.some((ufs) =>
        fs.toLowerCase().includes(ufs.toLowerCase()) || ufs.toLowerCase().includes(fs.toLowerCase())
      )
    );
    // Don't fail if no preferred fats - just prefer meals that have them
  }

  return true;
}

// Check if meal matches cuisine preferences
function matchesCuisine(meal: Meal, cuisines: string[]): boolean {
  if (cuisines.length === 0) return true;

  return cuisines.some((cuisine) =>
    meal.cuisine.some((mealCuisine) =>
      mealCuisine.toLowerCase().includes(cuisine.toLowerCase()) ||
      cuisine.toLowerCase().includes(mealCuisine.toLowerCase())
    )
  );
}

// Score meal based on preferences (higher = better match)
function scoreMeal(meal: Meal, preferences: MealPreferences): number {
  let score = 0;

  // Prefer meals that match preferred protein sources
  if (preferences.proteinSources.length > 0) {
    const hasPreferredProtein = meal.proteinSources.some((ps) =>
      preferences.proteinSources.some((ups) =>
        ps.toLowerCase().includes(ups.toLowerCase()) || ups.toLowerCase().includes(ps.toLowerCase())
      )
    );
    if (hasPreferredProtein) score += 10;
  }

  // Prefer meals that match preferred carb sources
  if (preferences.carbSources.length > 0) {
    const hasPreferredCarb = meal.carbSources.some((cs) =>
      preferences.carbSources.some((ucs) =>
        cs.toLowerCase().includes(ucs.toLowerCase()) || ucs.toLowerCase().includes(cs.toLowerCase())
      )
    );
    if (hasPreferredCarb) score += 5;
  }

  // Prefer meals that match preferred fat sources
  if (preferences.fatSources.length > 0) {
    const hasPreferredFat = meal.fatSources.some((fs) =>
      preferences.fatSources.some((ufs) =>
        fs.toLowerCase().includes(ufs.toLowerCase()) || ufs.toLowerCase().includes(fs.toLowerCase())
      )
    );
    if (hasPreferredFat) score += 5;
  }

  // Prefer meals that match cuisine preferences
  if (preferences.cuisines.length > 0) {
    const matchesCuisine = meal.cuisine.some((c) =>
      preferences.cuisines.some((uc) =>
        c.toLowerCase().includes(uc.toLowerCase()) || uc.toLowerCase().includes(c.toLowerCase())
      )
    );
    if (matchesCuisine) score += 8;
  }

  // Prefer meals that use fridge inventory items
  if (preferences.fridgeInventory.length > 0) {
    const usesFridgeItems = preferences.fridgeInventory.some((item) =>
      meal.ingredients.some((ing) => ing.toLowerCase().includes(item.toLowerCase()))
    );
    if (usesFridgeItems) score += 15;
  }

  // Prefer meals from recipe inventory (if meal name matches)
  if (preferences.recipeInventory.length > 0) {
    const matchesRecipe = preferences.recipeInventory.some((recipe) =>
      meal.name.toLowerCase().includes(recipe.toLowerCase()) ||
      recipe.toLowerCase().includes(meal.name.toLowerCase())
    );
    if (matchesRecipe) score += 20;
  }

  return score;
}

// Filter an arbitrary pool of meals (e.g. LLM-generated) by type and preferences.
// Uses the same rules as filterMeals but on the provided array instead of MEAL_DATABASE.
export function filterMealsFromPool(
  mealType: "breakfast" | "lunch" | "dinner",
  preferences: MealPreferences,
  mealPool: Meal[],
  excludeMealNames: string[] = []
): Meal[] {
  let meals = mealPool.filter((m) => m.mealType === mealType);

  // Filter out excluded meals
  meals = meals.filter((meal) => !excludeMealNames.includes(meal.name));

  // Filter by allergies (strict - must exclude)
  meals = meals.filter((meal) => !hasAllergens(meal, preferences.allergies));

  // Filter by dietary restrictions
  meals = meals.filter((meal) => matchesRestrictions(meal, preferences.restrictions));

  // Filter by medical conditions
  if (preferences.medicalConditions.length > 0) {
    meals = meals.filter((meal) => isMedicalFriendly(meal, preferences.medicalConditions));
  }

  // Filter by medications
  meals = meals.filter((meal) => isMedicationSafe(meal, preferences.medications));

  // Filter by preferred protein sources (must match if specified)
  if (preferences.proteinSources.length > 0) {
    meals = meals.filter((meal) => matchesPreferredSources(meal, preferences.proteinSources, [], []));
  }

  // Score and sort meals
  const scoredMeals = meals.map((meal) => ({
    meal,
    score: scoreMeal(meal, preferences),
  }));

  // Sort by score (highest first)
  scoredMeals.sort((a, b) => b.score - a.score);

  return scoredMeals.map((item) => item.meal);
}

// Filter meals based on preferences (uses static MEAL_DATABASE)
export function filterMeals(
  mealType: "breakfast" | "lunch" | "dinner",
  preferences: MealPreferences,
  excludeMealNames: string[] = []
): Meal[] {
  return filterMealsFromPool(mealType, preferences, getMealsByType(mealType), excludeMealNames);
}

// Select a meal from a pool (e.g. LLM-generated) that matches preferences.
export function selectMealFromPool(
  mealType: "breakfast" | "lunch" | "dinner",
  preferences: MealPreferences,
  mealPool: Meal[],
  excludeMealNames: string[] = []
): Meal | null {
  const filtered = filterMealsFromPool(mealType, preferences, mealPool, excludeMealNames);
  if (filtered.length === 0) return null;
  const topMeals = filtered.slice(0, Math.min(5, filtered.length));
  const selected = topMeals[Math.floor(Math.random() * topMeals.length)];
  return { ...selected, id: generateMealId(mealType.substring(0, 2)) };
}

// Select a random meal from filtered list
export function selectMeal(
  mealType: "breakfast" | "lunch" | "dinner",
  preferences: MealPreferences,
  excludeMealNames: string[] = []
): Meal {
  const filtered = filterMeals(mealType, preferences, excludeMealNames);

  if (filtered.length === 0) {
    // Fallback: return any meal of the type (safety net)
    const allMeals = getMealsByType(mealType);
    const fallback = allMeals[Math.floor(Math.random() * allMeals.length)];
    return {
      ...fallback,
      id: generateMealId(mealType.substring(0, 2)),
    };
  }

  // Prefer top-scored meals, but add some randomness
  const topMeals = filtered.slice(0, Math.min(5, filtered.length));
  const selected = topMeals[Math.floor(Math.random() * topMeals.length)];

  return {
    ...selected,
    id: generateMealId(mealType.substring(0, 2)),
  };
}
