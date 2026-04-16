import { z } from 'zod';

function toCleanString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value.map(toCleanString).filter(Boolean);
  }

  const singleValue = toCleanString(value);
  return singleValue ? [singleValue] : [];
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const nonEmptyString = z.string().trim().min(1);
const stringListSchema = z.array(nonEmptyString);

export const analyzeRequestSchema = z
  .object({
    requestText: z.string().trim().min(1, 'Please paste the client request before analyzing.'),
    constraints: z.string().optional().default('').transform((value) => value.trim()),
  })
  .strict();

const scopeOptionSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    summary: nonEmptyString,
    deliverables: stringListSchema.min(1, 'Each scope option needs at least one deliverable.'),
    assumptions: stringListSchema,
    risks: stringListSchema,
    pricingAngle: nonEmptyString,
    tradeoffs: stringListSchema.min(1, 'Each scope option needs at least one tradeoff.'),
    rationale: nonEmptyString,
  })
  .strict();

export const analyzeResponseSchema = z
  .object({
    intake: z
      .object({
        requestText: nonEmptyString,
        constraints: z.string(),
        summary: nonEmptyString,
      })
      .strict(),
    analysis: z
      .object({
        deliverables: stringListSchema.min(1, 'At least one deliverable is required.'),
        assumptions: stringListSchema,
        risks: stringListSchema,
        missingInfo: stringListSchema,
        clarifyingQuestions: stringListSchema,
      })
      .strict(),
    options: z.array(scopeOptionSchema).min(2, 'Provide at least two scope options.'),
    recommendedOptionId: nonEmptyString,
    replyDraft: nonEmptyString,
  })
  .strict()
  .superRefine((value, context) => {
    const optionIds = new Set(value.options.map((option) => option.id));

    if (!optionIds.has(value.recommendedOptionId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recommendedOptionId'],
        message: 'recommendedOptionId must match one of the returned options.',
      });
    }
  });

export function normalizeAnalyzeResponse(input) {
  const source = isRecord(input) ? input : {};
  const intake = isRecord(source.intake) ? source.intake : {};
  const analysis = isRecord(source.analysis) ? source.analysis : {};
  const rawOptions = Array.isArray(source.options) ? source.options : [];

  return {
    intake: {
      requestText: toCleanString(intake.requestText),
      constraints: toCleanString(intake.constraints),
      summary: toCleanString(intake.summary),
    },
    analysis: {
      deliverables: toStringList(analysis.deliverables),
      assumptions: toStringList(analysis.assumptions),
      risks: toStringList(analysis.risks),
      missingInfo: toStringList(analysis.missingInfo),
      clarifyingQuestions: toStringList(analysis.clarifyingQuestions),
    },
    options: rawOptions.map((option) => {
      const normalizedOption = isRecord(option) ? option : {};

      return {
        id: toCleanString(normalizedOption.id),
        title: toCleanString(normalizedOption.title),
        summary: toCleanString(normalizedOption.summary),
        deliverables: toStringList(normalizedOption.deliverables),
        assumptions: toStringList(normalizedOption.assumptions),
        risks: toStringList(normalizedOption.risks),
        pricingAngle: toCleanString(normalizedOption.pricingAngle),
        tradeoffs: toStringList(normalizedOption.tradeoffs),
        rationale: toCleanString(normalizedOption.rationale),
      };
    }),
    recommendedOptionId: toCleanString(source.recommendedOptionId),
    replyDraft: toCleanString(source.replyDraft),
  };
}

export function validateAnalyzeResponse(input) {
  return analyzeResponseSchema.parse(normalizeAnalyzeResponse(input));
}

export function getRequestValidationMessage(error) {
  return error.issues[0]?.message || 'Request payload is invalid.';
}
