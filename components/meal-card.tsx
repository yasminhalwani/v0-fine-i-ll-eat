"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, Users, Sparkles, UtensilsCrossed } from "lucide-react";


export interface Meal {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  tags: string[];
  ingredients: string[];
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
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

        <details className="group">
          <summary className="flex items-center gap-1 text-xs font-medium text-primary cursor-pointer hover:underline">
            <Sparkles className="h-3 w-3" />
            View ingredients
          </summary>
          <ul className="mt-2 text-xs text-muted-foreground space-y-1 pl-4">
            {meal.ingredients.map((ingredient, idx) => (
              <li key={idx} className="list-disc">{ingredient}</li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
