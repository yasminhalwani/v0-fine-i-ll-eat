import { generateText } from "ai";

export async function POST(req: Request) {
  const { imageData, context } = await req.json();

  const isExampleContext = context?.includes("meal examples");

  const prompt = isExampleContext
    ? `Analyze this image of food/meals.

Extract information about the meals shown. These are meals the user enjoys and wants similar recommendations for.

For each meal or dish you can identify, provide:
- The name of the dish
- Key ingredients or cooking style
- Cuisine type if identifiable

Format your response as a simple list, with each meal on a new line like:
"Grilled salmon with roasted vegetables and lemon butter sauce"
"Spicy Korean bibimbap with gochujang and fried egg"
"Classic Italian carbonara with pancetta"

Be descriptive but concise. Focus on the flavors, ingredients, and cooking methods that make these dishes appealing.`
    : `Analyze this image from a meal delivery service (like HelloFresh, Blue Apron, Factor, etc.).

Extract the meal information and return it in a clear, structured format.

For each meal you find, provide:
- The day of the week (if visible)
- The meal type (breakfast, lunch, dinner, snack)
- The meal name/title
- Key ingredients (if visible)

Format your response as a simple list, with each meal on a new line like:
"Monday Dinner: Teriyaki Salmon with Jasmine Rice and Broccoli"
"Tuesday Lunch: Mediterranean Chicken Salad with Feta"

If you can't determine the day, just describe the meal:
"Dinner: Beef Stir-Fry with Vegetables and Noodles"

Only list the meals you can clearly identify. Be concise.`;

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4-20250514",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageData,
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  return Response.json({ meals: text });
}
