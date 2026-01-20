"use client";

import { useState } from "react";
import { PreferencesForm, type MealPreferences } from "@/components/preferences-form";
import { WeeklyPlan, type DayPlan } from "@/components/weekly-plan";
import { Sparkles } from "lucide-react";


interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

export default function MealPlannerPage() {
  const [preferences, setPreferences] = useState<MealPreferences | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[] | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingMeal, setRegeneratingMeal] = useState<{
    dayIndex: number;
    mealType: string;
  } | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

  const generateMealPlan = async (prefs: MealPreferences) => {
    setIsLoading(true);
    setPreferences(prefs);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      const data = await response.json();
      setWeeklyPlan(data.plan);
      setShoppingList(data.shoppingList || []);
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMeal = async (
    dayIndex: number,
    mealType: "breakfast" | "lunch" | "dinner"
  ) => {
    if (!preferences || !weeklyPlan) return;

    setRegeneratingMeal({ dayIndex, mealType });

    try {
      const currentMeal = weeklyPlan[dayIndex][mealType];
      const response = await fetch("/api/regenerate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...preferences,
          mealType,
          currentMealName: currentMeal.name,
        }),
      });

      const newMeal = await response.json();

      setWeeklyPlan((prev) => {
        if (!prev) return prev;
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          [mealType]: newMeal,
        };
        return updated;
      });
    } catch (error) {
      console.error("Failed to regenerate meal:", error);
    } finally {
      setRegeneratingMeal(null);
    }
  };

  const regenerateDay = async (dayIndex: number) => {
    if (!preferences) return;

    setRegeneratingMeal({ dayIndex, mealType: "all" });

    try {
      const mealTypes = ["breakfast", "lunch", "dinner"] as const;
      const currentMeals = weeklyPlan?.[dayIndex];

      const promises = mealTypes.map(async (mealType) => {
        const response = await fetch("/api/regenerate-meal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...preferences,
            mealType,
            currentMealName: currentMeals?.[mealType]?.name || "",
          }),
        });
        return { mealType, meal: await response.json() };
      });

      const results = await Promise.all(promises);

      setWeeklyPlan((prev) => {
        if (!prev) return prev;
        const updated = [...prev];
        for (const { mealType, meal } of results) {
          updated[dayIndex] = {
            ...updated[dayIndex],
            [mealType]: meal,
          };
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to regenerate day:", error);
    } finally {
      setRegeneratingMeal(null);
    }
  };

  const regenerateAll = async () => {
    if (!preferences) return;
    setIsRegeneratingAll(true);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      setWeeklyPlan(data.plan);
      setShoppingList(data.shoppingList || []);
    } catch (error) {
      console.error("Failed to regenerate meal plan:", error);
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const goBack = () => {
    setWeeklyPlan(null);
    setShoppingList([]);
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Cosmic background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Fine, I'll Eat
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto text-balance text-lg">
            {weeklyPlan
              ? "Your cosmic meal plan is ready! Swap out any meals you don't like."
              : "Tell us about your dietary needs and preferences, and we'll create a stellar weekly meal plan just for you."}
          </p>
        </header>

        {weeklyPlan ? (
          <WeeklyPlan
            plan={weeklyPlan}
            shoppingList={shoppingList}
            onBack={goBack}
            onRegenerateMeal={regenerateMeal}
            onRegenerateDay={regenerateDay}
            onRegenerateAll={regenerateAll}
            regeneratingMeal={regeneratingMeal}
            isRegeneratingAll={isRegeneratingAll}
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <PreferencesForm onSubmit={generateMealPlan} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}
