import { describe, expect, it } from 'vitest';

import {
  analyzeRequestSchema,
  normalizeAnalyzeResponse,
  validateAnalyzeResponse,
} from '../server/schema.js';

describe('server schema', () => {
  it('trims and validates the analyze request payload', () => {
    expect(
      analyzeRequestSchema.parse({
        requestText: '  Need a Shopify redesign with CRO help.  ',
        constraints: '  Budget: under $20k  ',
      }),
    ).toEqual({
      requestText: 'Need a Shopify redesign with CRO help.',
      constraints: 'Budget: under $20k',
    });
  });

  it('normalizes string fields and array-like values from the AI response', () => {
    const normalized = normalizeAnalyzeResponse({
      intake: {
        requestText: '  Shopify redesign  ',
        constraints: null,
        summary: '  Redesign the storefront and tighten conversion flows.  ',
      },
      analysis: {
        deliverables: 'Homepage redesign',
        assumptions: [' Existing brand is usable '],
        risks: undefined,
        missingInfo: [' Final decision maker '],
        clarifyingQuestions: 'What analytics access is available?',
      },
      options: [
        {
          id: ' lean ',
          title: ' Lean sprint ',
          summary: '  Focus on highest-leverage pages. ',
          deliverables: 'Homepage update',
          assumptions: ['Copy exists'],
          risks: ['Stakeholder delays'],
          pricingAngle: 'Fixed-fee sprint',
          tradeoffs: 'Smaller QA pass',
          rationale: 'Fastest route to launch',
        },
        {
          id: 'balanced',
          title: 'Balanced engagement',
          summary: 'Broader redesign with measurement plan',
          deliverables: ['Homepage', 'PDP'],
          assumptions: [],
          risks: [],
          pricingAngle: 'Milestone pricing',
          tradeoffs: ['Longer timeline'],
          rationale: 'Balances confidence and speed',
        },
      ],
      recommendedOptionId: 'balanced',
      replyDraft: '  Here is how I would approach the project.  ',
    });

    expect(normalized.analysis.deliverables).toEqual(['Homepage redesign']);
    expect(normalized.analysis.clarifyingQuestions).toEqual([
      'What analytics access is available?',
    ]);
    expect(normalized.options[0].tradeoffs).toEqual(['Smaller QA pass']);
    expect(normalized.replyDraft).toBe('Here is how I would approach the project.');
  });

  it('rejects responses whose recommended option is missing', () => {
    expect(() =>
      validateAnalyzeResponse({
        intake: {
          requestText: 'Client wants a launch site',
          constraints: '',
          summary: 'Launch site with a tight timeline.',
        },
        analysis: {
          deliverables: ['Marketing site'],
          assumptions: [],
          risks: [],
          missingInfo: [],
          clarifyingQuestions: [],
        },
        options: [
          {
            id: 'lean',
            title: 'Lean',
            summary: 'Fast path',
            deliverables: ['Single landing page'],
            assumptions: [],
            risks: [],
            pricingAngle: 'Flat fee',
            tradeoffs: ['Less testing'],
            rationale: 'Meets the deadline',
          },
          {
            id: 'balanced',
            title: 'Balanced',
            summary: 'More robust plan',
            deliverables: ['Landing page', 'Analytics'],
            assumptions: [],
            risks: [],
            pricingAngle: 'Milestone fee',
            tradeoffs: ['More coordination'],
            rationale: 'Better launch confidence',
          },
        ],
        recommendedOptionId: 'premium',
        replyDraft: 'Thanks for the brief. Here is my recommendation.',
      }),
    ).toThrow(/recommendedOptionId/);
  });
});
