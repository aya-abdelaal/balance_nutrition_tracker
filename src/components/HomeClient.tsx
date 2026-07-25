"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CategoryBars } from "@/components/CategoryBars";
import { MealForm } from "@/components/MealForm";
import { ScoreHero } from "@/components/ScoreHero";
import { TipsList } from "@/components/TipsList";
import { WeekLog } from "@/components/WeekLog";
import {
  computeAggregates,
  mealsInLastDays,
} from "@/lib/scoring";
import { createClient } from "@/lib/supabase/client";
import { buildTips } from "@/lib/tips";
import type { Aggregates, Meal, Profile } from "@/lib/types";

const emptyAggregates: Aggregates = {
  today: null,
  weekly: null,
  overall: null,
  categories: null,
  tips: [],
};

export function HomeClient({
  initialMeals,
  profile,
}: {
  initialMeals: Meal[];
  profile: Profile;
}) {
  const [meals, setMeals] = useState(initialMeals);
  const [resetAt, setResetAt] = useState(profile.overall_reset_at);
  const [agg, setAgg] = useState<Aggregates>(() => {
    const base = computeAggregates(initialMeals, profile.overall_reset_at);
    const week = mealsInLastDays(initialMeals, 7);
    return {
      ...base,
      tips: buildTips(base.categories, week.length),
    };
  });

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [{ data: mealRows }, { data: profileRow }] = await Promise.all([
      supabase
        .from("meals")
        .select("*")
        .gte("logged_at", since.toISOString())
        .order("logged_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", profile.id)
        .single(),
    ]);

    const nextMeals = (mealRows as Meal[]) || [];
    const nextReset =
      (profileRow as Profile | null)?.overall_reset_at || resetAt;
    setMeals(nextMeals);
    setResetAt(nextReset);

    const base = computeAggregates(nextMeals, nextReset);
    const week = mealsInLastDays(nextMeals, 7);
    setAgg({
      ...base,
      tips: buildTips(base.categories, week.length),
    });
  }, [profile.id, resetAt]);

  useEffect(() => {
    setMeals(initialMeals);
  }, [initialMeals]);

  const weekMeals = mealsInLastDays(meals, 7);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-6 pt-6">
      <header className="mb-2 flex items-center justify-end">
        <Link
          href="/settings"
          className="text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Settings
        </Link>
      </header>

      <ScoreHero
        today={agg.today}
        weekly={agg.weekly}
        overall={agg.overall}
      />

      <MealForm onLogged={refresh} />

      <CategoryBars categories={agg.categories} />
      <TipsList tips={agg.tips} />
      <WeekLog meals={weekMeals} onDeleted={refresh} />
    </main>
  );
}
