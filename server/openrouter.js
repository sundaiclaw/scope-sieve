import { buildRepairPrompt, buildSystemPrompt, buildUserPrompt } from './prompt.js';
import { validateAnalyzeResponse } from './schema.js';

export class UserFacingError extends Error {
  constructor(message, { statusCode = 500, cause } = {}) {
    super(message, { cause });
    this.name = 'UserFacingError';
    this.statusCode = statusCode;
  }
}

function getOpenRouterConfig() {
  const baseUrl = process.env.OPENROUTER_BASE_URL?.trim();
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();

  if (!baseUrl || !apiKey || !model) {
    throw new UserFacingError(
      'OpenRouter is not configured. Set OPENROUTER_BASE_URL, OPENROUTER_API_KEY, and OPENROUTER_MODEL.',
      { statusCode: 500 },
    );
  }

  return {
    endpoint: baseUrl.endsWith('/chat/completions')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/chat/completions`,
    apiKey,
    model,
  };
}

function extractResponseText(payload) {
  const choice = payload?.choices?.[0];
  const content = choice?.message?.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        return entry?.text || '';
      })
      .join('')
      .trim();
  }

  return '';
}

function extractJsonObject(rawText) {
  const trimmed = rawText.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');

  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
    }

    throw new Error('Model response did not contain valid JSON.');
  }
}

async function requestCompletion(messages) {
  const { endpoint, apiKey, model } = getOpenRouterConfig();

  let response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
      }),
    });
  } catch (error) {
    throw new UserFacingError('Unable to reach the AI analysis service right now. Please try again.', {
      statusCode: 502,
      cause: error,
    });
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new UserFacingError(
        'OpenRouter is rate limiting requests right now. Please try again in a minute.',
        {
          statusCode: 429,
        },
      );
    }

    throw new UserFacingError('The AI analysis service returned an error. Please try again.', {
      statusCode: 502,
    });
  }

  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    throw new UserFacingError('The AI analysis service returned an unreadable response. Please try again.', {
      statusCode: 502,
      cause: error,
    });
  }

  const content = extractResponseText(payload);

  if (!content) {
    throw new UserFacingError('The AI analysis service returned an empty response. Please try again.', {
      statusCode: 502,
    });
  }

  return content;
}

async function parseAndValidate(rawText) {
  return validateAnalyzeResponse(extractJsonObject(rawText));
}

export async function analyzeClientRequest(input) {
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(input) },
  ];

  const firstResponse = await requestCompletion(messages);

  try {
    return await parseAndValidate(firstResponse);
  } catch (error) {
    const repairedResponse = await requestCompletion([
      ...messages,
      { role: 'assistant', content: firstResponse },
      {
        role: 'user',
        content: buildRepairPrompt(
          firstResponse,
          error instanceof Error ? error.message : 'Response failed validation.',
        ),
      },
    ]);

    try {
      return await parseAndValidate(repairedResponse);
    } catch (repairError) {
      throw new UserFacingError('The AI returned an invalid analysis format. Please try again.', {
        statusCode: 502,
        cause: repairError,
      });
    }
  }
}
