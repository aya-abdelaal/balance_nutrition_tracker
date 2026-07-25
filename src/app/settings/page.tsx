"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function resetOverall() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/reset-overall", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setMessage("Overall score reset. New meals will rebuild it.");
      setConfirming(false);
    } catch {
      setError("Reset failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
      <Link
        href="/home"
        className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
      >
        ← Back
      </Link>

      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        Settings
      </h1>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          Overall score
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Reset clears the overall average window. Your meal history stays;
          only the overall score starts fresh.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--ink)] hover:border-[var(--sage)]"
          >
            Reset overall score
          </button>
        ) : (
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/70 p-4">
            <p className="text-sm text-[var(--ink)]">
              Reset overall score? This cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={resetOverall}
                className="rounded-xl bg-[var(--low)] px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {busy ? "Resetting…" : "Confirm reset"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className="rounded-xl px-4 py-2 text-sm text-[var(--muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-3 text-sm text-[var(--sage-deep)]" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-[var(--low)]" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="mt-10">
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-xl bg-[var(--sage)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--sage-deep)]"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
