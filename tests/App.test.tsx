import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../src/App';
import type { AnalyzeResponse } from '../src/lib/types';

const analyzeRequestMock = vi.fn();

vi.mock('../src/lib/api', () => ({
  analyzeRequest: (...args: unknown[]) => analyzeRequestMock(...args),
}));

const sampleResponse: AnalyzeResponse = {
  intake: {
    requestText: 'Client needs a launch-ready product marketing site.',
    constraints: 'Budget: $20k\nTimeline: six weeks',
    summary: 'Launch a polished marketing site with enough structure to support conversion and handoff.',
  },
  analysis: {
    deliverables: ['Homepage', 'Messaging pass'],
    assumptions: ['Brand direction is already approved'],
    risks: ['Content approvals may slow launch'],
    missingInfo: ['Final sitemap'],
    clarifyingQuestions: ['Who owns content sign-off?'],
  },
  options: [
    {
      id: 'lean',
      title: 'Lean launch sprint',
      summary: 'Fastest route to a clean launch.',
      deliverables: ['Homepage'],
      assumptions: ['Existing copy is reusable'],
      risks: ['Less experimentation'],
      pricingAngle: 'Fixed-fee sprint',
      tradeoffs: ['Limited page depth'],
      rationale: 'Keeps the timeline tight.',
    },
    {
      id: 'balanced',
      title: 'Balanced delivery plan',
      summary: 'More robust launch with measurement support.',
      deliverables: ['Homepage', 'Analytics setup'],
      assumptions: ['Stakeholders are available weekly'],
      risks: ['More coordination required'],
      pricingAngle: 'Milestone-based fee',
      tradeoffs: ['Slightly longer runway'],
      rationale: 'Balances quality and speed.',
    },
  ],
  recommendedOptionId: 'balanced',
  replyDraft:
    'Thanks for the brief — based on your timeline, I recommend a balanced launch scope with a clear review cadence.',
};

describe('App', () => {
  beforeEach(() => {
    analyzeRequestMock.mockReset();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('blocks submit while the request textarea is empty', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /generate scope options/i })).toBeDisabled();
  });

  it('shows a loading state and then renders the structured analysis', async () => {
    const user = userEvent.setup();
    let resolveRequest: ((value: AnalyzeResponse) => void) | undefined;

    analyzeRequestMock.mockImplementation(
      () =>
        new Promise<AnalyzeResponse>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<App />);

    await user.type(
      screen.getByLabelText(/messy client request/i),
      'Need a launch-ready site, analytics, and tighter messaging before the next campaign.',
    );
    await user.click(screen.getByRole('button', { name: /generate scope options/i }));

    expect(screen.getByText(/turning the brief into scope options/i)).toBeInTheDocument();

    resolveRequest?.(sampleResponse);

    expect(
      await screen.findByRole('heading', { name: /balanced delivery plan/i, level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/likely deliverables/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy reply/i })).toBeVisible();
  });

  it('keeps the last result visible while a refreshed analysis runs', async () => {
    const user = userEvent.setup();
    let resolveFirstRequest: ((value: AnalyzeResponse) => void) | undefined;
    let resolveSecondRequest: ((value: AnalyzeResponse) => void) | undefined;

    analyzeRequestMock
      .mockImplementationOnce(
        () =>
          new Promise<AnalyzeResponse>((resolve) => {
            resolveFirstRequest = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<AnalyzeResponse>((resolve) => {
            resolveSecondRequest = resolve;
          }),
      );

    render(<App />);

    const requestField = screen.getByLabelText(/messy client request/i);

    await user.type(requestField, 'Need help scoping a productized service landing page.');
    await user.click(screen.getByRole('button', { name: /generate scope options/i }));

    resolveFirstRequest?.(sampleResponse);

    expect(
      await screen.findByRole('heading', { name: /balanced delivery plan/i, level: 3 }),
    ).toBeInTheDocument();

    await user.clear(requestField);
    await user.type(requestField, 'Need help scoping a landing page plus analytics dashboard.');
    await user.click(screen.getByRole('button', { name: /generate scope options/i }));

    expect(screen.getByText(/updating the scope options/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /balanced delivery plan/i, level: 3 })).toBeVisible();

    resolveSecondRequest?.(sampleResponse);

    await waitFor(() => {
      expect(screen.queryByText(/updating the scope options/i)).not.toBeInTheDocument();
    });
  });

  it('renders API errors for the operator to review', async () => {
    const user = userEvent.setup();
    analyzeRequestMock.mockRejectedValue(
      new Error('OpenRouter is rate limiting requests right now. Please try again in a minute.'),
    );

    render(<App />);

    await user.type(screen.getByLabelText(/messy client request/i), 'Need help scoping a redesign.');
    await user.click(screen.getByRole('button', { name: /generate scope options/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/rate limiting/i);
    });

    expect(screen.getByRole('button', { name: /try analysis again/i })).toBeVisible();
  });
});
