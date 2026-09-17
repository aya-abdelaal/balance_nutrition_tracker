import Link from "next/link";
import { redirect } from "next/navigation";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry, Profile } from "@/lib/types";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: rows, error }, { data: profile }] = await Promise.all([
    supabase.rpc("get_leaderboard"),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (error) {
    console.error("leaderboard", error);
  }

  const entries = ((rows as LeaderboardEntry[] | null) || []).map((row) => ({
    user_id: row.user_id,
    display_name: row.display_name,
    today: row.today,
    weekly: row.weekly,
    overall: row.overall,
  }));

  const resolved = profile as Profile | null;
  const needsName = !resolved?.display_name?.trim();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          ← Back
        </Link>
        <Link
          href="/settings"
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Settings
        </Link>
      </div>

      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        Leaderboard
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Ranked by weekly score. Today, weekly, and overall for everyone.
      </p>

      {error && (
        <p className="mt-4 text-sm text-[var(--low)]" role="alert">
          Could not load the leaderboard. Run the latest Supabase migration,
          then try again.
        </p>
      )}

      <div className="mt-6">
        <LeaderboardClient
          entries={entries}
          currentUserId={user.id}
          needsName={needsName}
        />
      </div>
    </main>
  );
}
