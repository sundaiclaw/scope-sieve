import type { ScopeOption } from '../lib/types';

interface ScopeOptionCardProps {
  option: ScopeOption;
  recommended: boolean;
}

export function ScopeOptionCard({ option, recommended }: ScopeOptionCardProps) {
  return (
    <article className={`scope-option card ${recommended ? 'scope-option--recommended' : ''}`}>
      <header className="scope-option__header">
        <div>
          <span className="eyebrow">{recommended ? 'Recommended path' : 'Scope option'}</span>
          <h3>{option.title}</h3>
        </div>
        {recommended ? <span className="recommended-badge">Best fit</span> : null}
      </header>

      <p className="scope-option__summary">{option.summary}</p>

      <div className="scope-option__grid">
        <section>
          <h4>Deliverables</h4>
          <ul className="bullet-list">
            {option.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Assumptions</h4>
          <ul className="bullet-list">
            {option.assumptions.length > 0 ? (
              option.assumptions.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No major assumptions called out. Confirm dependencies before this goes to the client.</li>
            )}
          </ul>
        </section>
        <section>
          <h4>Risks</h4>
          <ul className="bullet-list">
            {option.risks.length > 0 ? (
              option.risks.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No material risks called out yet. Double-check approvals and integration complexity.</li>
            )}
          </ul>
        </section>
        <section>
          <h4>Tradeoffs</h4>
          <ul className="bullet-list">
            {option.tradeoffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <dl className="scope-option__details">
        <div>
          <dt>Pricing angle</dt>
          <dd>{option.pricingAngle}</dd>
        </div>
        <div>
          <dt>Rationale</dt>
          <dd>{option.rationale}</dd>
        </div>
      </dl>
    </article>
  );
}
