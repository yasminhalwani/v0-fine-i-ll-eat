"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, Users, Sparkles, UtensilsCrossed, ListOrdered, Flame, ChevronDown } from "lucide-react";

export interface Meal {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  /** Step-by-step directions (optional; from LLM plans). */
  directions?: string;
  /** Per serving (optional). */
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFats?: number;
}

interface MealCardProps {
  meal: Meal;
  mealType: "breakfast" | "lunch" | "dinner";
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const mealTypeColors = {
  breakfast: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  lunch: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  dinner: "bg-chart-1/20 text-chart-1 border-chart-1/30",
};

const mealTypeIcons = {
  breakfast: "sunrise",
  lunch: "sun",
  dinner: "moon",
};

const isEatingOut = (meal: Meal) => meal.name === "Eating Out";

export function MealCard({ meal, mealType, onRegenerate, isRegenerating }: MealCardProps) {
  if (isEatingOut(meal)) {
    return (
      <Card className="h-full transition-all hover:shadow-lg border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/15 to-orange-500/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40">
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-base leading-tight text-amber-800 dark:text-amber-200 line-clamp-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/30 text-amber-600 dark:text-amber-400 shrink-0">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>
                {meal.name}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
              <span className="sr-only">Regenerate meal</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-amber-700/90 dark:text-amber-300/90 line-clamp-2">
            {meal.description}
          </p>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            No cooking — treat yourself!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={mealTypeColors[mealType]}>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Badge>
            </div>
            <CardTitle className="text-base leading-tight text-foreground line-clamp-2">
              {meal.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            <span className="sr-only">Regenerate meal</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{meal.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{meal.servings} servings</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {meal.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Nutritional info — compact, readable */}
        {(meal.estimatedCalories != null && meal.estimatedCalories > 0) ||
        (meal.estimatedProtein != null && meal.estimatedProtein > 0) ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-xs font-semibold text-foreground/90 mb-1.5 flex items-center gap-1">
              <Flame className="h-3 w-3 text-primary" />
              Nutrition (per serving)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {meal.estimatedCalories != null && meal.estimatedCalories > 0 && (
                <span>Calories: {meal.estimatedCalories} kcal</span>
              )}
              {meal.estimatedProtein != null && meal.estimatedProtein > 0 && (
                <span>Protein: {meal.estimatedProtein}g</span>
              )}
              {meal.estimatedCarbs != null && meal.estimatedCarbs > 0 && (
                <span>Carbs: {meal.estimatedCarbs}g</span>
              )}
              {meal.estimatedFats != null && meal.estimatedFats > 0 && (
                <span>Fats: {meal.estimatedFats}g</span>
              )}
            </div>
          </div>
        ) : null}

        {/* Ingredients */}
        <details className="group rounded-lg border border-border/50 overflow-hidden">
          <summary className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/50 list-none">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span>Ingredients</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto group-open:rotate-180 transition-transform shrink-0" />
          </summary>
          <ul className="border-t border-border/50 py-2 px-3 text-xs text-muted-foreground space-y-1 pl-5 list-disc">
            {meal.ingredients.length > 0 ? (
              meal.ingredients.map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))
            ) : (
              <li className="list-none text-muted-foreground/80">No ingredients listed.</li>
            )}
          </ul>
        </details>

        {/* Directions */}
        {meal.directions && meal.directions.trim() ? (
          <details className="group rounded-lg border border-border/50 overflow-hidden">
            <summary className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/50 list-none">
              <ListOrdered className="h-3 w-3 text-primary shrink-0" />
              <span>Directions</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto group-open:rotate-180 transition-transform shrink-0" />
            </summary>
            <div className="border-t border-border/50 py-2 px-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {meal.directions.trim()}
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}
