import { normalizePreferences, selectMeal, type MealPreferences } from "@/lib/meal-filter";
import { generateShoppingList } from "@/lib/shopping-list";
import { Meal, coerceToMeal } from "@/lib/meal-database";
import { parseJsonFromLlmResponse } from "@/lib/prompt-llm";
import { runDoctor, runDietician, runChef, runPlanner, type AgentStep } from "@/lib/agents";

/** Stage messages shown in the UI while each agent runs. */
export const STAGE_MESSAGES: Record<string, string> = {
  doctor: "Scanning your medical profile & mapping do's and don'ts…",
  dietician: "Designing your macro blueprint & meal guidelines…",
  chef: "Curating recipes that fit your vibe…",
  planner: "Assembling your cosmic week…",
};

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
    directions: undefined,
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
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (obj: object) =>
              controller.enqueue(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));

            try {
              send({ stage: "doctor", message: STAGE_MESSAGES.doctor });
              const doctor = await runDoctor(preferences);

              send({ stage: "dietician", message: STAGE_MESSAGES.dietician });
              const dietician = await runDietician(preferences, doctor.output);

              send({ stage: "chef", message: STAGE_MESSAGES.chef });
              const chef = await runChef(preferences, doctor.output, dietician.output);

              send({ stage: "planner", message: STAGE_MESSAGES.planner });
              const planner = await runPlanner(preferences, doctor.output, dietician.output, chef.output);

              const plannerRawOutput = planner.output;
              await saveLlmResponseToFile(plannerRawOutput);
              const parsed = parseJsonFromLlmResponse(plannerRawOutput) as
                | unknown[]
                | { meals?: unknown[]; cookSchedule?: string; ingredientReuse?: string };
              const rawMeals = Array.isArray(parsed)
                ? parsed
                : parsed?.meals && Array.isArray(parsed.meals)
                  ? parsed.meals
                  : [];
              const cookSchedule =
                parsed && typeof parsed === "object" && "cookSchedule" in parsed
                  ? String((parsed as { cookSchedule?: string }).cookSchedule ?? "").trim() || undefined
                  : undefined;
              const ingredientReuse =
                parsed && typeof parsed === "object" && "ingredientReuse" in parsed
                  ? String((parsed as { ingredientReuse?: string }).ingredientReuse ?? "").trim() || undefined
                  : undefined;
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
              const steps: AgentStep[] = [doctor, dietician, chef, planner];
              send({
                type: "result",
                plan: weeklyPlan,
                shoppingList,
                usedLlm: true,
                agentInputsOutputs: steps,
                cookSchedule,
                ingredientReuse,
              });
            } catch (err) {
              send({ type: "error", error: err instanceof Error ? err.message : String(err) });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
          },
        });
      } catch (streamError) {
        fallbackReason = "llm_error";
        const message = streamError instanceof Error ? streamError.message : String(streamError);
        console.error("[generate-meal-plan] Stream/agents failed, falling back to static database:", message);
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
