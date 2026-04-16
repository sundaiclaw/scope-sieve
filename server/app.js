import express from 'express';
import path from 'node:path';

import { ZodError } from 'zod';

import { analyzeClientRequest, UserFacingError } from './openrouter.js';
import {
  analyzeRequestSchema,
  analyzeResponseSchema,
  getRequestValidationMessage,
} from './schema.js';

export function createApp({ analyzer = analyzeClientRequest, distDir } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.post('/api/analyze', async (request, response, next) => {
    const parsedRequest = analyzeRequestSchema.safeParse(request.body ?? {});

    if (!parsedRequest.success) {
      return response.status(400).json({
        error: getRequestValidationMessage(parsedRequest.error),
      });
    }

    try {
      const analysis = await analyzer(parsedRequest.data);
      const payload = analyzeResponseSchema.parse({
        ...analysis,
        intake: {
          requestText: parsedRequest.data.requestText,
          constraints: parsedRequest.data.constraints,
          summary: analysis.intake.summary,
        },
      });

      return response.json(payload);
    } catch (error) {
      return next(error);
    }
  });

  if (distDir) {
    app.use(express.static(distDir));
    app.get(/^(?!\/(?:api|health)\b).*/, (_request, response) => {
      response.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use((error, _request, response, _next) => {
    void _next;

    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({
        error: 'Request body must be valid JSON.',
      });
    }

    if (error instanceof UserFacingError) {
      return response.status(error.statusCode).json({
        error: error.message,
      });
    }

    if (error instanceof ZodError) {
      return response.status(502).json({
        error: 'The AI returned an invalid analysis format. Please try again.',
      });
    }

    console.error(error);

    return response.status(500).json({
      error: 'Something went wrong while analyzing the request. Please try again.',
    });
  });

  return app;
}
