"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialName?: string;
  onSaved?: (name: string) => void;
  heading?: string;
  description?: string;
};

export function DisplayNameForm({
  initialName = "",
  onSaved,
  heading = "Your name",
  description = "Shown on the leaderboard.",
}: Props) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name to continue.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBusy(false);
      setError("You need to be signed in.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id);

    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Name saved.");
    onSaved?.(trimmed);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="sr-only">Display name</span>
        <input
          type="text"
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder="Name or username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--sage)]"
        />
      </label>
      {error && (
        <p className="text-sm text-[var(--low)]" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-[var(--sage-deep)]" role="status">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-[var(--sage)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--sage-deep)] disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
