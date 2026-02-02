import { readFile } from "fs/promises";
import path from "path";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
/** Timeout for OpenRouter (weekly plan = large prompt + 21 meals). Increase if you still hit timeouts. */
const OPENROUTER_TIMEOUT_MS = 180_000; // 3 minutes

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
  model: string = DEFAULT_MODEL
): Promise<string> {
  const apiKey = (process.env.OPENROUTER_API_KEY ?? "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env or .env.local. Get a key at https://openrouter.ai/keys"
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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

/** Strip markdown code fence if present and parse JSON. */
export function parseJsonFromLlmResponse(raw: string): unknown {
  let text = raw.trim();
  const codeFence = /^```(?:json)?\s*\n?([\s\S]*?)```\s*$/;
  const match = text.match(codeFence);
  if (match) text = match[1].trim();
  return JSON.parse(text) as unknown;
}
