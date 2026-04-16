# Scope Sieve

Scope Sieve turns messy client asks into structured scope options, clarifying questions, pricing angles, and a client-ready reply draft.

## Stack

- React + TypeScript + Vite frontend
- Express backend at the repo root
- OpenRouter for AI analysis
- Vitest + Testing Library + Supertest for validation

## What it does

- Accepts a rough client request plus optional scope constraints
- Distills the brief into likely deliverables, assumptions, risks, and gaps
- Produces multiple viable scope options with tradeoffs and pricing angles
- Recommends a direction and drafts a clear client reply

## Environment variables

Copy `.env.example` to `.env` and set:

- `OPENROUTER_BASE_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `PORT` (optional, defaults to `8080`)

## Local development

Install dependencies:

```bash
bun install
```

Run the frontend and backend together:

```bash
bun run dev
```

- Vite runs the dashboard in development
- The Express server handles `/api/analyze` and `/health`
- Vite proxies API requests to `http://localhost:8080`

## Scripts

```bash
bun run build      # build the frontend
bun run start      # start the Express server
bun run lint       # lint the repo
bun run typecheck  # TypeScript checks
bun run test       # run automated tests
```

## Production build

Build the frontend bundle:

```bash
bun run build
```

Then start the server:

```bash
bun run start
```

In production, the server serves the built `dist/` assets and falls back to `dist/index.html` for non-API routes.

## Docker / Cloud Run

Build the container:

```bash
docker build -t scope-sieve .
```

Run it locally:

```bash
docker run --rm -p 8080:8080 --env-file .env scope-sieve
```

Example Cloud Run deploy flow:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/scope-sieve

gcloud run deploy scope-sieve \
  --image gcr.io/PROJECT_ID/scope-sieve \
  --platform managed \
  --region REGION \
  --allow-unauthenticated
```

## Health check

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{ "ok": true }
```

## Deployment URLs

- Live app: https://scope-sieve-859414203684.us-central1.run.app
- Sundai page: https://www.sundai.club/projects/5390c10f-e639-472b-a8fa-6322921132cc
- GitHub repo: https://github.com/sundaiclaw/scope-sieve
