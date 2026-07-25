import { describe, expect, it } from "vitest";
import { extractJsonObject } from "./gemini";

describe("extractJsonObject", () => {
  it("returns a plain object unchanged", () => {
    const raw = '{"healthScore": 80}';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({ healthScore: 80 });
  });

  it("strips code fences", () => {
    const raw = '```json\n{"healthScore": 42}\n```';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({ healthScore: 42 });
  });

  it("ignores prose around the object", () => {
    const raw = 'Here you go:\n{"healthScore": 10}\nHope that helps.';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({ healthScore: 10 });
  });

  it("closes a truncated object", () => {
    const raw = '{\n "healthScore": 0,\n "summary": "Unrecognizable meal"';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({
      healthScore: 0,
      summary: "Unrecognizable meal",
    });
  });

  it("closes truncated nested arrays and strings", () => {
    const raw = '{"flags": ["high_sugar", "ultra_proc';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({
      flags: ["high_sugar", "ultra_proc"],
    });
  });

  it("drops a dangling comma before closing", () => {
    const raw = '{"healthScore": 12, "carbs": 8,';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({
      healthScore: 12,
      carbs: 8,
    });
  });

  it("does not consume braces inside strings", () => {
    const raw = '{"summary": "cake {with} frosting"}';
    expect(JSON.parse(extractJsonObject(raw))).toEqual({
      summary: "cake {with} frosting",
    });
  });
});
