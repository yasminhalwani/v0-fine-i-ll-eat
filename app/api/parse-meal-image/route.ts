export async function POST(req: Request) {
  // PoC mode: image parsing disabled (no AI)
  // Return empty string so UI doesn't add any meals.
  return Response.json({ meals: "" });
}
