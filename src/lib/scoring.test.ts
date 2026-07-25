import { describe, expect, it } from "vitest";
import {
  averageScores,
  computeAggregates,
  isBlankMealInput,
  mealsInLastDays,
  mealsSince,
  mealsToday,
  scoreTone,
} from "./scoring";
import type { Meal } from "./types";

function meal(
  overrides: Partial<Meal> & { health_score: number; logged_at: string },
): Meal {
  return {
    id: overrides.id || crypto.randomUUID(),
    user_id: "u1",
    raw_text: overrides.raw_text || "meal",
    health_score: overrides.health_score,
    carbs: overrides.carbs ?? 5,
    protein: overrides.protein ?? 5,
    fats: overrides.fats ?? 5,
    fiber: overrides.fiber ?? 5,
    sugar: overrides.sugar ?? 5,
    vitamins: overrides.vitamins ?? 5,
    flags: [],
    summary: "meal",
    logged_at: overrides.logged_at,
    created_at: overrides.logged_at,
  };
}

describe("isBlankMealInput", () => {
  it("rejects empty and whitespace", () => {
    expect(isBlankMealInput("")).toBe(true);
    expect(isBlankMealInput("   ")).toBe(true);
    expect(isBlankMealInput("croissant")).toBe(false);
  });
});

describe("averageScores", () => {
  it("returns null for empty", () => {
    expect(averageScores([])).toBeNull();
  });

  it("rounds the mean", () => {
    expect(
      averageScores([{ health_score: 40 }, { health_score: 80 }]),
    ).toBe(60);
  });
});

describe("computeAggregates", () => {
  const now = new Date("2026-07-25T15:00:00");

  it("computes today, weekly, and overall windows", () => {
    const meals = [
      meal({ health_score: 40, logged_at: "2026-07-25T10:00:00" }),
      meal({ health_score: 80, logged_at: "2026-07-25T12:00:00" }),
      meal({ health_score: 90, logged_at: "2026-07-20T12:00:00" }),
      meal({ health_score: 20, logged_at: "2026-07-01T12:00:00" }),
    ];

    const agg = computeAggregates(meals, "2026-07-10T00:00:00", now);

    expect(agg.today).toBe(60);
    expect(agg.weekly).toBe(70);
    expect(agg.overall).toBe(70);
    expect(mealsToday(meals, now)).toHaveLength(2);
    expect(mealsInLastDays(meals, 7, now)).toHaveLength(3);
    expect(mealsSince(meals, "2026-07-10T00:00:00")).toHaveLength(3);
  });

  it("returns null scores when no meals in window", () => {
    const agg = computeAggregates([], "2026-07-01T00:00:00", now);
    expect(agg.today).toBeNull();
    expect(agg.weekly).toBeNull();
    expect(agg.overall).toBeNull();
  });
});

describe("scoreTone", () => {
  it("maps thresholds", () => {
    expect(scoreTone(null)).toBe("empty");
    expect(scoreTone(85)).toBe("good");
    expect(scoreTone(70)).toBe("ok");
    expect(scoreTone(40)).toBe("low");
  });
});
