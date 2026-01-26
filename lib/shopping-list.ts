import { Meal } from "./meal-database";

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

// Ingredient categories for shopping list organization
const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Produce
  "Berries": "Produce",
  "Banana": "Produce",
  "Fruit": "Produce",
  "Lettuce": "Produce",
  "Mixed Greens": "Produce",
  "Romaine Lettuce": "Produce",
  "Spinach": "Produce",
  "Kale": "Produce",
  "Tomatoes": "Produce",
  "Cherry Tomatoes": "Produce",
  "Cucumbers": "Produce",
  "Bell Peppers": "Produce",
  "Onions": "Produce",
  "Green Onions": "Produce",
  "Carrots": "Produce",
  "Broccoli": "Produce",
  "Asparagus": "Produce",
  "Celery": "Produce",
  "Mushrooms": "Produce",
  "Avocado": "Produce",
  "Lemon": "Produce",
  "Lime": "Produce",
  "Garlic": "Produce",
  "Ginger": "Produce",
  "Herbs": "Produce",
  "Basil": "Produce",
  "Green Beans": "Produce",
  "Bean Sprouts": "Produce",
  "Sweet Potatoes": "Produce",
  "Potatoes": "Produce",
  "Zucchini": "Produce",

  // Protein
  "Chicken": "Protein",
  "Chicken Breast": "Protein",
  "Chicken Sausage": "Protein",
  "Beef": "Protein",
  "Ground Beef": "Protein",
  "Pork": "Protein",
  "Pork Tenderloin": "Protein",
  "Turkey": "Protein",
  "Ground Turkey": "Protein",
  "Lamb": "Protein",
  "Eggs": "Protein",
  "Salmon": "Protein",
  "Tuna": "Protein",
  "Cod": "Protein",
  "Fish": "Protein",
  "Shrimp": "Protein",
  "Tofu": "Protein",
  "Tempeh": "Protein",

  // Dairy
  "Milk": "Dairy",
  "Butter": "Dairy",
  "Cheese": "Dairy",
  "Parmesan Cheese": "Dairy",
  "Feta Cheese": "Dairy",
  "Greek Yogurt": "Dairy",
  "Cottage Cheese": "Dairy",
  "Sour Cream": "Dairy",
  "Cream": "Dairy",
  "Mayonnaise": "Dairy",

  // Grains & Pasta
  "Rice": "Grains & Pasta",
  "Jasmine Rice": "Grains & Pasta",
  "Basmati Rice": "Grains & Pasta",
  "Brown Rice": "Grains & Pasta",
  "Arborio Rice": "Grains & Pasta",
  "Quinoa": "Grains & Pasta",
  "Oats": "Grains & Pasta",
  "Pasta": "Grains & Pasta",
  "Spaghetti": "Grains & Pasta",
  "Rice Noodles": "Grains & Pasta",
  "Couscous": "Grains & Pasta",
  "Bread": "Grains & Pasta",
  "Whole Wheat Bread": "Grains & Pasta",
  "Sourdough Bread": "Grains & Pasta",
  "Whole Grain Bread": "Grains & Pasta",
  "Tortillas": "Grains & Pasta",
  "Corn Tortillas": "Grains & Pasta",
  "Whole Wheat Tortilla": "Grains & Pasta",
  "Naan": "Grains & Pasta",
  "Croutons": "Grains & Pasta",
  "Granola": "Grains & Pasta",
  "Whole Grain Bun": "Grains & Pasta",

  // Pantry Staples
  "Olive Oil": "Pantry Staples",
  "Coconut Oil": "Pantry Staples",
  "Sesame Oil": "Pantry Staples",
  "Soy Sauce": "Pantry Staples",
  "Teriyaki Sauce": "Pantry Staples",
  "Balsamic Vinegar": "Pantry Staples",
  "Fish Sauce": "Pantry Staples",
  "Honey": "Pantry Staples",
  "Salsa": "Pantry Staples",
  "Marinara Sauce": "Pantry Staples",
  "Caesar Dressing": "Pantry Staples",
  "Tahini": "Pantry Staples",
  "Peanut Butter": "Pantry Staples",
  "Nut Butters": "Pantry Staples",
  "White Wine": "Pantry Staples",
  "Coconut Milk": "Pantry Staples",
  "Almond Milk": "Pantry Staples",

  // Legumes & Beans
  "Lentils": "Legumes & Beans",
  "Chickpeas": "Legumes & Beans",
  "Black Beans": "Legumes & Beans",
  "Beans": "Legumes & Beans",
  "Legumes": "Legumes & Beans",

  // Nuts & Seeds
  "Nuts": "Nuts & Seeds",
  "Almonds": "Nuts & Seeds",
  "Peanuts": "Nuts & Seeds",
  "Seeds": "Nuts & Seeds",
  "Chia Seeds": "Nuts & Seeds",
  "Sesame Seeds": "Nuts & Seeds",
  "Coconut Flakes": "Nuts & Seeds",

  // Spices & Seasonings
  "Salt": "Spices & Seasonings",
  "Pepper": "Spices & Seasonings",
  "Black Salt": "Spices & Seasonings",
  "Cinnamon": "Spices & Seasonings",
  "Red Pepper Flakes": "Spices & Seasonings",
  "Spices": "Spices & Seasonings",
  "Curry Spices": "Spices & Seasonings",
  "Turmeric": "Spices & Seasonings",

  // Other
  "Veggie Burger Patty": "Other",
};

