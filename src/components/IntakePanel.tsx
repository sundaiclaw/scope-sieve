import type { FormEvent } from 'react';

import type { IntakeFormValues } from '../lib/types';

interface IntakePanelProps {
  values: IntakeFormValues;
  isLoading: boolean;
  lastSubmittedAt: string | null;
  onChange: (field: keyof IntakeFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function IntakePanel({
  values,
  isLoading,
  lastSubmittedAt,
  onChange,
  onSubmit,
}: IntakePanelProps) {
  const submitDisabled = !values.requestText.trim() || isLoading;

  return (
    <div className="intake-panel">
      <div className="panel-heading">
        <span className="eyebrow">Client intake</span>
        <h1>Turn a chaotic ask into scoped options.</h1>
        <p>
          Paste the raw brief, thread, or call notes. Add any constraints you already know, then
          generate a structured plan and client-ready reply.
        </p>
      </div>

      <form className="intake-form" onSubmit={onSubmit} aria-busy={isLoading}>
        <label className="field">
          <span>Messy client request</span>
          <textarea
            name="requestText"
            rows={12}
            placeholder="Paste the email chain, Slack dump, voice note transcript, or rough bullet list here."
            value={values.requestText}
            onChange={(event) => onChange('requestText', event.target.value)}
          />
          <small className="field-hint">
            Best results come from raw client language plus any known budget, timing, approvals, or
            required integrations.
          </small>
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Budget</span>
            <input
              name="budget"
              type="text"
              placeholder="$15k–$25k, hourly cap, or unknown"
              value={values.budget}
              onChange={(event) => onChange('budget', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Timeline</span>
            <input
              name="timeline"
              type="text"
              placeholder="Launch date, deadline, or rough pace"
              value={values.timeline}
              onChange={(event) => onChange('timeline', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Tech preferences</span>
          <input
            name="techPreferences"
            type="text"
            placeholder="Required stack, integrations, or platform preferences"
            value={values.techPreferences}
            onChange={(event) => onChange('techPreferences', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Delivery notes</span>
          <textarea
            name="deliveryNotes"
            rows={4}
            placeholder="Any expectations around handoff, meetings, approvals, or support"
            value={values.deliveryNotes}
            onChange={(event) => onChange('deliveryNotes', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Additional constraints</span>
          <textarea
            name="additionalConstraints"
            rows={4}
            placeholder="Anything else that should influence scope, risk, or pricing"
            value={values.additionalConstraints}
            onChange={(event) => onChange('additionalConstraints', event.target.value)}
          />
        </label>

        <button className="button-primary" type="submit" disabled={submitDisabled}>
          {isLoading ? <span className="button-spinner" aria-hidden="true" /> : null}
          <span>{isLoading ? 'Analyzing request…' : 'Generate scope options'}</span>
        </button>
      </form>

      <div className="intake-meta card card--subtle">
        <div className="intake-meta__status">
          {isLoading ? <span className="status-dot" aria-hidden="true" /> : null}
          <p>
            {isLoading
              ? 'Refreshing the analysis. Your current structured output stays visible while this pass runs.'
              : 'The right-hand analysis stays anchored to the last submitted request while you keep refining the intake on the left.'}
          </p>
        </div>
        {lastSubmittedAt ? <p>Last analyzed: {lastSubmittedAt}</p> : <p>No analysis run yet.</p>}
      </div>
    </div>
  );
}
