type Props = {
  tips: string[];
};

export function TipsList({ tips }: Props) {
  if (tips.length === 0) return null;

  return (
    <section className="card mt-4 px-4 py-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        Gentle nudges
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tips.map((tip) => (
          <li
            key={tip}
            className="rounded-full border border-[var(--card-border)] bg-white/60 px-3 py-1.5 text-sm text-[var(--sage-deep)]"
          >
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}
