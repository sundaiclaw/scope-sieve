export interface AnalyzeRequestPayload {
  requestText: string;
  constraints: string;
}

export interface IntakeFormValues {
  requestText: string;
  budget: string;
  timeline: string;
  techPreferences: string;
  deliveryNotes: string;
  additionalConstraints: string;
}

export interface IntakeSummary {
  requestText: string;
  constraints: string;
  summary: string;
}

export interface AnalysisDetails {
  deliverables: string[];
  assumptions: string[];
  risks: string[];
  missingInfo: string[];
  clarifyingQuestions: string[];
}

export interface ScopeOption {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  assumptions: string[];
  risks: string[];
  pricingAngle: string;
  tradeoffs: string[];
  rationale: string;
}

export interface AnalyzeResponse {
  intake: IntakeSummary;
  analysis: AnalysisDetails;
  options: ScopeOption[];
  recommendedOptionId: string;
  replyDraft: string;
}
