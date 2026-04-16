import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { AnalysisHeader } from './components/AnalysisHeader';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { IntakePanel } from './components/IntakePanel';
import { LoadingState } from './components/LoadingState';
import { QuestionsCard } from './components/QuestionsCard';
import { ReplyDraftCard } from './components/ReplyDraftCard';
import { ScopeOptionsPanel } from './components/ScopeOptionsPanel';
import { SummaryCard } from './components/SummaryCard';
import { analyzeRequest } from './lib/api';
import { buildConstraints, getRecommendedOption } from './lib/format';
import type { AnalyzeResponse, IntakeFormValues } from './lib/types';

const defaultValues: IntakeFormValues = {
  requestText: '',
  budget: '',
  timeline: '',
  techPreferences: '',
  deliveryNotes: '',
  additionalConstraints: '',
};

export default function App() {
  const [values, setValues] = useState<IntakeFormValues>(defaultValues);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const hasResult = Boolean(result);
  const isRefreshing = isLoading && hasResult;

  const recommendedOption = useMemo(
    () => (result ? getRecommendedOption(result) : undefined),
    [result],
  );

  function handleChange(field: keyof IntakeFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  }

  async function runAnalysis() {
    if (!values.requestText.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysis = await analyzeRequest({
        requestText: values.requestText.trim(),
        constraints: buildConstraints(values),
      });

      setResult(analysis);
      setLastSubmittedAt(new Date().toLocaleString());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to analyze this request right now.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAnalysis();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <span className="eyebrow">Scope Sieve</span>
          <h1 className="app-title">Operator-grade scoping, minus the guesswork.</h1>
          <p className="app-subtitle">
            Paste the messy ask, review the structured scope, and send a sharper client reply in one
            pass.
          </p>
        </div>

        <aside className="app-workflow card card--subtle" aria-label="Workflow overview">
          <span className="eyebrow">Single-pass workflow</span>
          <ol className="workflow-list">
            <li>Paste the ask</li>
            <li>Review the options</li>
            <li>Send the reply</li>
          </ol>
          <p>Built for calm, commercially-aware replies when the brief is still messy.</p>
        </aside>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-column dashboard-column--intake">
          <IntakePanel
            values={values}
            isLoading={isLoading}
            lastSubmittedAt={lastSubmittedAt}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </section>

        <section className="dashboard-column dashboard-column--analysis" aria-busy={isLoading}>
          <div className="analysis-stack">
            {error ? <ErrorState message={error} hasResult={hasResult} onRetry={runAnalysis} /> : null}
            {isLoading && !result ? <LoadingState /> : null}
            {isRefreshing ? <LoadingState mode="refresh" /> : null}

            {result ? (
              <>
                <AnalysisHeader
                  intake={result.intake}
                  optionCount={result.options.length}
                  recommendedTitle={recommendedOption?.title}
                />
                <div className="summary-grid">
                  <SummaryCard
                    title="Likely deliverables"
                    items={result.analysis.deliverables}
                    emptyMessage="No clear deliverables surfaced yet. Add more detail about what the client expects shipped."
                  />
                  <SummaryCard
                    title="Assumptions"
                    items={result.analysis.assumptions}
                    emptyMessage="No assumptions surfaced. Confirm dependencies, approvals, and ownership before pricing."
                  />
                  <SummaryCard
                    title="Risks & red flags"
                    items={result.analysis.risks}
                    emptyMessage="No major red flags surfaced. Still verify approvals, content readiness, and integration dependencies."
                  />
                </div>
                <QuestionsCard
                  missingInfo={result.analysis.missingInfo}
                  clarifyingQuestions={result.analysis.clarifyingQuestions}
                />
                <ScopeOptionsPanel
                  options={result.options}
                  recommendedOptionId={result.recommendedOptionId}
                />
                <ReplyDraftCard replyDraft={result.replyDraft} />
              </>
            ) : null}

            {!isLoading && !result && !error ? <EmptyState /> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
