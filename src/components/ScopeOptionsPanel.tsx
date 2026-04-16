import type { ScopeOption } from '../lib/types';

import { ScopeOptionCard } from './ScopeOptionCard';

interface ScopeOptionsPanelProps {
  options: ScopeOption[];
  recommendedOptionId: string;
}

export function ScopeOptionsPanel({ options, recommendedOptionId }: ScopeOptionsPanelProps) {
  return (
    <section className="scope-options-panel">
      <div className="section-heading">
        <span className="eyebrow">Scope options</span>
        <h2>Multiple ways to structure the work</h2>
        <p>Compare tradeoffs, pricing posture, and delivery risk before you reply to the client.</p>
      </div>
      <div className="scope-options-panel__list">
        {options.map((option) => (
          <ScopeOptionCard
            key={option.id}
            option={option}
            recommended={option.id === recommendedOptionId}
          />
        ))}
      </div>
    </section>
  );
}
