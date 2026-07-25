import { describe, expect, it } from "vitest";
import { buildTips } from "./tips";

describe("buildTips", () => {
  it("returns no tips without enough meals", () => {
    expect(
      buildTips(
        {
          carbs: 2,
          protein: 2,
          fats: 2,
          fiber: 2,
          sugar: 8,
          vitamins: 2,
        },
        1,
      ),
    ).toEqual([]);
  });

  it("suggests add more for weak categories", () => {
    const tips = buildTips(
      {
        carbs: 5,
        protein: 2,
        fats: 5,
        fiber: 2,
        sugar: 8,
        vitamins: 2,
      },
      3,
    );
    expect(tips).toContain("Add more protein");
    expect(tips).toContain("Add more fiber");
    expect(tips).toContain("Add more vitamins");
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it("returns empty when categories are null", () => {
    expect(buildTips(null, 5)).toEqual([]);
  });
});
