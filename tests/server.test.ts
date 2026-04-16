import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../server/app.js';
import { UserFacingError } from '../server/openrouter.js';

const validAnalysis = {
  intake: {
    requestText: 'ignored by app',
    constraints: 'ignored by app',
    summary: 'A polished site launch with explicit analytics and risk framing.',
  },
  analysis: {
    deliverables: ['Marketing site', 'Analytics instrumentation'],
    assumptions: ['Client already has brand assets'],
    risks: ['Decision maker feedback could slip the timeline'],
    missingInfo: ['Exact CMS preference'],
    clarifyingQuestions: ['Who signs off on copy and design?'],
  },
  options: [
    {
      id: 'lean',
      title: 'Lean launch sprint',
      summary: 'Fastest route to a launch-ready presence.',
      deliverables: ['Homepage', 'Contact flow'],
      assumptions: ['Existing copy can be edited'],
      risks: ['Reduced experimentation'],
      pricingAngle: 'Fixed-fee sprint',
      tradeoffs: ['Less content depth'],
      rationale: 'Prioritizes speed and launch confidence.',
    },
    {
      id: 'balanced',
      title: 'Balanced launch plan',
      summary: 'Launch plus measurement and content support.',
      deliverables: ['Homepage', 'Analytics', 'QA checklist'],
      assumptions: ['Stakeholders can review weekly'],
      risks: ['Slightly longer schedule'],
      pricingAngle: 'Milestone pricing',
      tradeoffs: ['More review overhead'],
      rationale: 'Balances delivery confidence with scope coverage.',
    },
  ],
  recommendedOptionId: 'balanced',
  replyDraft: 'Thanks for the context — here is the scope I recommend and how I would structure it.',
};

describe('createApp', () => {
  it('reports health', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('rejects an empty client request', async () => {
    const analyzer = vi.fn();
    const response = await request(createApp({ analyzer })).post('/api/analyze').send({
      requestText: '   ',
      constraints: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/paste the client request/i);
    expect(analyzer).not.toHaveBeenCalled();
  });

  it('returns structured analysis and preserves the submitted intake values', async () => {
    const analyzer = vi.fn().mockResolvedValue(validAnalysis);
    const response = await request(createApp({ analyzer })).post('/api/analyze').send({
      requestText: '  Need a launch-ready site and analytics before June.  ',
      constraints: '  Budget: $25k max  ',
    });

    expect(response.status).toBe(200);
    expect(analyzer).toHaveBeenCalledWith({
      requestText: 'Need a launch-ready site and analytics before June.',
      constraints: 'Budget: $25k max',
    });
    expect(response.body.intake.requestText).toBe('Need a launch-ready site and analytics before June.');
    expect(response.body.intake.constraints).toBe('Budget: $25k max');
    expect(response.body.intake.summary).toBe(validAnalysis.intake.summary);
    expect(response.body.recommendedOptionId).toBe('balanced');
  });

  it('surfaces user-facing upstream errors', async () => {
    const analyzer = vi.fn().mockRejectedValue(
      new UserFacingError('OpenRouter is rate limiting requests right now. Please try again in a minute.', {
        statusCode: 429,
      }),
    );

    const response = await request(createApp({ analyzer })).post('/api/analyze').send({
      requestText: 'Need scoping help',
      constraints: '',
    });

    expect(response.status).toBe(429);
    expect(response.body.error).toMatch(/rate limiting/i);
  });
});
