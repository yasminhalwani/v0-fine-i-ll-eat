import os
import json
import warnings
from pathlib import Path

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent
PROMPTS_DIR = PROJECT_ROOT / "prompts"

# Suppress requests' urllib3/chardet version warning (does not affect behavior)
warnings.filterwarnings("ignore", message=".*urllib3.*chardet.*")

# Load .env from the same directory as this script so it works from any cwd
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def prompt_llm(prompt_text: str, model: str = "meta-llama/llama-3.3-70b-instruct") -> str:
    api_key = (os.getenv("OPENROUTER_API_KEY") or "").strip().strip('"').strip("'")
    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not set. Add it to a .env file in this directory, e.g.:\n"
            "  OPENROUTER_API_KEY=sk-or-v1-your-key-here\n"
            "Get a key at https://openrouter.ai/keys"
        )

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Optional but recommended for OpenRouter usage tracking:
        # "HTTP-Referer": "http://localhost",
        # "X-Title": "Your App Name",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.7,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=30)
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        try:
            error_detail = response.json()
        except ValueError:
            error_detail = response.text
        raise RuntimeError(
            f"OpenRouter request failed ({response.status_code}): {error_detail}"
        ) from exc
    data = response.json()
    return data["choices"][0]["message"]["content"]


def load_prompt(filename: str) -> str:
    """Read a prompt template from the prompts folder (same .txt used by the app)."""
    path = PROMPTS_DIR / filename
    if not path.is_file():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return path.read_text(encoding="utf-8").strip()


def substitute_prompt_variables(
    template: str,
    variables: dict[str, str | int | list[str] | None],
) -> str:
    """Replace {{key}} placeholders. Values can be str, int, or list (joined by ', ')."""
    result = template
    for key, value in variables.items():
        if value is None:
            text = ""
        elif isinstance(value, list):
            text = ", ".join(value) if value else "None"
        else:
            text = str(value)
        result = result.replace("{{" + key + "}}", text)
    return result


def prompt_llm_from_file(
    filename: str,
    variables: dict[str, str | int | list[str] | None] | None = None,
    model: str = "meta-llama/llama-3.3-70b-instruct",
) -> str:
    """Load prompt from prompts/<filename>, substitute variables, and call the LLM."""
    template = load_prompt(filename)
    prompt = substitute_prompt_variables(template, variables or {})
    return prompt_llm(prompt, model=model)

def save_text_to_file(filename: str, text: str) -> None:
    with open(filename, "w", encoding="utf-8") as file:
        file.write(text)

def read_text_from_file(filename: str) -> str:
    with open(filename, "r", encoding="utf-8") as file:
        return file.read()

def save_json_to_file(filename: str, data: dict) -> None:
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def read_json_from_file(filename: str) -> dict:
    with open(filename, "r", encoding="utf-8") as file:
        return json.load(file)

def main() -> None:
    example_prompt = "Give me three quick dinner ideas using chicken."
    try:
        output_text = prompt_llm(example_prompt)
        print("Prompt:", example_prompt)
        print("Response:", output_text)
    except (requests.RequestException, RuntimeError) as exc:
        print("Request failed:", exc)
        if "401" in str(exc):
            print("Hint: Check that OPENROUTER_API_KEY in .env is correct. Get a key at https://openrouter.ai/keys")
    except ValueError as exc:
        print("Configuration error:", exc)


if __name__ == "__main__":
    main()