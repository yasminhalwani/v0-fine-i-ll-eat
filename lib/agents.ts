import { promptLlm } from "@/lib/prompt-llm";
import type { MealPreferences } from "@/lib/meal-filter";

export interface AgentStep {
  agent: "doctor" | "dietician" | "chef" | "planner";
  input: string;
  output: string;
}

/** Build medical-restrictions text for the doctor agent. */
function medicalInput(prefs: MealPreferences): string {
  const lines: string[] = [];
  if (prefs.allergies?.length) lines.push(`Allergies (must avoid): ${prefs.allergies.join(", ")}`);
  if (prefs.medicalConditions?.length) lines.push(`Medical conditions: ${prefs.medicalConditions.join(", ")}`);
  if (prefs.medications?.length) lines.push(`Current medications: ${prefs.medications.join(", ")}`);
  return lines.length ? lines.join("\n") : "No specific medical restrictions provided.";
}

/** Doctor: medical restrictions → not allowed / advised / not advised / medication timing. */
export async function runDoctor(prefs: MealPreferences): Promise<AgentStep> {
  const input = medicalInput(prefs);
  const prompt = `You are a doctor giving dietary and medication guidance based on a patient's medical information. Do not diagnose; only summarize dietary and medication timing guidance.

Medical information (medical restrictions) for this patient:
---
${input}
---

Provide a clear, concise summary with these four sections. Use bullet points. If something is not specified, say "None specified" for that part.

1. NOT ALLOWED TO EAT (allergens and strictly prohibited foods):
2. ADVISED TO EAT (foods that support their conditions):
3. NOT ADVISED TO EAT (foods to limit or avoid given conditions/medications):
4. WHEN TO TAKE MEDICATION IN THE DAY (timing relative to meals, e.g. with food, empty stomach, avoid certain foods at same time):`;

  const output = await promptLlm(prompt);
  return { agent: "doctor", input, output };
}

/** Dietician: doctor output + dietary preferences → macros per meal, foods for b/l/d, supplements. */
export async function runDietician(prefs: MealPreferences, doctorOutput: string): Promise<AgentStep> {
  const dietaryPart = [
    `Daily calorie target: ${prefs.calories} kcal`,
    `Macros: ${prefs.proteinPercent}% protein, ${prefs.carbsPercent}% carbs, ${prefs.fatsPercent}% fats`,
    `Dietary restrictions: ${prefs.restrictions?.length ? prefs.restrictions.join(", ") : "None"}`,
  ].join("\n");
  const input = `Doctor's guidance:\n---\n${doctorOutput}\n---\n\nDietary preferences and restrictions:\n---\n${dietaryPart}\n---`;
  const prompt = `You are a dietician. Using the doctor's guidance and the dietary preferences below, provide practical recommendations.

${input}

Provide a clear summary with these sections (use bullet points):

1. HOW TO DIVIDE MACROS PER MEAL (e.g. breakfast 25%, lunch 35%, dinner 40%; or grams per meal):
2. TYPES OF FOODS ADVISED FOR BREAKFAST:
3. TYPES OF FOODS ADVISED FOR LUNCH:
4. TYPES OF FOODS ADVISED FOR DINNER:
5. ANY OTHER SUPPLEMENTS THIS PATIENT IS ADVISED TO TAKE (e.g. vitamin D, omega-3):`;

  const output = await promptLlm(prompt);
  return { agent: "dietician", input, output };
}

