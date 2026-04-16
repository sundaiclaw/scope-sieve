interface QuestionsCardProps {
  missingInfo: string[];
  clarifyingQuestions: string[];
}

export function QuestionsCard({ missingInfo, clarifyingQuestions }: QuestionsCardProps) {
  return (
    <section className="questions-card card">
      <div>
        <h3>Missing information</h3>
        <ul className="bullet-list">
          {missingInfo.length > 0 ? (
            missingInfo.map((item) => <li key={item}>{item}</li>)
          ) : (
            <li>No major gaps detected. Confirm budget, approvals, and ownership before committing.</li>
          )}
        </ul>
      </div>
      <div>
        <h3>Clarifying questions</h3>
        <ul className="bullet-list">
          {clarifyingQuestions.length > 0 ? (
            clarifyingQuestions.map((item) => <li key={item}>{item}</li>)
          ) : (
            <li>No urgent follow-up questions surfaced. Only probe further if alignment still feels soft.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
