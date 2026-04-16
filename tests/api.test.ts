import { afterEach, describe, expect, it, vi } from 'vitest';

import { analyzeRequest } from '../src/lib/api';
import type { AnalyzeResponse } from '../src/lib/types';

const validResponse: AnalyzeResponse = {
  intake: {
    requestText: 'Client needs a launch-ready marketing site.',
    constraints: 'Budget: $20k',
    summary: 'Launch a polished site with clear messaging and analytics.',
  },
  analysis: {
    deliverables: ['Homepage', 'Analytics setup'],
    assumptions: ['Brand assets already exist'],
    risks: ['Approvals may slow the schedule'],
    missingInfo: ['Final sitemap'],
    clarifyingQuestions: ['Who owns content approvals?'],
  },
  options: [
    {
      id: 'lean',
      title: 'Lean sprint',
      summary: 'Fastest route to launch.',
      deliverables: ['Homepage'],
      assumptions: ['Existing copy can be reused'],
      risks: ['Limited experimentation'],
      pricingAngle: 'Fixed-fee sprint',
      tradeoffs: ['Smaller QA window'],
      rationale: 'Optimizes for speed.',
    },
    {
      id: 'balanced',
      title: 'Balanced plan',
      summary: 'Adds analytics and more launch confidence.',
      deliverables: ['Homepage', 'Analytics setup'],
      assumptions: ['Weekly stakeholder reviews are possible'],
      risks: ['More coordination required'],
      pricingAngle: 'Milestone fee',
      tradeoffs: ['Longer delivery runway'],
      rationale: 'Balances confidence and pace.',
    },
  ],
  recommendedOptionId: 'balanced',
  replyDraft: 'Thanks for the context — here is the scope I recommend.',
};

describe('analyzeRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the validated analysis payload on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(validResponse),
      }),
    );

    await expect(
      analyzeRequest({
        requestText: 'Need help scoping a launch site.',
        constraints: 'Budget: $20k',
      }),
    ).resolves.toEqual(validResponse);
  });

  it('converts network failures into a user-facing message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(
      analyzeRequest({
        requestText: 'Need help scoping a launch site.',
        constraints: '',
      }),
    ).rejects.toThrow(/unable to reach scope sieve right now/i);
  });

  it('rejects unexpected success payloads before the UI can render them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ replyDraft: 'Missing the rest of the contract' }),
      }),
    );

    await expect(
      analyzeRequest({
        requestText: 'Need help scoping a launch site.',
        constraints: '',
      }),
    ).rejects.toThrow(/unexpected analysis payload/i);
  });

  it('rejects success payloads that break the scope-option contract', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          ...validResponse,
          recommendedOptionId: 'premium',
        }),
      }),
    );

    await expect(
      analyzeRequest({
        requestText: 'Need help scoping a launch site.',
        constraints: '',
      }),
    ).rejects.toThrow(/unexpected analysis payload/i);
  });
});
