import type { AnalyzeResponse, IntakeFormValues, ScopeOption } from './types';

const constraintFields: Array<[string, keyof IntakeFormValues]> = [
  ['Budget', 'budget'],
  ['Timeline', 'timeline'],
  ['Tech preferences', 'techPreferences'],
  ['Delivery notes', 'deliveryNotes'],
  ['Additional constraints', 'additionalConstraints'],
];

export function buildConstraints(values: IntakeFormValues) {
  return constraintFields
    .map(([label, key]) => {
      const value = values[key].trim();
      return value ? `${label}: ${value}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

export function splitConstraints(constraints: string) {
  return constraints
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getRecommendedOption(result: AnalyzeResponse): ScopeOption | undefined {
  return result.options.find((option) => option.id === result.recommendedOptionId);
}
