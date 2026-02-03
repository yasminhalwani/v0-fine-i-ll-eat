/**
 * All user-facing strings for the preferences form.
 * Kept in one place for consistency and easier i18n later.
 */

export const PREFERENCES_FORM_STRINGS = {
  // Welcome
  welcome: {
    title: "Welcome — let's build your meal plan",
    description:
      "Tell us as much or as little as you like. Every section is optional — fill in what matters to you and skip the rest. We'll use your answers to tailor ingredients, portions, and recipes to your life.",
  },

  // Section headers
  sections: {
    taste: "Your taste: cuisine & recipes you like",
    dietitian: "Your dietaty preferences",
    medical: "Medical restrictions",
    reality: "Reality: fridge, time, eating out",
    additionalNotes: "Additional notes",
  },

  // Cuisine
  cuisine: {
    title: "Cuisine Preferences",
    description: "Select the cuisines you enjoy and describe your flavor preferences",
    labelCuisineNotes: "Describe your cuisine and flavor preferences",
    placeholderCuisineNotes:
      "e.g., I love spicy food, prefer lighter sauces over creamy ones, enjoy fusion dishes that combine Asian and Mexican flavors, prefer grilled over fried...",
  },

  // Protein / Carb / Fat
  protein: {
    title: "Preferred Protein Sources",
    description: "Select the protein sources you enjoy eating",
  },
  carbs: {
    title: "Preferred Carbohydrate Sources",
    description: "Select the carb sources you prefer in your meals",
  },
  fats: {
    title: "Preferred Fat Sources",
    description: "Select the healthy fat sources you like",
  },

  // Recipe Inventory
  recipeInventory: {
    title: "Recipe Inventory",
    description: "Add your favorite recipes to be considered in meal suggestions",
    labelAddRecipe: "Add a recipe",
    placeholderRecipe:
      "Enter a recipe name or describe it (e.g., 'Grandma's chicken soup with vegetables and noodles' or 'Spicy Korean bibimbap with gochujang sauce')...",
    hintRecipes: "Press Enter or click + to add. These recipes will be considered when generating your meal plan.",
    yourSavedRecipes: (count: number) => `Your Saved Recipes (${count})`,
  },

  // Meal Examples & Notes
  mealExamples: {
    title: "Meal Examples & Notes",
    description: "Share meals you enjoy to help us understand your taste - upload photos or type them",
    labelUploadPhotos: "Upload Photos of Meals You Enjoy",
    analyzingPhotos: "Analyzing your meal photos...",
    uploadPhotosHint: "Upload photos of meals you love",
    uploadPhotosSubHint: "Restaurant dishes, home-cooked meals, recipes from Pinterest, etc.",
    orDescribeMeals: "or describe meals",
    uploadedPhotos: (count: number) => `Uploaded Photos (${count})`,
    labelMealsYouEnjoy: "Meals you enjoy",
    placeholderMealExamples:
      "e.g., Grilled salmon with vegetables, Chicken stir-fry, Quinoa salad with feta...",
    mealsFromPhotosHint: "Meals from uploaded photos will appear here automatically",
  },

  // Daily Calories & Macros
  caloriesMacros: {
    title: "Daily Calories & Macros",
    description: "Set your daily calorie target and macro distribution",
    labelDailyCalories: "Daily Calories",
    kcal: "kcal",
    labelMacroDistribution: "Macro Distribution",
    macroTotalError: (total: number) => `Total: ${total}% (must equal 100%)`,
    protein: "Protein",
    carbohydrates: "Carbohydrates",
    fats: "Fats",
    caloriesRange: { min: "1000", max: "5000" },
  },

  // Dietary Restrictions
  dietaryRestrictions: {
    title: "Dietary Restrictions",
    description: "Select any dietary restrictions or preferences",
    placeholderAddOther: "Add other restriction...",
  },

  // Food Allergies
  allergies: {
    title: "Food Allergies",
    description: "Select any food allergies we should avoid",
    placeholderAddOther: "Add other allergy...",
  },

  // Medical Conditions
  medicalConditions: {
    title: "Medical Conditions",
    description: "Select any medical conditions that may influence your food choices",
    placeholderAddOther: "Add other medical condition...",
    dietaryConsiderations: "Dietary considerations for selected conditions:",
  },

  // Medications
  medications: {
    title: "Current Medications",
    description: "Add medications you take so we can check for food-drug interactions",
    placeholderAddOther: "Add other medication...",
    foodInteractionWarnings: "Food interaction warnings:",
    willCheckInteractions: "Will check for common interactions",
  },

  // Fridge Inventory
  fridge: {
    title: "Fridge Inventory",
    description: "Add items you already have at home to help plan your shopping list",
    labelAddItems: "Add items from your fridge/pantry",
    placeholderFridge: "e.g., eggs, milk, chicken breast, rice, olive oil...",
    hintExcluded: "These items will be excluded from your shopping list.",
    itemsInFridge: (count: number) => `Items in Your Fridge/Pantry (${count})`,
  },

  // Meal Plan Service
  mealService: {
    title: "Meal Plan Service",
    description:
      "Add meals you're receiving from a meal delivery service this week - upload screenshots or type them manually",
    labelUploadScreenshots: "Upload Screenshots",
    analyzingMeals: "Analyzing your meals...",
    clickToUpload: "Click to upload meal service screenshots",
    uploadHint: "PNG, JPG, or screenshots from HelloFresh, Factor, Blue Apron, etc.",
    orTypeManually: "or type manually",
    labelAddMealManually: "Add a meal manually",
    placeholderMealService: "e.g., Monday dinner: Teriyaki salmon with steamed vegetables...",
    mealsFromService: (count: number) => `Meals from Your Service (${count})`,
    consideredWhenPlanning: "These meals will be considered when planning your week to avoid duplicates.",
    uploadedScreenshots: (count: number) => `Uploaded Screenshots (${count})`,
  },

  // Eating Out
  eatingOut: {
    title: "Eating Out / Ordering In",
    description: "Select which meals you plan to eat at restaurants or order in this week",
    labelSelectMeals: "Select meals you will eat out or order in",
    mealsSkipped: (count: number) =>
      `${count} meal${count !== 1 ? "s" : ""} will be skipped in your plan. No groceries will be added for these meals.`,
  },

  // Number of people
  numberOfPeople: {
    title: "Number of people",
    description: "How many people is this plan for? We'll scale ingredients and recipe portions accordingly.",
    labelPeople: "People",
    sliderRange: { min: "1", max: "20" },
  },

  // Additional notes
  additionalNotes: {
    cardTitle: "Anything else we should know?",
    description: "e.g. time constraints, budget, household size, or anything else we should know",
    placeholder:
      "e.g., Prefer quick meals under 30 minutes, cooking for 2 people, budget-friendly options...",
  },

  // Submit button
  submit: {
    generating: "Generating your cosmic meal plan...",
    launchPlan: "Launch Weekly Meal Plan",
  },

  // Days (for Eating Out grid)
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  mealSlots: ["Breakfast", "Lunch", "Dinner"],
} as const;

