import { splitConstraints } from '../lib/format';
import type { IntakeSummary } from '../lib/types';

interface AnalysisHeaderProps {
  intake: IntakeSummary;
  optionCount: number;
  recommendedTitle?: string;
}

export function AnalysisHeader({ intake, optionCount, recommendedTitle }: AnalysisHeaderProps) {
  const constraintLines = splitConstraints(intake.constraints);

  return (
    <section className="analysis-header card">
      <div className="analysis-header__content">
        <span className="eyebrow">Distilled brief</span>
        <h2>{intake.summary}</h2>
        <p className="analysis-header__request">{intake.requestText}</p>
      </div>

      <div className="analysis-header__stats">
        <div className="stat-card">
          <span className="stat-card__label">Scope options</span>
          <strong>{optionCount}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Recommended</span>
          <strong>{recommendedTitle || 'In progress'}</strong>
        </div>
      </div>

      {constraintLines.length > 0 ? (
        <div className="constraint-list">
          <span className="eyebrow">Captured constraints</span>
          <ul>
            {constraintLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
