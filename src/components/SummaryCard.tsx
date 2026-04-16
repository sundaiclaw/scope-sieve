interface SummaryCardProps {
  title: string;
  items: string[];
  emptyMessage?: string;
}

export function SummaryCard({ title, items, emptyMessage }: SummaryCardProps) {
  return (
    <section className="summary-card card">
      <h3>{title}</h3>
      <ul className="bullet-list">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>{emptyMessage ?? 'No items surfaced yet. Add more context to the intake and rerun the analysis.'}</li>
        )}
      </ul>
    </section>
  );
}