// Option lists for badge selectors (typed as string[] so .includes(string) works in the form)
export const PROTEIN_SOURCES = [
  "Chicken", "Beef", "Pork", "Fish", "Shrimp", "Eggs", "Tofu", "Tempeh", "Legumes",
  "Greek Yogurt", "Cottage Cheese", "Turkey", "Lamb", "Salmon", "Tuna",
] as string[];

export const CARB_SOURCES = [
  "Rice", "Pasta", "Bread", "Potatoes", "Sweet Potatoes", "Quinoa", "Oats", "Beans",
  "Lentils", "Fruit", "Corn", "Couscous", "Barley", "Bulgur",
] as string[];

export const FAT_SOURCES = [
  "Olive Oil", "Avocado", "Nuts", "Seeds", "Butter", "Coconut Oil", "Cheese",
  "Dark Chocolate", "Nut Butters", "Fatty Fish", "Whole Eggs", "Ghee",
] as string[];

export const COMMON_ALLERGIES = [
  "Peanuts", "Tree Nuts", "Milk/Dairy", "Eggs", "Wheat/Gluten", "Soy", "Fish",
  "Shellfish", "Sesame", "Mustard", "Celery", "Sulfites",
] as string[];

export const DIETARY_RESTRICTIONS = [
  "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", "Low-Carb", "Low-Fat",
  "Halal", "Kosher", "Low-Sodium", "Diabetic-Friendly",
] as string[];

