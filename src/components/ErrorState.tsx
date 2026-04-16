interface ErrorStateProps {
  message: string;
  hasResult: boolean;
  onRetry: () => void;
}

function getGuidance(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('rate limiting')) {
    return [
      'Wait a moment, then run the analysis again.',
      'If this keeps happening, check your model quota or provider limits.',
    ];
  }

  if (normalizedMessage.includes('reach') || normalizedMessage.includes('connection')) {
    return [
      'Check your network or confirm the local server is still running.',
      'Retry once the connection is stable.',
    ];
  }

  if (normalizedMessage.includes('payload') || normalizedMessage.includes('unreadable')) {
    return [
      'Retry the analysis once in case the upstream response was transient.',
      'If it repeats, inspect the API response or model configuration before sending a client reply.',
    ];
  }

  return [
    'Retry the analysis after reviewing the intake for the key deliverables and constraints.',
    'If the issue persists, shorten the pasted request to the essentials and try again.',
  ];
}

export function ErrorState({ message, hasResult, onRetry }: ErrorStateProps) {
  const guidance = getGuidance(message);

  return (
    <section className="error-state card" role="alert" aria-live="assertive">
      <div className="error-state__header">
        <span className="eyebrow">Analysis blocked</span>
        <h2>Couldn&apos;t finish this pass.</h2>
      </div>
      <p>{message}</p>
      {hasResult ? (
        <p className="error-state__note">Your last successful analysis is still visible below while you retry.</p>
      ) : null}
      <ul className="error-state__list">
        {guidance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="button-secondary" type="button" onClick={onRetry}>
        Try analysis again
      </button>
    </section>
  );
}
