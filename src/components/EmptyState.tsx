export function EmptyState() {
  return (
    <section className="empty-state card">
      <span className="eyebrow">Analysis workspace</span>
      <h2>Paste the client ask. Review the scope. Send the reply.</h2>
      <p>
        Start with the raw request. Budget, timing, stakeholders, and delivery notes sharpen the
        analysis and keep the recommendation grounded.
      </p>

      <div className="empty-state__grid">
        <section className="empty-state__section">
          <h3>What you will get</h3>
          <ul className="empty-state__list">
            <li>Likely deliverables and hidden assumptions</li>
            <li>Risks, missing information, and clarifying questions</li>
            <li>Scope options, pricing angles, and a client-ready reply draft</li>
          </ul>
        </section>

        <section className="empty-state__section">
          <h3>Useful inputs</h3>
          <ul className="empty-state__list">
            <li>Budget range or pricing guardrails</li>
            <li>Deadlines, launch windows, or decision milestones</li>
            <li>Required tools, integrations, approval layers, or support expectations</li>
          </ul>
        </section>
      </div>
    </section>
  );
}