/** Chef: doctor + dietician + taste preferences + USER RECIPE INVENTORY FIRST → recipe suggestions for the week (no reality constraints). */
export async function runChef(
  prefs: MealPreferences,
  doctorOutput: string,
  dieticianOutput: string
): Promise<AgentStep> {
  const recipeInventoryList = prefs.recipeInventory?.length
    ? prefs.recipeInventory.join("\n- ")
    : "None";
  const tastePart = [
    `USER'S RECIPE INVENTORY (prioritize these first):\n- ${recipeInventoryList}`,
    `Preferred cuisines: ${prefs.cuisines?.length ? prefs.cuisines.join(", ") : "Any"}`,
    `Cuisine notes: ${prefs.cuisineNotes || "None"}`,
    `Preferred protein sources: ${prefs.proteinSources?.length ? prefs.proteinSources.join(", ") : "Any"}`,
    `Preferred carb sources: ${prefs.carbSources?.length ? prefs.carbSources.join(", ") : "Any"}`,
    `Preferred fat sources: ${prefs.fatSources?.length ? prefs.fatSources.join(", ") : "Any"}`,
    `Example meals they like: ${prefs.mealExamples || "None"}`,
  ].join("\n");
  const input = `Doctor's guidance:\n---\n${doctorOutput}\n---\n\nDietician's recommendations:\n---\n${dieticianOutput}\n---\n\nTaste preferences and user recipes:\n---\n${tastePart}\n---`;
  const prompt = `You are a chef. Using the doctor's guidance, the dietician's recommendations, and the user's taste preferences, suggest a set of recipes that could cover a full week (7 breakfasts, 7 lunches, 7 dinners). Do NOT yet consider fridge inventory, cooking time limits, or eating out—only medical, dietary, and taste fit.

PRIORITY RULES:
1. **Prioritize the user's recipe inventory first.** The user has listed recipes they know or want to make. Use these as your primary source. Assign as many of the 21 slots as possible to recipes from the user's list (matching meal type: breakfast/lunch/dinner where it makes sense).
2. **Complete incomplete user recipes.** If a user recipe is just a name or vague (e.g. "Grandma's soup" or "chicken something"), expand it into a full recipe idea: give it a clear name, a one-line description, and note any obvious ingredients or variations so the planner can turn it into a complete recipe later. If the user's recipe is already detailed, keep that and just pass it through.
3. **Only then add external recipes.** For any remaining slots after fitting in the user's recipes, suggest other recipes that match doctor/dietician guidance and taste preferences.

${input}

Provide a list of recipe suggestions for the week. For each suggestion give: meal type (breakfast/lunch/dinner), recipe name, and a one-line description. Prefer and list the user's recipe inventory items first (completed or expanded as needed), then fill the rest with your own ideas. You can repeat a recipe in multiple slots (e.g. "Oatmeal" twice for breakfast). Format as clear bullet points or a simple list. Do not output JSON yet—this is just recipe ideas for the planner to use.`;

  const output = await promptLlm(prompt);
  return { agent: "chef", input, output };
}

