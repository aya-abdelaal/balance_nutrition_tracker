"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DisplayNameForm } from "@/components/DisplayNameForm";
import type { LeaderboardEntry } from "@/lib/types";

function formatScore(score: number | null): string {
  return score === null ? "—" : `${score}%`;
}

export function LeaderboardClient({
  entries,
  currentUserId,
  needsName,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
  needsName: boolean;
}) {
  const router = useRouter();
  const [showNameForm, setShowNameForm] = useState(needsName);

  return (
    <>
      {showNameForm && (
        <section className="card mb-6 p-4">
          <DisplayNameForm
            heading="Pick a name"
            description="Add a name or username so others can find you on the board."
            onSaved={() => {
              setShowNameForm(false);
              router.refresh();
            }}
          />
        </section>
      )}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No one is on the board yet. Log a meal to get started.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {entries.map((entry, index) => {
            const isYou = entry.user_id === currentUserId;
            const label =
              entry.display_name?.trim() ||
              (isYou ? "You" : "Anonymous");

            return (
              <li
                key={entry.user_id}
                className={`card px-4 py-3 ${
                  isYou ? "ring-1 ring-[var(--sage)]/40" : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      #{index + 1}
                      {isYou ? " · you" : ""}
                    </p>
                    <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                      {label}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                      Today
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                      {formatScore(entry.today)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                      Weekly
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                      {formatScore(entry.weekly)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                      Overall
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                      {formatScore(entry.overall)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
