type Props = {
  tips: string[];
};

export function TipsList({ tips }: Props) {
  if (tips.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        Gentle nudges
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {tips.map((tip) => (
          <li
            key={tip}
            className="text-sm text-[var(--sage-deep)]"
          >
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}
