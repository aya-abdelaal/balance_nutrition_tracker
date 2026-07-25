import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import type { Meal, Profile } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [{ data: profile }, { data: meals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("meals")
      .select("*")
      .gte("logged_at", since.toISOString())
      .order("logged_at", { ascending: false }),
  ]);

  let resolvedProfile = profile as Profile | null;

  if (!resolvedProfile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id })
      .select()
      .single();
    resolvedProfile = created as Profile | null;
  }

  if (!resolvedProfile) {
    redirect("/login");
  }

  return (
    <HomeClient
      initialMeals={(meals as Meal[]) || []}
      profile={resolvedProfile}
    />
  );
}
