import type { CategoryScores } from "@/lib/types";

const LABELS: { key: keyof CategoryScores; label: string }[] = [
  { key: "carbs", label: "Carbs" },
  { key: "protein", label: "Protein" },
  { key: "fats", label: "Fats" },
  { key: "fiber", label: "Fiber" },
  { key: "sugar", label: "Sugar" },
  { key: "vitamins", label: "Vitamins" },
];

type Props = {
  categories: CategoryScores | null;
};

export function CategoryBars({ categories }: Props) {
  if (!categories) {
    return (
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          This week&apos;s balance
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Log a few meals to see category estimates.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        This week&apos;s balance
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Relative estimates — not grams or calories.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {LABELS.map(({ key, label }) => {
          const value = categories[key];
          const pct = Math.min(100, (value / 10) * 100);
          return (
            <li key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-[var(--ink)]">{label}</span>
                <span className="text-[var(--muted)]">{value}/10</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                <div
                  className="h-full rounded-full bg-[var(--sage)] transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
