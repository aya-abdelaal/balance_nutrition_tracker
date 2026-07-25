import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";
import type { MealAnalysis } from "./types";

const SYSTEM_PROMPT = `You score meals for a balance-focused nutrition app (80/20 rule), NOT calorie counting.

Core idea: reward CLEAN eating — whole foods, real ingredients, minimal processing.
Penalize ultra-processed foods, packaged junk, refined sugar, and artificial additives.

Given a short free-text meal description, return ONLY valid JSON with this shape:
{
  "healthScore": <integer 0-100>,
  "carbs": <integer 0-10>,
  "protein": <integer 0-10>,
  "fats": <integer 0-10>,
  "fiber": <integer 0-10>,
  "sugar": <integer 0-10>,
  "flags": [<short strings like "high_sugar","low_protein","processed","ultra_processed">],
  "summary": "<short phrase, max 8 words>"
}

Scoring guide (healthScore):
- HIGH (80–100): clean, whole, real-ingredient meals — fresh produce, legumes, eggs, plain yogurt, grilled/roasted meat or fish, whole grains, home-cooked with recognizable ingredients and little or no packaging/processing
- MID (50–79): mixed — mostly real food but with some refined or restaurant-style extras (white bread, mild sauces, modest oil)
- LOW (25–49): heavily refined or processed — fast food, fried items, packaged snacks, sweet baked goods
- VERY LOW (0–24): candy, soda, rich desserts, pastries, ultra-processed junk — almost no whole-food value
- Prefer whole + real over "technically nutritious but processed" (e.g. a simple grilled chicken + rice + veg scores higher than a packaged "protein bar")
- Examples: "grilled fish with vegetables" ~90–98; "rice and chicken" ~75–90; "burger and fries" ~20–40; "tres leches cake" ~8–18; "candy bar" ~5–15
- Category values are relative estimates 0–10, NOT grams or calories
- Be consistent; never invent calorie numbers`;

function clampInt(
  n: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

/**
 * Isolates the outermost JSON object. Responses may be fenced, prefixed with
 * prose, or cut off mid-object, so unterminated output is closed off here.
 */
export function extractJsonObject(raw: string): string {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  if (start === -1) return cleaned;

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
    } else if (char === "}" || char === "]") {
      stack.pop();
      if (stack.length === 0) return cleaned.slice(start, i + 1);
    }
  }

  let repaired = cleaned.slice(start);
  if (inString) repaired += '"';
  repaired = repaired.replace(/,\s*$/, "");
  while (stack.length > 0) {
    repaired += stack.pop();
  }
  return repaired;
}

function parseAnalysis(raw: string): MealAnalysis {
  const data = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;

  const flags = Array.isArray(data.flags)
    ? data.flags.filter((f): f is string => typeof f === "string").slice(0, 6)
    : [];

  return {
    healthScore: clampInt(data.healthScore, 0, 100, 50),
    carbs: clampInt(data.carbs, 0, 10, 5),
    protein: clampInt(data.protein, 0, 10, 5),
    fats: clampInt(data.fats, 0, 10, 5),
    fiber: clampInt(data.fiber, 0, 10, 3),
    sugar: clampInt(data.sugar, 0, 10, 3),
    vitamins: clampInt(data.vitamins, 0, 10, 3),
    flags,
    summary:
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary.trim().slice(0, 80)
        : "Logged meal",
  };
}

export async function analyzeMealWithGemini(
  rawText: string,
): Promise<MealAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Meal analysis is not configured. Missing GEMINI_API_KEY.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 512,
      // Thinking output can be interleaved with the answer and break JSON parsing.
      thinkingConfig: { thinkingBudget: 0 },
    } as GenerationConfig,
  });

  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    let result;
    try {
      result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: `Meal: ${rawText}` },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("429")) {
        throw new Error(
          "Daily meal analysis limit reached. Try again a bit later.",
        );
      }
      throw new Error("Meal analysis is unavailable right now. Try again.");
    }

    const candidate = result.response.candidates?.[0];
    const parts = (candidate?.content?.parts || []).filter(
      (part) => !(part as { thought?: boolean }).thought,
    );
    const text = parts
      .map((part) => ("text" in part && part.text ? part.text : ""))
      .join("")
      .trim();

    if (!text) {
      lastError = `empty response (finishReason: ${candidate?.finishReason ?? "unknown"})`;
      continue;
    }

    try {
      return parseAnalysis(text);
    } catch (err) {
      lastError = `${err instanceof Error ? err.message : "parse error"} | raw: ${text.slice(0, 300)}`;
    }
  }

  console.error("analyzeMealWithGemini failed:", lastError);
  throw new Error("Could not read that meal. Try rewording it.");
}
