import { NextResponse } from "next/server";
import { analyzeMealWithGemini } from "@/lib/gemini";
import { isBlankMealInput } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";

    if (isBlankMealInput(text)) {
      return NextResponse.json(
        { error: "Please describe what you ate." },
        { status: 400 },
      );
    }

    const analysis = await analyzeMealWithGemini(text.trim());

    const { data: meal, error } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        raw_text: text.trim(),
        health_score: analysis.healthScore,
        carbs: analysis.carbs,
        protein: analysis.protein,
        fats: analysis.fats,
        fiber: analysis.fiber,
        sugar: analysis.sugar,
        vitamins: analysis.vitamins,
        flags: analysis.flags,
        summary: analysis.summary,
      })
      .select()
      .single();

    if (error) {
      console.error("meal insert error", error);
      return NextResponse.json(
        { error: "Could not save meal. Try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ meal });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Meal analysis failed.";
    console.error("analyze-meal", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
