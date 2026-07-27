"use client";

import { FormEvent, useState } from "react";
import { isBlankMealInput } from "@/lib/scoring";

type Props = {
  onLogged: () => void;
};

export function MealForm({ onLogged }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isBlankMealInput(text)) {
      setError("Please describe what you ate.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not log meal.");
        return;
      }
      setText("");
      onLogged();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 px-4 py-4">
      <label
        htmlFor="meal"
        className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]"
      >
        Log a meal
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="meal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you eat? e.g. rice and chicken"
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-white/80 px-3 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--sage)]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-[var(--sage)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--sage-deep)] disabled:opacity-60"
        >
          {loading ? "…" : "Log"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--low)]" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
