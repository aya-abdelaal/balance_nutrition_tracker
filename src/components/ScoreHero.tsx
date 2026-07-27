import { scoreTone } from "@/lib/scoring";

type Props = {
  today: number | null;
  weekly: number | null;
  overall: number | null;
};

function formatScore(score: number | null): string {
  return score === null ? "—" : `${score}%`;
}

function toneClass(score: number | null): string {
  const tone = scoreTone(score);
  if (tone === "good") return "text-[var(--good)]";
  if (tone === "ok") return "text-[var(--ok)]";
  if (tone === "low") return "text-[var(--low)]";
  return "text-[var(--muted)]";
}

export function ScoreHero({ today, weekly, overall }: Props) {
  return (
    <section className="pt-2">
      <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
        Balance
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Aim for 80%+ healthy intake — not calories.
      </p>

      <div className="mt-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Today
        </p>
        <p
          className={`mt-1 font-[family-name:var(--font-display)] text-7xl leading-none tracking-tight ${toneClass(today)}`}
        >
          {formatScore(today)}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Weekly
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            {formatScore(weekly)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Overall
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            {formatScore(overall)}
          </p>
        </div>
      </div>
    </section>
  );
}
