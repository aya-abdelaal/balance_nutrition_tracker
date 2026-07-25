import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MealAnalysis } from "./types";

const SYSTEM_PROMPT = `You score meals for a balance-focused nutrition app (80/20 rule), NOT calorie counting.

Given a short free-text meal description, return ONLY valid JSON with this shape:
{
  "healthScore": <integer 0-100>,
  "carbs": <integer 0-10>,
  "protein": <integer 0-10>,
  "fats": <integer 0-10>,
  "fiber": <integer 0-10>,
  "sugar": <integer 0-10>,
  "vitamins": <integer 0-10>,
  "flags": [<short strings like "high_sugar","low_protein","processed">],
  "summary": "<short phrase, max 8 words>"
}

Scoring guide:
- Higher healthScore = whole foods, vegetables, lean protein, balanced plate
- Lower healthScore = ultra-processed, sugary, deep-fried, candy, pastries
- Examples: "croissant" ~35-50; "rice and chicken" ~70-85; "candy bar" ~15-30; "salad with grilled fish" ~85-95
- Category values are relative estimates 0-10, NOT grams or calories
- Be consistent and conservative; never invent calorie numbers`;

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function parseAnalysis(raw: string): MealAnalysis {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const data = JSON.parse(cleaned) as Record<string, unknown>;

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

export async function analyzeMealWithGemini(rawText: string): Promise<MealAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Meal analysis is not configured. Missing GEMINI_API_KEY.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `Meal: ${rawText}` },
  ]);

  const text = result.response.text();
  if (!text) {
    throw new Error("Empty response from meal analysis.");
  }

  try {
    return parseAnalysis(text);
  } catch {
    throw new Error("Could not parse meal analysis. Try again.");
  }
}