/** Planner: chef + doctor + dietician + reality (fridge, time, eating out) + notes → full weekly plan as JSON. */
export async function runPlanner(
  prefs: MealPreferences,
  doctorOutput: string,
  dieticianOutput: string,
  chefOutput: string
): Promise<AgentStep> {
  const varietyLabel =
    prefs.ingredientVariety === 1
      ? "Maximize reuse (same ingredients across many recipes — save money, time, less shopping)"
      : prefs.ingredientVariety === 2
        ? "Reuse a lot (fewer different ingredients)"
        : prefs.ingredientVariety === 4
          ? "More variety (more different ingredients)"
          : prefs.ingredientVariety === 5
            ? "Lots of variety (many different ingredients, more shopping)"
            : "Balanced (moderate ingredient reuse)";
  const realityPart = [
    `Fridge inventory (prefer using): ${prefs.fridgeInventory?.length ? prefs.fridgeInventory.join(", ") : "None"}`,
    `How many times per week they want to cook: ${prefs.cookTimesPerWeek} (use for batch cooking: same meal for 2+ slots where appropriate)`,
    `Ingredient variety (1–5): ${prefs.ingredientVariety ?? 3} — ${varietyLabel}`,
    `Meal plan / delivery meals they use: ${prefs.mealServiceMeals?.length ? prefs.mealServiceMeals.join(", ") : "None"}`,
    `Eating out / ordering in (slots reserved): ${prefs.eatingOutMeals?.length ? prefs.eatingOutMeals.join(", ") : "None"}`,
    `Additional notes: ${prefs.additionalNotes || "None"}`,
  ].join("\n");
  const input = `Doctor's guidance:\n---\n${doctorOutput}\n---\n\nDietician's recommendations:\n---\n${dieticianOutput}\n---\n\nChef's recipe suggestions:\n---\n${chefOutput}\n---\n\nReality (fridge, time, eating out):\n---\n${realityPart}\n---`;
  const prompt = `You are a meal planner. Using the doctor's guidance, dietician's recommendations, chef's recipe ideas, and the reality section (fridge, cooking frequency, eating out, notes), produce ONE final weekly meal plan.

${input}

Rules:
1. Do NOT include any ingredient that appears in the doctor's "not allowed" list or allergies.
2. Respect dietary restrictions and medical guidance.
3. For slots marked as eating out/ordering in, you will be told which day/meal—for now output a placeholder meal with name "Eating Out" and description "This meal slot is reserved for dining out or ordering in" for those slots.
4. Prefer using fridge inventory where possible.
5. When cookTimesPerWeek is less than 7, suggest batch-cooking (same meal name for 2+ slots where appropriate).
6. Respect ingredient variety preference: lower (1–2) = reuse the same ingredients across many recipes to save money and reduce shopping; higher (4–5) = use more different ingredients for variety.
7. Output exactly 21 meals: 7 breakfasts (indices 0–6), then 7 lunches (7–13), then 7 dinners (14–20).
8. **Each meal must be a complete recipe** with ingredients, step-by-step directions, and nutritional info so the user can cook it.

Output format — respond with a single JSON object (no markdown, no code fence) with exactly these three keys:

1. "meals": an array of exactly 21 meal objects. Each meal must have:
   - id (string, e.g. "bf-1", "ln-1", "dn-1")
   - name, description, prepTime, servings (1 or more), tags (array)
   - mealType ("breakfast"|"lunch"|"dinner"), cuisine (array)
   - **ingredients** (array of strings, e.g. ["2 eggs", "1 slice bread", "Salt"])
   - **directions** (string: step-by-step instructions, numbered or newline-separated, e.g. "1. Beat eggs. 2. Heat pan...")
   - **Nutritional info**: estimatedCalories (number), estimatedProtein (grams), estimatedCarbs (grams), estimatedFats (grams)
   - proteinSources, carbSources, fatSources (arrays)
   - containsAllergens (array), dietaryRestrictions (array), medicalFriendly (array), medicationSafe (array)

2. "cookSchedule": a string explaining WHEN to cook. For each day (Monday–Sunday), list which meals are cooked that day vs eaten out or from leftovers. Example: "Monday: cook breakfast and dinner; lunch is leftovers. Tuesday: cook lunch only; breakfast from Monday batch, dinner out. Wednesday: ..."

3. "ingredientReuse": a string with bullet points (use • or -) listing what ingredients or cooked components can be reused and on which days. Example: "• Cook extra chicken Monday dinner → use in Tuesday lunch (chicken salad) and Wednesday wrap. • Rice from Tuesday dinner → use for Thursday lunch. • Roasted vegetables from Wednesday → add to Thursday dinner." If little or no reuse, say "Minimal reuse this week" or one line.`;

  const output = await promptLlm(prompt);
  return { agent: "planner", input, output };
}

/** Run all four agents in sequence; returns steps (each with input/output) and the planner's raw output for parsing. */
export async function runAllAgents(prefs: MealPreferences): Promise<{
  steps: AgentStep[];
  plannerRawOutput: string;
}> {
  const steps: AgentStep[] = [];
  const doctor = await runDoctor(prefs);
  steps.push(doctor);

  const dietician = await runDietician(prefs, doctor.output);
  steps.push(dietician);

  const chef = await runChef(prefs, doctor.output, dietician.output);
  steps.push(chef);

  const planner = await runPlanner(prefs, doctor.output, dietician.output, chef.output);
  steps.push(planner);

  return { steps, plannerRawOutput: planner.output };
}
