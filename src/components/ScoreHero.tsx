"use client";

import { useEffect, useRef, useState } from "react";
import { scoreTone } from "@/lib/scoring";

type Props = {
  today: number | null;
  weekly: number | null;
  overall: number | null;
};

function formatScore(score: number | null): string {
  return score === null ? "—" : `${score}%`;
}

function toneVar(score: number | null): string {
  const tone = scoreTone(score);
  if (tone === "good") return "var(--good)";
  if (tone === "ok") return "var(--ok)";
  if (tone === "low") return "var(--low)";
  return "var(--muted)";
}

function ScoreRing({
  score,
  size,
  stroke,
}: {
  score: number | null;
  size: number;
  stroke: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score === null ? 0 : (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--line)"
        strokeWidth={stroke}
        opacity={0.6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={toneVar(score)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.7s ease-out" }}
      />
    </svg>
  );
}

const CARDS: {
  key: "today" | "weekly" | "overall";
  label: string;
  caption: string;
}[] = [
  { key: "today", label: "Today", caption: "Resets every day" },
  { key: "weekly", label: "Weekly", caption: "Rolling last 7 days" },
  { key: "overall", label: "Overall", caption: "Since your last reset" },
];

export function ScoreHero({ today, weekly, overall }: Props) {
  const scores = { today, weekly, overall };
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / CARDS.length;
      setActive(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="pt-2">
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1"
      >
        {CARDS.map(({ key, label, caption }) => {
          const score = scores[key];
          return (
            <article
              key={key}
              className="card flex w-[82%] shrink-0 snap-center flex-col items-center px-6 py-7 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {label}
              </p>
              <div className="relative mt-4">
                <ScoreRing score={score} size={168} stroke={10} />
                <p
                  className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] text-5xl tracking-tight"
                  style={{ color: toneVar(score) }}
                >
                  {formatScore(score)}
                </p>
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">{caption}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {CARDS.map((card, i) => (
          <span
            key={card.key}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === i ? 20 : 6,
              background: active === i ? "var(--sage)" : "var(--line)",
            }}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Aim for 80%+ healthy intake — balance, not calories.
      </p>
    </section>
  );
}