export const CUISINE_OPTIONS = [
  "Italian", "Mexican", "Asian", "Mediterranean", "Indian", "American", "French",
  "Thai", "Japanese", "Greek", "Middle Eastern", "Korean",
] as string[];

export const MEDICAL_CONDITIONS: { name: string; tip: string }[] = [
  { name: "Type 1 Diabetes", tip: "Low glycemic index foods, consistent carb intake" },
  { name: "Type 2 Diabetes", tip: "Low sugar, low glycemic, high fiber" },
  { name: "Hypertension", tip: "Low sodium, DASH diet friendly" },
  { name: "High Cholesterol", tip: "Low saturated fat, high fiber" },
  { name: "Heart Disease", tip: "Heart-healthy fats, low sodium" },
  { name: "Celiac Disease", tip: "Strict gluten-free" },
  { name: "IBS", tip: "Low FODMAP options" },
  { name: "Crohn's Disease", tip: "Easy to digest, low fiber during flares" },
  { name: "GERD/Acid Reflux", tip: "Avoid acidic, spicy, fatty foods" },
  { name: "Kidney Disease", tip: "Low sodium, potassium, phosphorus" },
  { name: "Gout", tip: "Low purine foods" },
  { name: "PCOS", tip: "Low glycemic, anti-inflammatory" },
  { name: "Hypothyroidism", tip: "Iodine-rich, selenium foods" },
  { name: "Anemia", tip: "Iron-rich foods with vitamin C" },
  { name: "Osteoporosis", tip: "Calcium and vitamin D rich" },
];

export const COMMON_MEDICATIONS: { name: string; interactions: string }[] = [
  { name: "Warfarin (Coumadin)", interactions: "Avoid vitamin K-rich foods (leafy greens), limit cranberry, avoid grapefruit" },
  { name: "Statins (Lipitor, Crestor)", interactions: "Avoid grapefruit and grapefruit juice" },
  { name: "MAO Inhibitors", interactions: "Avoid tyramine-rich foods (aged cheese, cured meats, fermented foods, soy sauce)" },
  { name: "Metformin", interactions: "Limit alcohol, take with food to reduce stomach upset" },
  { name: "Lisinopril/ACE Inhibitors", interactions: "Avoid high potassium foods (bananas, oranges, potatoes)" },
  { name: "Levothyroxine (Synthroid)", interactions: "Avoid soy, high-fiber foods, calcium, and coffee near dose time" },
  { name: "Methotrexate", interactions: "Avoid alcohol, increase folic acid intake" },
  { name: "Blood Thinners (Aspirin)", interactions: "Limit vitamin E supplements, fish oil, garlic supplements" },
  { name: "Calcium Channel Blockers", interactions: "Avoid grapefruit and grapefruit juice" },
  { name: "Antibiotics (Tetracycline)", interactions: "Avoid dairy products near dose time" },
  { name: "Potassium-Sparing Diuretics", interactions: "Limit high potassium foods" },
  { name: "Lithium", interactions: "Maintain consistent sodium and caffeine intake" },
];

export type PreferencesFormStrings = typeof PREFERENCES_FORM_STRINGS;
