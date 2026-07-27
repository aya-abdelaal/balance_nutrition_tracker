"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Meal } from "@/lib/types";

type Props = {
  meals: Meal[];
  onDeleted: () => void;
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayHeading(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WeekLog({ meals, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Meal[]>();
    for (const meal of meals) {
      const key = dayKey(meal.logged_at);
      const list = map.get(key) || [];
      list.push(meal);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([key, dayMeals]) => ({
      key,
      heading: formatDayHeading(dayMeals[0].logged_at),
      meals: dayMeals,
    }));
  }, [meals]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || groups.length === 0) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / groups.length;
      if (cardWidth <= 0) return;
      setActive(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [groups.length]);

  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [groups.length]);

  async function deleteMeal(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch("/api/delete-meal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not delete meal.");
        return;
      }
      onDeleted();
    } catch {
      setError("Could not delete meal.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10 pb-8">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        This week
      </h2>
      {meals.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          No meals logged in the last 7 days.
        </p>
      ) : (
        <>
          <div
            ref={scrollerRef}
            className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1"
          >
            {groups.map((group) => (
              <article
                key={group.key}
                className="card flex w-[85%] shrink-0 snap-center flex-col px-4 py-4"
              >
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  {group.heading}
                </h3>
                <ul className="mt-2 divide-y divide-[var(--line)]">
                  {group.meals.map((meal) => (
                    <li
                      key={meal.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--ink)]">
                          {meal.raw_text}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                          {meal.summary ? `${meal.summary} · ` : ""}
                          {formatTime(meal.logged_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                          {meal.health_score}%
                        </span>
                        <button
                          type="button"
                          aria-label={`Delete ${meal.raw_text}`}
                          disabled={deletingId === meal.id}
                          onClick={() => deleteMeal(meal.id)}
                          className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--low)] disabled:opacity-50"
                        >
                          {deletingId === meal.id ? (
                            <span className="block h-4 w-4 animate-pulse rounded-full bg-[var(--muted)]/40" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {groups.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
              {groups.map((group, i) => (
                <span
                  key={group.key}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: active === i ? 20 : 6,
                    background: active === i ? "var(--sage)" : "var(--line)",
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
      {error && (
        <p className="mt-2 text-sm text-[var(--low)]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
