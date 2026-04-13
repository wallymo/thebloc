import { ScoringContext } from '@/types/scoring';

type PromptConfig = {
  annotationPrefix: string;
  criteria: string[];
  dimension: 'science' | 'engagement' | 'clarity';
  title: string;
};

function buildPrompt(context: ScoringContext, config: PromptConfig) {
  const criteriaList = config.criteria
    .map((criterion, index) => `${index + 1}. ${criterion}`)
    .join('\n');

  return `You are an expert promotional content evaluator scoring a healthcare creative against the ${config.title} dimension.

Evaluate the supplied content using this context:
- Therapeutic area: ${context.therapeuticArea}
- Audience: ${context.audience}
- Objective: ${context.objective}

Scoring criteria:
${criteriaList}

Instructions:
- Score the content from 0 to 100 for the ${config.dimension} dimension.
- Assign exactly one category using these bands: Poor (0-39), Adequate (40-59), Good (60-79), Strong (80-100).
- Provide one concise evidenceQuote copied from the content being evaluated.
- Provide exactly 2 actionable recommendations as strings.
- Provide an annotations array. Each annotation must include:
  - id: use ${config.annotationPrefix}-1, ${config.annotationPrefix}-2, etc.
  - type: error, warning, or strength
  - label: short issue or strength name
  - detail: specific explanation tied to the content
  - dimension: ${config.dimension}
- Base the assessment on the content itself and the context above. Do not invent evidence that is not present.

Return ONLY valid JSON in this exact shape:
{
  "score": 0,
  "category": "Poor",
  "evidenceQuote": "",
  "recommendations": ["", ""],
  "annotations": [
    {
      "id": "${config.annotationPrefix}-1",
      "type": "warning",
      "label": "",
      "detail": "",
      "dimension": "${config.dimension}"
    }
  ]
}`;
}

export function buildSciencePrompt(context: ScoringContext) {
  return buildPrompt(context, {
    annotationPrefix: 'sci',
    criteria: [
      'FDA and broader regulatory compliance',
      'Important Safety Information (ISI) presence and adequacy',
      'Health literacy and patient-friendly comprehension',
      'Claims substantiation and evidentiary support',
    ],
    dimension: 'science',
    title: 'science',
  });
}

export function buildEngagementPrompt(context: ScoringContext) {
  return buildPrompt(context, {
    annotationPrefix: 'eng',
    criteria: [
      'CTA presence, clarity, and urgency',
      'Behavioral resonance with the intended audience',
      'Imagery relevance to the therapeutic area, audience, and objective',
      'Emotional tone and motivational pull',
    ],
    dimension: 'engagement',
    title: 'engagement',
  });
}

export function buildClarityPrompt(context: ScoringContext) {
  return buildPrompt(context, {
    annotationPrefix: 'cla',
    criteria: [
      'Copy volume and whether the amount of text is manageable',
      'Visual hierarchy and scanability of the message',
      'Message focus and prominence of the main takeaway',
      'Readability and plain-language comprehension',
    ],
    dimension: 'clarity',
    title: 'clarity',
  });
}
