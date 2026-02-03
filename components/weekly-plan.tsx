"use client";

import { MealCard, type Meal } from "@/components/meal-card";
import { ShoppingList, type ShoppingItem } from "@/components/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Orbit, ClipboardList } from "lucide-react";

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface WeeklyPlanProps {
  plan: DayPlan[];
  shoppingList: ShoppingItem[];
  cookSchedule?: string | null;
  ingredientReuse?: string | null;
  onBack: () => void;
  onRegenerateMeal: (dayIndex: number, mealType: "breakfast" | "lunch" | "dinner") => void;
  onRegenerateDay: (dayIndex: number) => void;
  onRegenerateAll: () => void;
  regeneratingMeal: { dayIndex: number; mealType: string } | null;
  isRegeneratingAll: boolean;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Split cookSchedule by day headers (e.g. "Monday: ...") and return that day's snippet, or full text if not parseable. */
function getCookScheduleForDay(cookSchedule: string, dayName: string): string {
  const dayLower = dayName.toLowerCase();
  const chunks = cookSchedule.split(/\s*(?=Monday:|Tuesday:|Wednesday:|Thursday:|Friday:|Saturday:|Sunday:)/i);
  const parts: { day: string; text: string }[] = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const dayMatch = trimmed.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:?\s*/i);
    if (dayMatch) {
      const day = dayMatch[1];
      const text = trimmed.slice(dayMatch[0].length).trim();
      if (day) parts.push({ day: day.toLowerCase(), text });
    }
  }
  if (parts.length === 0) return cookSchedule.trim();
  const forDay = parts.find((p) => dayLower.startsWith(p.day) || p.day.startsWith(dayLower.slice(0, 3)));
  if (forDay) return forDay.text;
  return cookSchedule.trim();
}

const dayColors = [
  "border-l-4 border-l-chart-3",
  "border-l-4 border-l-chart-5",
  "border-l-4 border-l-chart-4",
  "border-l-4 border-l-chart-2",
  "border-l-4 border-l-primary",
  "border-l-4 border-l-accent",
  "border-l-4 border-l-chart-1",
];

export function WeeklyPlan({
  plan,
  shoppingList,
  cookSchedule,
  ingredientReuse,
  onBack,
  onRegenerateMeal,
  onRegenerateDay,
  onRegenerateAll,
  regeneratingMeal,
  isRegeneratingAll,
}: WeeklyPlanProps) {
  const hasPlannerNotes = !!(cookSchedule?.trim() || ingredientReuse?.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Edit Preferences
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRegenerateAll}
            disabled={isRegeneratingAll}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRegeneratingAll ? "animate-spin" : ""}`} />
            Regenerate All
          </Button>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Orbit className="h-7 w-7 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Cosmic Meal Plan</h2>
        </div>
        <p className="text-muted-foreground">
          Click the refresh icon on any meal to get a new suggestion
        </p>
      </div>

      <div className="space-y-6">
        {plan.map((day, dayIndex) => (
          <div key={day.day} className="space-y-3">
            {hasPlannerNotes && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                  Planner&apos;s notes — {day.day}
                </div>
                {cookSchedule && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When to cook</span>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-0.5">
                      {getCookScheduleForDay(cookSchedule, day.day)}
                    </p>
                  </div>
                )}
                {ingredientReuse && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredient reuse</span>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-0.5">{ingredientReuse}</p>
                  </div>
                )}
              </div>
            )}
            <Card className={`${dayColors[dayIndex]} overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-foreground">{day.day}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerateDay(dayIndex)}
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh day
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MealCard
                    meal={day.breakfast}
                    mealType="breakfast"
                    onRegenerate={() => onRegenerateMeal(dayIndex, "breakfast")}
                    isRegenerating={
                      regeneratingMeal?.dayIndex === dayIndex &&
                      regeneratingMeal?.mealType === "breakfast"
                    }
                  />
                  <MealCard
                    meal={day.lunch}
                    mealType="lunch"
                    onRegenerate={() => onRegenerateMeal(dayIndex, "lunch")}
                    isRegenerating={
                      regeneratingMeal?.dayIndex === dayIndex &&
                      regeneratingMeal?.mealType === "lunch"
                    }
                  />
                  <MealCard
                    meal={day.dinner}
                    mealType="dinner"
                    onRegenerate={() => onRegenerateMeal(dayIndex, "dinner")}
                    isRegenerating={
                      regeneratingMeal?.dayIndex === dayIndex &&
                      regeneratingMeal?.mealType === "dinner"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Shopping List */}
      {shoppingList && shoppingList.length > 0 && (
        <div className="mt-8">
          <ShoppingList items={shoppingList} />
        </div>
      )}
    </div>
  );
}
