import { generateObject } from "ai";
import { z } from "zod";

const mealSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prepTime: z.string(),
  servings: z.number(),
  tags: z.array(z.string()),
  ingredients: z.array(z.string()),
});

export async function POST(req: Request) {
  const {
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
    mealType,
    currentMealName,
  } = await req.json();

  const proteinGrams = Math.round((calories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercent / 100)) / 4);
  const fatsGrams = Math.round((calories * (fatsPercent / 100)) / 9);

  const mealCaloriePercent = mealType === "breakfast" ? 25 : mealType === "lunch" ? 35 : 40;

  const { object } = await generateObject({
    model: "anthropic/claude-sonnet-4-20250514",
    schema: mealSchema,
    prompt: `You are a professional nutritionist and meal planner. Generate a single ${mealType} meal that is DIFFERENT from "${currentMealName}".

DAILY NUTRITIONAL TARGETS:
- Total Calories: ${calories} kcal/day
- Protein: ${proteinPercent}% (${proteinGrams}g/day)
- Carbohydrates: ${carbsPercent}% (${carbsGrams}g/day)
- Fats: ${fatsPercent}% (${fatsGrams}g/day)
- This ${mealType} should be approximately ${mealCaloriePercent}% of daily calories

PREFERRED PROTEIN SOURCES: ${proteinSources?.length > 0 ? proteinSources.join(", ") : "Any protein sources"}

PREFERRED CARBOHYDRATE SOURCES: ${carbSources?.length > 0 ? carbSources.join(", ") : "Any carb sources"}

PREFERRED FAT SOURCES: ${fatSources?.length > 0 ? fatSources.join(", ") : "Any fat sources"}

FOOD ALLERGIES (STRICTLY AVOID): ${allergies?.length > 0 ? allergies.join(", ") : "None"}

MEDICAL CONDITIONS (IMPORTANT - adapt meals accordingly): ${medicalConditions?.length > 0 ? medicalConditions.join(", ") : "None"}

CURRENT MEDICATIONS (check for food-drug interactions): ${medications?.length > 0 ? medications.join(", ") : "None"}
${medications?.length > 0 ? "Avoid foods that interact negatively with these medications (e.g., grapefruit with statins, vitamin K with warfarin, tyramine with MAOIs)" : ""}

DIETARY RESTRICTIONS: ${restrictions?.length > 0 ? restrictions.join(", ") : "None specified"}

PREFERRED CUISINES: ${cuisines?.length > 0 ? cuisines.join(", ") : "Any cuisine"}

CUISINE & FLAVOR PREFERENCES: ${cuisineNotes || "Not specified"}

USER'S RECIPE INVENTORY (consider using one of these): ${recipeInventory?.length > 0 ? recipeInventory.join("; ") : "None provided"}

ITEMS IN FRIDGE/PANTRY (prefer using these): ${fridgeInventory?.length > 0 ? fridgeInventory.join(", ") : "None specified"}

MEALS FROM DELIVERY SERVICE (avoid duplicating): ${mealServiceMeals?.length > 0 ? mealServiceMeals.join("; ") : "None"}

MEALS EATING OUT (for reference, avoid similar styles): ${eatingOutMeals?.length > 0 ? eatingOutMeals.join(", ") : "None"}

MEALS THE USER ENJOYS: ${mealExamples || "Not specified"}

ADDITIONAL NOTES: ${additionalNotes || "None"}

The meal should:
- Be appropriate for ${mealType}
- STRICTLY AVOID all listed allergies - this is critical for safety
- CAREFULLY consider medical conditions and adapt the meal accordingly
- Respect ALL dietary restrictions
- Use the preferred ingredient sources when possible
- Incorporate the preferred cuisines and flavor preferences when possible
- Consider using a recipe from the user's inventory if appropriate
- Be inspired by the meal examples when relevant
- Include a realistic prep time
- Have 4-6 ingredients listed
- Include 2-3 relevant tags (like "High Protein", "Quick", "Comfort Food", etc.)
- Have a brief, appetizing description
- Be DIFFERENT from the current meal: "${currentMealName}"

Generate a unique ID for the meal.`,
  });

  return Response.json(object);
}
