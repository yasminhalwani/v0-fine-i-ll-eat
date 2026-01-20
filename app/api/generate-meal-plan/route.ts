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

const dayPlanSchema = z.object({
  day: z.string(),
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
});

const shoppingItemSchema = z.object({
  item: z.string(),
  quantity: z.string(),
  category: z.string(),
});

const weeklyPlanSchema = z.object({
  plan: z.array(dayPlanSchema),
  shoppingList: z.array(shoppingItemSchema),
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
  } = await req.json();

  const proteinGrams = Math.round((calories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercent / 100)) / 4);
  const fatsGrams = Math.round((calories * (fatsPercent / 100)) / 9);

  const { object } = await generateObject({
    model: "anthropic/claude-sonnet-4-20250514",
    schema: weeklyPlanSchema,
    prompt: `You are a professional nutritionist and meal planner. Create a complete weekly meal plan (Monday through Sunday) based on the following preferences:

DAILY NUTRITIONAL TARGETS:
- Total Calories: ${calories} kcal/day
- Protein: ${proteinPercent}% (${proteinGrams}g/day)
- Carbohydrates: ${carbsPercent}% (${carbsGrams}g/day)
- Fats: ${fatsPercent}% (${fatsGrams}g/day)

PREFERRED PROTEIN SOURCES: ${proteinSources.length > 0 ? proteinSources.join(", ") : "Any protein sources"}

PREFERRED CARBOHYDRATE SOURCES: ${carbSources.length > 0 ? carbSources.join(", ") : "Any carb sources"}

PREFERRED FAT SOURCES: ${fatSources.length > 0 ? fatSources.join(", ") : "Any fat sources"}

FOOD ALLERGIES (STRICTLY AVOID): ${allergies.length > 0 ? allergies.join(", ") : "None"}

MEDICAL CONDITIONS (IMPORTANT - adapt meals accordingly): ${medicalConditions?.length > 0 ? medicalConditions.join(", ") : "None"}
${medicalConditions?.length > 0 ? "Consider the dietary implications of these conditions when planning meals (e.g., low glycemic for diabetes, low sodium for hypertension, low purine for gout, etc.)" : ""}

CURRENT MEDICATIONS (CRITICAL - check for food-drug interactions): ${medications?.length > 0 ? medications.join(", ") : "None"}
${medications?.length > 0 ? `IMPORTANT: Avoid foods that interact negatively with these medications. Common interactions to watch for:
- Warfarin: Avoid high vitamin K foods (leafy greens), grapefruit, cranberry
- Statins: Avoid grapefruit and grapefruit juice
- MAO Inhibitors: Avoid tyramine-rich foods (aged cheese, cured meats, fermented foods, soy sauce)
- ACE Inhibitors/Lisinopril: Limit high potassium foods (bananas, oranges, potatoes)
- Levothyroxine: Avoid soy, high-fiber foods, calcium near dose time
- Methotrexate: Avoid alcohol
- Blood thinners: Limit vitamin E, excessive garlic, fish oil
- Calcium Channel Blockers: Avoid grapefruit` : ""}

DIETARY RESTRICTIONS: ${restrictions.length > 0 ? restrictions.join(", ") : "None specified"}

PREFERRED CUISINES: ${cuisines.length > 0 ? cuisines.join(", ") : "Any cuisine"}

CUISINE & FLAVOR PREFERENCES: ${cuisineNotes || "Not specified"}

USER'S RECIPE INVENTORY (prioritize including these when appropriate): ${recipeInventory?.length > 0 ? recipeInventory.join("; ") : "None provided"}

ITEMS ALREADY IN FRIDGE/PANTRY (use these first, exclude from shopping list): ${fridgeInventory?.length > 0 ? fridgeInventory.join(", ") : "None specified"}

MEALS FROM MEAL DELIVERY SERVICE THIS WEEK (avoid duplicating these, complement them): ${mealServiceMeals?.length > 0 ? mealServiceMeals.join("; ") : "None"}

MEALS EATING OUT / ORDERING IN (DO NOT PLAN THESE - user will eat at restaurant or order delivery): ${eatingOutMeals?.length > 0 ? eatingOutMeals.join(", ") : "None"}

MEALS THE USER ENJOYS: ${mealExamples || "Not specified"}

ADDITIONAL NOTES: ${additionalNotes || "None"}

Generate a balanced, varied, and delicious meal plan. Each meal should:
- STRICTLY AVOID all listed allergies - this is critical for safety
- CAREFULLY consider medical conditions and adapt meals accordingly (e.g., low sugar for diabetics, low sodium for hypertension)
- Respect ALL dietary restrictions
- Use the preferred ingredient sources when possible
- Aim to meet the daily macro targets when combined (breakfast ~25%, lunch ~35%, dinner ~40% of daily calories)
- Incorporate the preferred cuisines and flavor preferences when possible
- PRIORITIZE recipes from the user's recipe inventory - try to include several throughout the week
- Be inspired by the meal examples when relevant
- Include realistic prep times
- Have 4-6 ingredients listed
- Include 2-3 relevant tags (like "High Protein", "Quick", "Comfort Food", etc.)
- Have a brief, appetizing description

IMPORTANT CONSIDERATIONS:
- If the user has meals from a meal delivery service, DO NOT plan meals for those slots. Instead, complement those meals with your suggestions for other meals.
- For meals the user is EATING OUT or ORDERING IN, generate a placeholder meal with name "Eating Out" or "Restaurant/Takeout", empty ingredients, and a note that this slot is reserved for dining out. Do NOT add ingredients to the shopping list for these meals.
- Try to use ingredients from the fridge inventory first before suggesting new ingredients.
- Make sure meals are varied throughout the week and nutritionally balanced.
- Generate unique IDs for each meal.

SHOPPING LIST:
Also generate a complete shopping list for the week that:
- Lists all ingredients needed for the generated meals
- EXCLUDES any items the user already has in their fridge/pantry
- Groups items by category (Produce, Protein, Dairy, Grains & Pasta, Pantry Staples, Spices & Seasonings, etc.)
- Includes approximate quantities needed for the week
- Combines duplicate ingredients across meals into single entries with total quantities`,
  });

  return Response.json(object);
}
