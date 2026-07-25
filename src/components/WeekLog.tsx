import type { Meal } from "@/lib/types";

type Props = {
  meals: Meal[];
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WeekLog({ meals }: Props) {
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
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {meals.map((meal) => (
            <li key={meal.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ink)]">
                  {meal.summary || meal.raw_text}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                  {meal.raw_text}
                  {" · "}
                  {formatWhen(meal.logged_at)}
                </p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                {meal.health_score}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
