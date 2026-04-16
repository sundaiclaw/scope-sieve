import type { AnalyzeRequestPayload, AnalyzeResponse } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringList(value: unknown, { min = 0 } = {}): value is string[] {
  return Array.isArray(value) && value.length >= min && value.every((item) => isNonEmptyString(item));
}

function isScopeOption(value: unknown): value is AnalyzeResponse['options'][number] {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    isStringList(value.deliverables, { min: 1 }) &&
    isStringList(value.assumptions) &&
    isStringList(value.risks) &&
    isNonEmptyString(value.pricingAngle) &&
    isStringList(value.tradeoffs, { min: 1 }) &&
    isNonEmptyString(value.rationale)
  );
}

function hasUniqueOptionIds(options: AnalyzeResponse['options']) {
  return new Set(options.map((option) => option.id)).size === options.length;
}

function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!isRecord(value)) {
    return false;
  }

  const { intake, analysis, options, recommendedOptionId, replyDraft } = value;

  if (
    !isRecord(intake) ||
    !isNonEmptyString(intake.requestText) ||
    typeof intake.constraints !== 'string' ||
    !isNonEmptyString(intake.summary)
  ) {
    return false;
  }

  if (
    !isRecord(analysis) ||
    !isStringList(analysis.deliverables, { min: 1 }) ||
    !isStringList(analysis.assumptions) ||
    !isStringList(analysis.risks) ||
    !isStringList(analysis.missingInfo) ||
    !isStringList(analysis.clarifyingQuestions)
  ) {
    return false;
  }

  if (
    !Array.isArray(options) ||
    options.length < 2 ||
    !isNonEmptyString(recommendedOptionId) ||
    !isNonEmptyString(replyDraft)
  ) {
    return false;
  }

  if (!options.every(isScopeOption)) {
    return false;
  }

  return hasUniqueOptionIds(options) && options.some((option) => option.id === recommendedOptionId);
}

export async function analyzeRequest(payload: AnalyzeRequestPayload): Promise<AnalyzeResponse> {
  let response: Response;

  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Unable to reach Scope Sieve right now. Check your connection and try again.');
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? 'Scope Sieve returned an unreadable analysis payload. Please try again.'
        : 'Unable to analyze this request right now.',
    );
  }

  if (!response.ok) {
    throw new Error(
      isRecord(responseBody) && typeof responseBody.error === 'string'
        ? responseBody.error
        : 'Unable to analyze this request right now.',
    );
  }

  if (!isAnalyzeResponse(responseBody)) {
    throw new Error('Scope Sieve returned an unexpected analysis payload. Please try again.');
  }

  return responseBody;
}
