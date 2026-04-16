const responseShape = `{
  "intake": {
    "requestText": "repeat the client request in concise form",
    "constraints": "repeat the constraints in concise form or empty string",
    "summary": "2-3 sentence distilled brief"
  },
  "analysis": {
    "deliverables": ["deliverable"],
    "assumptions": ["assumption"],
    "risks": ["risk or red flag"],
    "missingInfo": ["missing detail"],
    "clarifyingQuestions": ["client question"]
  },
  "options": [
    {
      "id": "short-slug",
      "title": "Option title",
      "summary": "What this option delivers and why it fits",
      "deliverables": ["deliverable"],
      "assumptions": ["assumption"],
      "risks": ["risk"],
      "pricingAngle": "How to frame the price",
      "tradeoffs": ["tradeoff"],
      "rationale": "Why this option is viable"
    }
  ],
  "recommendedOptionId": "short-slug",
  "replyDraft": "A clear, confident, practical response to the client."
}`;

export function buildSystemPrompt() {
  return [
    'You are Scope Sieve, an operator-grade scoping assistant for freelancers and agencies.',
    'Your job is to turn messy client asks into a trustworthy scoping brief with multiple viable options.',
    'The output must feel calm, premium, practical, and decisive.',
    'Return JSON only. No markdown, no prose outside JSON, no code fences.',
    'Always surface assumptions, risks, missing information, clarifying questions, and pricing angles.',
    'Return at least two materially different scope options with concrete tradeoffs.',
    'The reply draft must be client-ready, clear, confident, and practical.',
  ].join(' ');
}

export function buildUserPrompt({ requestText, constraints }) {
  return [
    'Analyze the following messy client request and return structured JSON matching the required schema exactly.',
    'Keep the output concise, useful, and business-ready.',
    '',
    'Client request:',
    requestText,
    '',
    'Constraints and context:',
    constraints || 'No explicit constraints provided.',
    '',
    'Requirements:',
    '- Distill the brief into a summary.',
    '- Extract likely deliverables.',
    '- State assumptions and risks explicitly.',
    '- List missing information and clarifying questions.',
    '- Provide multiple scope options with tradeoffs and pricing angles.',
    '- Recommend one option.',
    '- Write a reply draft that sets expectations clearly.',
    '',
    'Return JSON in this exact shape:',
    responseShape,
  ].join('\n');
}

export function buildRepairPrompt(previousResponse, errorMessage) {
  return [
    'Your previous response did not validate.',
    `Validation error: ${errorMessage}`,
    'Return corrected JSON only. Do not include markdown or commentary.',
    'Keep the same business intent, but fix the structure and required fields.',
    '',
    'Previous response:',
    previousResponse,
    '',
    'Return JSON matching the same schema exactly.',
  ].join('\n');
}
