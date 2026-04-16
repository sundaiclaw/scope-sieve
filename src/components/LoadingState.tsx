interface LoadingStateProps {
  mode?: 'initial' | 'refresh';
}

export function LoadingState({ mode = 'initial' }: LoadingStateProps) {
  const refreshing = mode === 'refresh';

  return (
    <section
      className={`loading-state card ${refreshing ? 'loading-state--compact card--subtle' : ''}`}
      aria-live="polite"
    >
      <span className="eyebrow">{refreshing ? 'Refreshing analysis' : 'Analyzing request'}</span>
      <h2>{refreshing ? 'Updating the scope options…' : 'Turning the brief into scope options…'}</h2>
      <p>
        {refreshing
          ? 'Keeping the last analysis in view while the latest intake is processed.'
          : 'Pulling out deliverables, risks, missing info, pricing angles, and a clean client reply.'}
      </p>
      <div className="loading-state__bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
