import { readFile } from "fs/promises";
import path from "path";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
/** Default: 70B is thorough but slow. Set OPENROUTER_MODEL to e.g. meta-llama/llama-3.1-8b-instruct for faster Vercel response. */
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
/** Vercel Pro allows 60s; Hobby allows 10s. Use 55s so we fall back to static DB before kill. */
const OPENROUTER_TIMEOUT_MS = typeof process !== "undefined" && process.env.VERCEL
  ? 55_000
  : 180_000;

/**
 * Read a prompt template from the prompts folder (same idea as utils.prompt_llm + .txt files).
 * Uses process.cwd() so it works from project root in Next.js API routes.
 */
export async function readPromptFile(filename: string): Promise<string> {
  const fullPath = path.join(process.cwd(), "prompts", filename);
  const content = await readFile(fullPath, "utf-8");
  return content.trim();
}

/**
 * Substitute {{key}} placeholders in a template. Values can be string, number, or array (joined by ", ").
 */
export function substitutePromptVariables(
  template: string,
  variables: Record<string, string | number | string[] | undefined>
): string {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    const str =
      value === undefined || value === null
        ? ""
        : Array.isArray(value)
          ? value.join(", ") || "None"
          : String(value);
    out = out.replace(placeholder, str);
  }
  return out;
}

/**
 * Call OpenRouter chat API (same behavior as utils.prompt_llm in Python).
 * Use OPENROUTER_API_KEY in env (e.g. .env.local for Next.js).
 */
export async function promptLlm(
  promptText: string,
  model?: string
): Promise<string> {
  const apiKey = (
    process.env.OPENROUTER_API_KEY ??
    process.env.OPENROUTER_KEY ??
    ""
  ).trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it in Vercel: Project → Settings → Environment Variables. Get a key at https://openrouter.ai/keys"
    );
  }
  const resolvedModel = model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [{ role: "user", content: promptText }],
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(
      `OpenRouter request failed (${response.status}): ${JSON.stringify(detail)}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (content == null) {
    throw new Error("OpenRouter response missing choices[0].message.content");
  }
  return content;
}

/**
 * Load a prompt from prompts/*.txt, substitute variables, and call the LLM.
 */
export async function promptLlmWithTemplate(
  promptFilename: string,
  variables: Record<string, string | number | string[] | undefined>,
  model?: string
): Promise<string> {
  const template = await readPromptFile(promptFilename);
  const prompt = substitutePromptVariables(template, variables);
  return promptLlm(prompt, model);
}

/** Strip markdown code fence if present. */
function stripCodeFence(text: string): string {
  let out = text.trim();
  const codeFence = /^```(?:json)?\s*\n?([\s\S]*?)```\s*$/;
  const match = out.match(codeFence);
  if (match) out = match[1].trim();
  return out;
}

/**
 * Try to salvage a truncated JSON array when the LLM output is cut off.
 * - Tries appending "]" or "}]" in case the array/object wasn't closed.
 * - Tries truncating at the last "}," to get complete meal objects only.
 */
function trySalvageMealsArray(text: string): unknown[] | null {
  if (!text.startsWith("[")) return null;
  const attempts = [
    () => JSON.parse(text + "]") as unknown[],
    () => JSON.parse(text + "\"}]") as unknown[], // close string, object, array
    () => JSON.parse(text.replace(/,(\s*)$/, "$1]")) as unknown[], // trailing comma
  ];
  for (const attempt of attempts) {
    try {
      const parsed = attempt();
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* try next */
    }
  }
  // Find last "}," and parse [ ... up to that point ]
  let lastIdx = -1;
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === "}" && text[i + 1] === ",") lastIdx = i + 2;
  }
  if (lastIdx > 10) {
    try {
      const parsed = JSON.parse(text.slice(0, lastIdx) + "]") as unknown[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Strip markdown code fence if present and parse JSON. Tries to salvage truncated meal arrays. */
export function parseJsonFromLlmResponse(raw: string): unknown {
  const text = stripCodeFence(raw);
  try {
    return JSON.parse(text) as unknown;
  } catch (firstErr) {
    const salvaged = trySalvageMealsArray(text);
    if (salvaged != null && salvaged.length > 0) return salvaged;
    throw firstErr;
  }
}