// Default category for unknown ingredients
const DEFAULT_CATEGORY = "Other";

// Get category for an ingredient
function getCategory(ingredient: string): string {
  // Try exact match first
  if (INGREDIENT_CATEGORIES[ingredient]) {
    return INGREDIENT_CATEGORIES[ingredient];
  }

  // Try partial match
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (ingredient.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(ingredient.toLowerCase())) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}

// Normalize ingredient name (remove common variations)
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^fresh\s+/i, "")
    .replace(/^dried\s+/i, "")
    .replace(/^organic\s+/i, "");
}

// Generate shopping list from meals
export function generateShoppingList(
  meals: Meal[],
  fridgeInventory: string[] = []
): ShoppingItem[] {
  const ingredientMap = new Map<string, { quantity: number; category: string }>();

  // Collect all ingredients from all meals
  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const normalized = normalizeIngredient(ingredient);
      const category = getCategory(normalized);

      // Skip if in fridge inventory
      const inFridge = fridgeInventory.some((item) =>
        normalized.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(normalized.toLowerCase())
      );

      if (inFridge) continue;

      // Aggregate quantities
      if (ingredientMap.has(normalized)) {
        const existing = ingredientMap.get(normalized)!;
        existing.quantity += meal.servings;
      } else {
        ingredientMap.set(normalized, {
          quantity: meal.servings,
          category,
        });
      }
    }
  }

  // Convert to shopping list items
  const shoppingList: ShoppingItem[] = [];

  for (const [ingredient, data] of ingredientMap.entries()) {
    // Estimate quantity based on servings
    let quantity = "";
    if (data.quantity === 1) {
      quantity = "1 serving";
    } else if (data.quantity <= 3) {
      quantity = `${data.quantity} servings`;
    } else if (data.quantity <= 7) {
      quantity = "1 package";
    } else {
      quantity = "2+ packages";
    }

    shoppingList.push({
      item: ingredient,
      quantity,
      category: data.category,
    });
  }

  // Sort by category, then by ingredient name
  const categoryOrder = [
    "Produce",
    "Protein",
    "Dairy",
    "Grains & Pasta",
    "Pantry Staples",
    "Legumes & Beans",
    "Nuts & Seeds",
    "Spices & Seasonings",
    "Other",
  ];

  shoppingList.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category);
    const bIndex = categoryOrder.indexOf(b.category);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return a.item.localeCompare(b.item);
  });

  return shoppingList;
}
