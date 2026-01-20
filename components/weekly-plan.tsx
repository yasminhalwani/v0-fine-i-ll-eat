"use client";

import { MealCard, type Meal } from "@/components/meal-card";
import { ShoppingList, type ShoppingItem } from "@/components/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Orbit } from "lucide-react";

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface WeeklyPlanProps {
  plan: DayPlan[];
  shoppingList: ShoppingItem[];
  onBack: () => void;
  onRegenerateMeal: (dayIndex: number, mealType: "breakfast" | "lunch" | "dinner") => void;
  onRegenerateDay: (dayIndex: number) => void;
  onRegenerateAll: () => void;
  regeneratingMeal: { dayIndex: number; mealType: string } | null;
  isRegeneratingAll: boolean;
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
  onBack,
  onRegenerateMeal,
  onRegenerateDay,
  onRegenerateAll,
  regeneratingMeal,
  isRegeneratingAll,
}: WeeklyPlanProps) {
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
          <Card key={day.day} className={`${dayColors[dayIndex]} overflow-hidden`}>
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
