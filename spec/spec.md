IDEATION OUTPUT
Title: Scope Sieve
Description: AI turns messy client asks into scoped options, clarifying questions, and a reply draft.

Spec Seed:
- What it does: Scope Sieve helps freelancers, agencies, and operators turn ambiguous client requests into a clean plan of attack. It extracts deliverables, identifies hidden assumptions and risks, proposes scope tiers or pricing angles, and drafts the client reply.
- Who it's for: Freelancers, consultants, and small agencies responding to vague inbound client requests.
- Core job: When a client brief is vague and risky, I want a clear scope and response plan, so I can reply confidently without underpricing or overcommitting.
- Current alternative: People manually decode email threads, guess the scope in their heads, and send fragile replies that miss risks or leave money on the table.
- Key differentiator: It combines scope design, risk surfacing, pricing framing, and client communication in one flow.
- AI integration: AI interprets messy requests, extracts likely deliverables and gaps, generates structured scope options, suggests clarifying questions, and writes the client-facing response.
- Demo flow: Paste the messy ask; generate structured options; inspect risks/questions/pricing angles; copy the reply draft.
- Tech stack suggestion: React + TypeScript frontend, Node/Express backend, OpenRouter free model integration.
- Riskiest assumption: Users must trust the generated scope; mitigate by showing explicit assumptions, red flags, and rationale next to every option.
Engagement hook: Paste a chaotic client message and get your smartest professional reply in seconds.

Design Direction:
- Visual style: dashboard
- Reference design system: Fintech (Stripe-inspired)
- Color palette: #0F172A, #1D4ED8, #14B8A6, #F8FAFC, #CBD5E1
- Font pairing: Space Grotesk + Inter
- Layout: single page scroll
- Key polish target: the structured scope-options panel should feel premium, fast, and trustworthy

Change name:
- scope-sieve-launch
