import type { Aggregates, CategoryScores, Meal } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function isBlankMealInput(text: string): boolean {
  return text.trim().length === 0;
}

export function averageScores(meals: Pick<Meal, "health_score">[]): number | null {
  if (meals.length === 0) return null;
  const sum = meals.reduce((acc, m) => acc + m.health_score, 0);
  return Math.round(sum / meals.length);
}

export function startOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function mealsToday(
  meals: Meal[],
  now: Date = new Date(),
): Meal[] {
  const start = startOfLocalDay(now).getTime();
  const end = start + DAY_MS;
  return meals.filter((m) => {
    const t = new Date(m.logged_at).getTime();
    return t >= start && t < end;
  });
}

export function mealsInLastDays(
  meals: Meal[],
  days: number,
  now: Date = new Date(),
): Meal[] {
  const cutoff = now.getTime() - days * DAY_MS;
  return meals.filter((m) => new Date(m.logged_at).getTime() >= cutoff);
}

export function mealsSince(
  meals: Meal[],
  sinceIso: string,
): Meal[] {
  const since = new Date(sinceIso).getTime();
  return meals.filter((m) => new Date(m.logged_at).getTime() >= since);
}

export function averageCategories(
  meals: Meal[],
): CategoryScores | null {
  if (meals.length === 0) return null;
  const keys = ["carbs", "protein", "fats", "fiber", "sugar", "vitamins"] as const;
  const result = {} as CategoryScores;
  for (const key of keys) {
    const sum = meals.reduce((acc, m) => acc + m[key], 0);
    result[key] = Math.round((sum / meals.length) * 10) / 10;
  }
  return result;
}

export function computeAggregates(
  meals: Meal[],
  overallResetAt: string,
  now: Date = new Date(),
): Aggregates {
  const todayMeals = mealsToday(meals, now);
  const weeklyMeals = mealsInLastDays(meals, 7, now);
  const overallMeals = mealsSince(meals, overallResetAt);

  return {
    today: averageScores(todayMeals),
    weekly: averageScores(weeklyMeals),
    overall: averageScores(overallMeals),
    categories: averageCategories(weeklyMeals),
    tips: [], // filled by tip helper
  };
}

export function scoreTone(score: number | null): "empty" | "good" | "ok" | "low" {
  if (score === null) return "empty";
  if (score >= 80) return "good";
  if (score >= 60) return "ok";
  return "low";
}
