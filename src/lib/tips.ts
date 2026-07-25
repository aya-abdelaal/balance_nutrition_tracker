import type { CategoryScores } from "./types";

const MIN_MEALS_FOR_TIPS = 2;

/** Soft "add more X" tips from weekly category averages (0–10 scale). */
export function buildTips(
  categories: CategoryScores | null,
  mealCount: number,
): string[] {
  if (!categories || mealCount < MIN_MEALS_FOR_TIPS) return [];

  const tips: string[] = [];

  if (categories.protein < 4) tips.push("Add more protein");
  if (categories.fiber < 4) tips.push("Add more fiber");
  if (categories.sugar > 6) tips.push("Add more balance — sugar looks high");
  if (categories.fats > 7 && categories.fiber < 5) {
    tips.push("Add more fiber alongside richer meals");
  }

  return tips.slice(0, 3);
}
