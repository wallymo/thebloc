# SETS Engine Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working pharma marketing asset scorer demo to win The Bloc engagement — opens pre-scored, annotates issues inline, scores new assets in under 30 seconds.

**Architecture:** Next.js 15 App Router on Vercel. Three Claude claude-sonnet-4-6 vision agents run in parallel (Science/Regulatory, Engagement, Clarity), each returning a score + evidence quote + recommendations. A validation layer checks for contradictions. Landing page opens with a pre-scored sample asset — zero latency, instant "wow." Upload flow triggers live scoring with progress indicators. Weights live in server-side config JSON, decoupled from prompts.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Anthropic SDK (`@anthropic-ai/sdk`), Vercel

---

## Pre-work: Bootstrap the project

Run in terminal (NOT through Codex — this is scaffolding):

```bash
cd ~/Desktop
npx create-next-app@latest sets-engine --typescript --tailwind --app --src-dir --import-alias "@/*"
cd sets-engine
npx shadcn@latest init -d
npx shadcn@latest add card badge progress separator button
npm install @anthropic-ai/sdk
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Then init git and open in Claude Code from the `sets-engine` directory.

---

## Task 1: TypeScript Types

**Files:**
- Create: `src/types/scoring.ts`

**Step 1: Write the types**

```typescript
// src/types/scoring.ts

export type ScoreCategory = 'Poor' | 'Adequate' | 'Good' | 'Strong';

export interface DimensionScore {
  score: number; // 0-100
  category: ScoreCategory;
  evidenceQuote: string; // exact text/element from asset
  recommendations: string[]; // 2-3 specific, actionable
}

export interface Annotation {
  id: string;
  type: 'error' | 'warning' | 'strength';
  label: string;
  detail: string;
  dimension: 'science' | 'engagement' | 'clarity';
}

export interface ScoringResult {
  overallScore: number;
  overallCategory: ScoreCategory;
  dimensions: {
    science: DimensionScore;
    engagement: DimensionScore;
    clarity: DimensionScore;
  };
  priorityFixes: string[];
  annotations: Annotation[];
  scoredAt: string;
}

export interface ScoringContext {
  therapeuticArea: string;
  audience: string;
  objective: string;
}

export interface WeightConfig {
  science: number;
  engagement: number;
  clarity: number;
}
```

**Step 2: Commit**
```bash
git add src/types/scoring.ts
git commit -m "feat: add scoring TypeScript types"
```

---

## Task 2: Weight Config

**Files:**
- Create: `src/config/weights.ts`

**Step 1: Write config**

```typescript
// src/config/weights.ts
import { WeightConfig } from '@/types/scoring';

export const DEFAULT_WEIGHTS: WeightConfig = {
  science: 0.40,   // Regulatory compliance matters most in pharma
  engagement: 0.30,
  clarity: 0.30,
};
```

**Step 2: Commit**
```bash
git add src/config/weights.ts
git commit -m "feat: add scoring weight config"
```

---

## Task 3: Agent Prompts

**Files:**
- Create: `src/lib/prompts.ts`

**Step 1: Write prompts**

```typescript
// src/lib/prompts.ts
import { ScoringContext } from '@/types/scoring';

export function buildSciencePrompt(context: ScoringContext): string {
  return `You are a pharma regulatory expert evaluating a marketing asset.

Asset context:
- Therapeutic area: ${context.therapeuticArea}
- Target audience: ${context.audience}
- Campaign objective: ${context.objective}

Evaluate SCIENCE & REGULATORY quality across:
- FDA/regulatory compliance signals (ISI, safety disclosures, fair balance)
- Claims accuracy and substantiation
- Health literacy level (should be ≤8th grade reading for patient materials)
- Required medical/safety language presence

Score from 0-100. Be strict — pharma regulatory failures are serious.

Return ONLY valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "category": <"Poor"|"Adequate"|"Good"|"Strong">,
  "evidenceQuote": "<exact text or element from the asset that most influenced your score>",
  "recommendations": ["<specific fix 1>", "<specific fix 2>"],
  "annotations": [
    {
      "id": "sci-1",
      "type": <"error"|"warning"|"strength">,
      "label": "<short label>",
      "detail": "<explanation>",
      "dimension": "science"
    }
  ]
}

If you cannot assess a criterion with confidence, mark it as "Unable to assess" in the evidenceQuote. Never invent compliance status.`;
}

export function buildEngagementPrompt(context: ScoringContext): string {
  return `You are a pharma marketing strategist evaluating a marketing asset.

Asset context:
- Therapeutic area: ${context.therapeuticArea}
- Target audience: ${context.audience}
- Campaign objective: ${context.objective}

Evaluate ENGAGEMENT quality across:
- CTA presence, clarity, and urgency (is there a clear next action?)
- Behavioral resonance (does it motivate the target audience?)
- Imagery relevance and originality (stock vs. authentic, relevant to message)
- Emotional tone alignment with therapeutic area

Score from 0-100.

Return ONLY valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "category": <"Poor"|"Adequate"|"Good"|"Strong">,
  "evidenceQuote": "<exact text or element from the asset that most influenced your score>",
  "recommendations": ["<specific fix 1>", "<specific fix 2>"],
  "annotations": [
    {
      "id": "eng-1",
      "type": <"error"|"warning"|"strength">,
      "label": "<short label>",
      "detail": "<explanation>",
      "dimension": "engagement"
    }
  ]
}`;
}

export function buildClarityPrompt(context: ScoringContext): string {
  return `You are a healthcare communications expert evaluating a marketing asset.

Asset context:
- Therapeutic area: ${context.therapeuticArea}
- Target audience: ${context.audience}
- Campaign objective: ${context.objective}

Evaluate CLARITY & SIMPLICITY across:
- Copy volume (is there too much text for the format?)
- Visual hierarchy (does the eye know where to go first?)
- Message focus (one clear takeaway, or muddled?)
- Readability (font size, contrast, line spacing)

Score from 0-100.

Return ONLY valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "category": <"Poor"|"Adequate"|"Good"|"Strong">,
  "evidenceQuote": "<exact text or element from the asset that most influenced your score>",
  "recommendations": ["<specific fix 1>", "<specific fix 2>"],
  "annotations": [
    {
      "id": "cla-1",
      "type": <"error"|"warning"|"strength">,
      "label": "<short label>",
      "detail": "<explanation>",
      "dimension": "clarity"
    }
  ]
}`;
}
```

**Step 2: Commit**
```bash
git add src/lib/prompts.ts
git commit -m "feat: add scoring agent prompts"
```

---

## Task 4: Scoring Engine

**Files:**
- Create: `src/lib/scorer.ts`

**Step 1: Write the scoring engine**

```typescript
// src/lib/scorer.ts
import Anthropic from '@anthropic-ai/sdk';
import { ScoringResult, ScoringContext, DimensionScore, Annotation, ScoreCategory } from '@/types/scoring';
import { DEFAULT_WEIGHTS } from '@/config/weights';
import { buildSciencePrompt, buildEngagementPrompt, buildClarityPrompt } from '@/lib/prompts';

const client = new Anthropic();

function categoryFromScore(score: number): ScoreCategory {
  if (score < 40) return 'Poor';
  if (score < 60) return 'Adequate';
  if (score < 80) return 'Good';
  return 'Strong';
}

async function runAgent(
  prompt: string,
  assetBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf'
): Promise<{ score: number; category: ScoreCategory; evidenceQuote: string; recommendations: string[]; annotations: Annotation[] }> {
  const mediaType = mimeType === 'application/pdf' ? 'application/pdf' : mimeType;
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: assetBase64,
          },
        },
        { type: 'text', text: prompt },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Agent returned invalid JSON');
  
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: Math.min(100, Math.max(0, parsed.score)),
    category: parsed.category || categoryFromScore(parsed.score),
    evidenceQuote: parsed.evidenceQuote || '',
    recommendations: parsed.recommendations || [],
    annotations: parsed.annotations || [],
  };
}

function validateConsistency(
  science: ReturnType<typeof runAgent> extends Promise<infer T> ? T : never,
  engagement: ReturnType<typeof runAgent> extends Promise<infer T> ? T : never,
): string[] {
  const warnings: string[] = [];
  // Flag contradictions: good engagement but poor science is a red flag in pharma
  if (engagement.score >= 70 && science.score < 40) {
    warnings.push('High engagement with poor regulatory compliance — asset may mislead audience');
  }
  return warnings;
}

export async function scoreAsset(
  assetBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf',
  context: ScoringContext,
  weights = DEFAULT_WEIGHTS
): Promise<ScoringResult> {
  const [science, engagement, clarity] = await Promise.all([
    runAgent(buildSciencePrompt(context), assetBase64, mimeType),
    runAgent(buildEngagementPrompt(context), assetBase64, mimeType),
    runAgent(buildClarityPrompt(context), assetBase64, mimeType),
  ]);

  const overallScore = Math.round(
    science.score * weights.science +
    engagement.score * weights.engagement +
    clarity.score * weights.clarity
  );

  const consistencyWarnings = validateConsistency(science, engagement);

  const allRecommendations = [
    ...science.recommendations.map(r => ({ text: r, score: science.score })),
    ...engagement.recommendations.map(r => ({ text: r, score: engagement.score })),
    ...clarity.recommendations.map(r => ({ text: r, score: clarity.score })),
  ]
    .sort((a, b) => a.score - b.score) // lowest scoring dimension = highest priority
    .map(r => r.text);

  const allAnnotations: Annotation[] = [
    ...science.annotations,
    ...engagement.annotations,
    ...clarity.annotations,
    ...consistencyWarnings.map((w, i) => ({
      id: `warn-${i}`,
      type: 'warning' as const,
      label: 'Consistency Warning',
      detail: w,
      dimension: 'science' as const,
    })),
  ];

  return {
    overallScore,
    overallCategory: categoryFromScore(overallScore),
    dimensions: {
      science: { score: science.score, category: science.category, evidenceQuote: science.evidenceQuote, recommendations: science.recommendations },
      engagement: { score: engagement.score, category: engagement.category, evidenceQuote: engagement.evidenceQuote, recommendations: engagement.recommendations },
      clarity: { score: clarity.score, category: clarity.category, evidenceQuote: clarity.evidenceQuote, recommendations: clarity.recommendations },
    },
    priorityFixes: allRecommendations.slice(0, 5),
    annotations: allAnnotations,
    scoredAt: new Date().toISOString(),
  };
}
```

**Step 2: Commit**
```bash
git add src/lib/scorer.ts
git commit -m "feat: add parallel scoring engine with validation layer"
```

---

## Task 5: API Route

**Files:**
- Create: `src/app/api/score/route.ts`

**Step 1: Write the route**

```typescript
// src/app/api/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scoreAsset } from '@/lib/scorer';
import { ScoringContext } from '@/types/scoring';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetBase64, mimeType, context } = body as {
      assetBase64: string;
      mimeType: string;
      context: ScoringContext;
    };

    if (!assetBase64 || !mimeType || !context) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(mimeType as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const sizeBytes = Buffer.byteLength(assetBase64, 'base64');
    if (sizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const result = await scoreAsset(
      assetBase64,
      mimeType as typeof ALLOWED_TYPES[number],
      context
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('Scoring error:', err);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add src/app/api/score/route.ts
git commit -m "feat: add /api/score route with validation"
```

---

## Task 6: Sample Assets + Pre-scored Data

**Files:**
- Create: `src/data/samples.ts`
- Add images to: `public/samples/` (3 pharma ad mockup PNGs — see note below)

**Note on sample images:** Create 3 simple pharma ad mockups as PNG files. They can be simple designs created with any tool (Figma, Canva, etc.) — one "Poor" example, one "Adequate", one "Strong". Name them `sample-1.png`, `sample-2.png`, `sample-3.png` and place in `public/samples/`.

**Step 1: Write pre-scored data**

```typescript
// src/data/samples.ts
import { ScoringResult, ScoringContext } from '@/types/scoring';

export interface SampleAsset {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  context: ScoringContext;
  result: ScoringResult;
}

export const SAMPLE_ASSETS: SampleAsset[] = [
  {
    id: 'sample-1',
    name: 'DTC Print Ad — Diabetes',
    description: 'Patient-facing print advertisement for a Type 2 diabetes medication',
    imagePath: '/samples/sample-1.png',
    context: {
      therapeuticArea: 'Type 2 Diabetes',
      audience: 'Adult patients 45-65',
      objective: 'Drive HCP conversation / brand awareness',
    },
    result: {
      overallScore: 41,
      overallCategory: 'Adequate',
      dimensions: {
        science: {
          score: 28,
          category: 'Poor',
          evidenceQuote: 'Important Safety Information appears in 6pt gray text at bottom — below FDA readability standards for patient-facing materials',
          recommendations: [
            'Move ISI above the fold or use minimum 8pt black text with strong contrast',
            'Add explicit indication statement near the headline',
          ],
        },
        engagement: {
          score: 58,
          category: 'Adequate',
          evidenceQuote: '"Talk to your doctor" CTA is present but rendered in the same weight as body copy — no visual hierarchy',
          recommendations: [
            'Make CTA a distinct button or bold callout with contrasting color',
            'Lead with patient outcome, not product name',
          ],
        },
        clarity: {
          score: 61,
          category: 'Adequate',
          evidenceQuote: 'Three separate messages compete for attention: brand promise, efficacy claim, and lifestyle imagery',
          recommendations: [
            'Reduce to one primary message — the strongest efficacy claim',
            'Increase white space between headline and body copy',
          ],
        },
      },
      priorityFixes: [
        'Move ISI above the fold or use minimum 8pt black text with strong contrast',
        'Add explicit indication statement near the headline',
        'Make CTA a distinct button or bold callout with contrasting color',
        'Lead with patient outcome, not product name',
        'Reduce to one primary message — the strongest efficacy claim',
      ],
      annotations: [
        { id: 'sci-1', type: 'error', label: 'ISI Compliance', detail: 'Important Safety Information is too small and low contrast for regulatory standards', dimension: 'science' },
        { id: 'sci-2', type: 'error', label: 'Missing Indication', detail: 'No explicit indication statement visible in primary reading area', dimension: 'science' },
        { id: 'eng-1', type: 'warning', label: 'Weak CTA', detail: 'Call-to-action lacks visual hierarchy — easily missed', dimension: 'engagement' },
        { id: 'cla-1', type: 'warning', label: 'Message Competition', detail: 'Three competing messages dilute the primary takeaway', dimension: 'clarity' },
      ],
      scoredAt: '2026-04-10T10:00:00Z',
    },
  },
  {
    id: 'sample-2',
    name: 'HCP Detail Aid — Oncology',
    description: 'Healthcare provider-facing detail aid for an oncology treatment',
    imagePath: '/samples/sample-2.png',
    context: {
      therapeuticArea: 'Oncology (NSCLC)',
      audience: 'Oncologists and oncology nurses',
      objective: 'Communicate efficacy data and patient selection criteria',
    },
    result: {
      overallScore: 78,
      overallCategory: 'Good',
      dimensions: {
        science: {
          score: 84,
          category: 'Strong',
          evidenceQuote: 'Primary endpoint data (mPFS 11.2 months vs 5.6 months, HR 0.43) presented with trial name, sample size, and confidence interval — scientifically rigorous',
          recommendations: [
            'Add patient subgroup breakdown for EGFR mutation status',
          ],
        },
        engagement: {
          score: 71,
          category: 'Good',
          evidenceQuote: '"Select your patients" headline directly addresses HCP decision-making role',
          recommendations: [
            'Add a quick-reference dosing chart — HCPs scan for actionable info',
            'Visual data representation could replace the data table for faster scanning',
          ],
        },
        clarity: {
          score: 72,
          category: 'Good',
          evidenceQuote: 'Data table is well-organized but dense — 11 rows without visual grouping',
          recommendations: [
            'Group data rows with alternating shading or category headers',
          ],
        },
      },
      priorityFixes: [
        'Add a quick-reference dosing chart',
        'Add patient subgroup breakdown for EGFR mutation status',
        'Group data rows with alternating shading or category headers',
      ],
      annotations: [
        { id: 'sci-1', type: 'strength', label: 'Strong Data Presentation', detail: 'Efficacy data includes all required statistical context', dimension: 'science' },
        { id: 'eng-1', type: 'strength', label: 'HCP-Relevant Headline', detail: 'Patient selection focus aligns with HCP decision workflow', dimension: 'engagement' },
        { id: 'cla-1', type: 'warning', label: 'Dense Data Table', detail: 'Table lacks visual grouping — increases cognitive load', dimension: 'clarity' },
      ],
      scoredAt: '2026-04-10T10:00:00Z',
    },
  },
  {
    id: 'sample-3',
    name: 'Digital Banner — Cardiology',
    description: 'HCP-targeted digital display banner for a cardiovascular treatment',
    imagePath: '/samples/sample-3.png',
    context: {
      therapeuticArea: 'Cardiovascular / Heart Failure',
      audience: 'Cardiologists',
      objective: 'Awareness and click-through to prescribing information',
    },
    result: {
      overallScore: 29,
      overallCategory: 'Poor',
      dimensions: {
        science: {
          score: 22,
          category: 'Poor',
          evidenceQuote: 'No ISI, no safety information, no fair balance — banner format does not excuse regulatory requirements for prescription drug advertising',
          recommendations: [
            'Add "See Brief Summary of full Prescribing Information" with visible link',
            'Include risk statement or clear link to full safety profile',
          ],
        },
        engagement: {
          score: 44,
          category: 'Adequate',
          evidenceQuote: 'Brand logo is the dominant visual element — product benefit is in 10pt text below',
          recommendations: [
            'Lead with the clinical benefit claim, not the logo',
            'CTA "Learn More" is generic — replace with outcome-specific ("See RALES trial data")',
          ],
        },
        clarity: {
          score: 31,
          category: 'Poor',
          evidenceQuote: 'Four text elements compete in a 300x250px space with no clear hierarchy',
          recommendations: [
            'Maximum two text elements for this banner size: headline + CTA',
            'Remove tagline — it adds no clinical value at this format',
          ],
        },
      },
      priorityFixes: [
        'Add "See Brief Summary of full Prescribing Information" with visible link',
        'Include risk statement or clear link to full safety profile',
        'Lead with the clinical benefit claim, not the logo',
        'Maximum two text elements for this banner size: headline + CTA',
        'Replace "Learn More" with outcome-specific CTA',
      ],
      annotations: [
        { id: 'sci-1', type: 'error', label: 'No Fair Balance', detail: 'Prescription drug advertising requires ISI reference — missing entirely', dimension: 'science' },
        { id: 'sci-2', type: 'error', label: 'No Safety Link', detail: 'No link to prescribing information or safety profile', dimension: 'science' },
        { id: 'eng-1', type: 'warning', label: 'Logo-First Hierarchy', detail: 'Logo dominates; clinical benefit is buried', dimension: 'engagement' },
        { id: 'cla-1', type: 'error', label: 'Format Overload', detail: 'Four competing text elements in 300x250px — unreadable at a glance', dimension: 'clarity' },
      ],
      scoredAt: '2026-04-10T10:00:00Z',
    },
  },
];
```

**Step 2: Commit**
```bash
git add src/data/samples.ts
git commit -m "feat: add pre-scored sample pharma assets"
```

---

## Task 7: Score Display Components

**Files:**
- Create: `src/components/ScoreCard.tsx`
- Create: `src/components/DimensionBars.tsx`
- Create: `src/components/RecommendationList.tsx`
- Create: `src/components/AnnotationPanel.tsx`

**Step 1: ScoreCard — the hero number**

```typescript
// src/components/ScoreCard.tsx
import { ScoreCategory } from '@/types/scoring';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS: Record<ScoreCategory, string> = {
  Poor: 'bg-red-100 text-red-800 border-red-200',
  Adequate: 'bg-amber-100 text-amber-800 border-amber-200',
  Good: 'bg-blue-100 text-blue-800 border-blue-200',
  Strong: 'bg-green-100 text-green-800 border-green-200',
};

const SCORE_COLORS: Record<ScoreCategory, string> = {
  Poor: 'text-red-600',
  Adequate: 'text-amber-600',
  Good: 'text-blue-600',
  Strong: 'text-green-600',
};

interface ScoreCardProps {
  score: number;
  category: ScoreCategory;
  assetName: string;
}

export function ScoreCard({ score, category, assetName }: ScoreCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{assetName}</p>
      <div className={`text-8xl font-black tabular-nums ${SCORE_COLORS[category]}`}>
        {score}
      </div>
      <Badge variant="outline" className={`text-sm px-3 py-1 ${CATEGORY_COLORS[category]}`}>
        {category}
      </Badge>
      <p className="text-xs text-muted-foreground">out of 100</p>
    </div>
  );
}
```

**Step 2: DimensionBars**

```typescript
// src/components/DimensionBars.tsx
import { ScoringResult } from '@/types/scoring';

const DIMENSION_LABELS = {
  science: 'Science & Regulatory',
  engagement: 'Engagement',
  clarity: 'Clarity',
};

const BAR_COLORS = (score: number) => {
  if (score < 40) return 'bg-red-500';
  if (score < 60) return 'bg-amber-500';
  if (score < 80) return 'bg-blue-500';
  return 'bg-green-500';
};

interface DimensionBarsProps {
  dimensions: ScoringResult['dimensions'];
}

export function DimensionBars({ dimensions }: DimensionBarsProps) {
  const entries = Object.entries(dimensions) as [keyof typeof dimensions, typeof dimensions[keyof typeof dimensions]][];
  const sorted = [...entries].sort((a, b) => a[1].score - b[1].score);

  return (
    <div className="space-y-4">
      {sorted.map(([key, dim]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{DIMENSION_LABELS[key]}</span>
            <span className="font-bold tabular-nums">{dim.score}<span className="text-muted-foreground font-normal">/100</span></span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS(dim.score)}`}
              style={{ width: `${dim.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground italic">"{dim.evidenceQuote}"</p>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: RecommendationList**

```typescript
// src/components/RecommendationList.tsx
interface RecommendationListProps {
  fixes: string[];
}

export function RecommendationList({ fixes }: RecommendationListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Priority Fixes</h3>
      <ol className="space-y-2">
        {fixes.map((fix, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <span>{fix}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

**Step 4: AnnotationPanel**

```typescript
// src/components/AnnotationPanel.tsx
import { Annotation } from '@/types/scoring';
import { Badge } from '@/components/ui/badge';

const TYPE_STYLES = {
  error: 'border-l-red-500 bg-red-50',
  warning: 'border-l-amber-500 bg-amber-50',
  strength: 'border-l-green-500 bg-green-50',
};

const TYPE_BADGES = {
  error: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  strength: 'bg-green-100 text-green-800',
};

const DIMENSION_LABELS = {
  science: 'Science',
  engagement: 'Engagement',
  clarity: 'Clarity',
};

interface AnnotationPanelProps {
  annotations: Annotation[];
}

export function AnnotationPanel({ annotations }: AnnotationPanelProps) {
  const errors = annotations.filter(a => a.type === 'error');
  const warnings = annotations.filter(a => a.type === 'warning');
  const strengths = annotations.filter(a => a.type === 'strength');
  const sorted = [...errors, ...warnings, ...strengths];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
        Issues Found ({errors.length} critical, {warnings.length} warnings)
      </h3>
      <div className="space-y-2">
        {sorted.map(annotation => (
          <div key={annotation.id} className={`border-l-4 pl-3 py-2 rounded-r ${TYPE_STYLES[annotation.type]}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{annotation.label}</span>
              <Badge variant="outline" className={`text-xs ${TYPE_BADGES[annotation.type]}`}>
                {DIMENSION_LABELS[annotation.dimension]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{annotation.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Commit**
```bash
git add src/components/
git commit -m "feat: add ScoreCard, DimensionBars, RecommendationList, AnnotationPanel components"
```

---

## Task 8: Asset Viewer with Sample Picker

**Files:**
- Create: `src/components/AssetViewer.tsx`

```typescript
// src/components/AssetViewer.tsx
'use client';

import Image from 'next/image';
import { SampleAsset } from '@/data/samples';

interface AssetViewerProps {
  asset: SampleAsset;
  isLoading?: boolean;
}

export function AssetViewer({ asset, isLoading }: AssetViewerProps) {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-muted">
      <Image
        src={asset.imagePath}
        alt={asset.name}
        width={600}
        height={400}
        className={`w-full object-contain transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <div className="text-center space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-medium">Analyzing asset...</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Commit:**
```bash
git add src/components/AssetViewer.tsx
git commit -m "feat: add AssetViewer component"
```

---

## Task 9: Landing Page (Demo Entry Point)

**Files:**
- Modify: `src/app/page.tsx`

This is the hero — opens with sample-1 pre-scored. No loading, no form. Just the output.

```typescript
// src/app/page.tsx
'use client';

import { useState } from 'react';
import { SAMPLE_ASSETS } from '@/data/samples';
import { ScoringResult } from '@/types/scoring';
import { ScoreCard } from '@/components/ScoreCard';
import { DimensionBars } from '@/components/DimensionBars';
import { RecommendationList } from '@/components/RecommendationList';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { AssetViewer } from '@/components/AssetViewer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function Home() {
  const [selected, setSelected] = useState(SAMPLE_ASSETS[0]);
  const result: ScoringResult = selected.result;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">SETS Engine</h1>
          <p className="text-xs text-muted-foreground">Pharma asset scoring — Science, Engagement, Targeting, Simplicity</p>
        </div>
        <Link href="/score">
          <Button>Score your asset →</Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Sample picker */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {SAMPLE_ASSETS.map(sample => (
            <button
              key={sample.id}
              onClick={() => setSelected(sample)}
              className={`text-left px-4 py-2 rounded-lg border text-sm transition-all ${
                selected.id === sample.id
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">{sample.name}</div>
              <div className="text-xs text-muted-foreground">{sample.context.therapeuticArea}</div>
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: asset */}
          <div className="space-y-4">
            <AssetViewer asset={selected} />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{selected.name}</span> · {selected.context.audience}
            </div>
          </div>

          {/* Right: scores */}
          <div className="space-y-6">
            <ScoreCard
              score={result.overallScore}
              category={result.overallCategory}
              assetName={selected.name}
            />
            <Separator />
            <DimensionBars dimensions={result.dimensions} />
            <Separator />
            <AnnotationPanel annotations={result.annotations} />
            <Separator />
            <RecommendationList fixes={result.priorityFixes} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Commit:**
```bash
git add src/app/page.tsx
git commit -m "feat: build landing page with pre-scored sample assets"
```

---

## Task 10: Upload + Live Scoring Page

**Files:**
- Create: `src/app/score/page.tsx`

```typescript
// src/app/score/page.tsx
'use client';

import { useState, useRef } from 'react';
import { ScoringResult, ScoringContext } from '@/types/scoring';
import { ScoreCard } from '@/components/ScoreCard';
import { DimensionBars } from '@/components/DimensionBars';
import { RecommendationList } from '@/components/RecommendationList';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const PROGRESS_STEPS = [
  'Uploading asset...',
  'Analyzing Science & Regulatory...',
  'Analyzing Engagement...',
  'Analyzing Clarity...',
  'Validating results...',
];

export default function ScorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [context, setContext] = useState<ScoringContext>({
    therapeuticArea: '',
    audience: '',
    objective: '',
  });
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleScore() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProgressStep(0);

    // Simulate progress through steps while agents run
    const interval = setInterval(() => {
      setProgressStep(p => Math.min(p + 1, PROGRESS_STEPS.length - 1));
    }, 5000);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = e.target?.result as string;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetBase64: base64, mimeType: file.type, context }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Scoring failed');
      }

      const data: ScoringResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scoring failed');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">SETS Engine</h1>
          <p className="text-xs text-muted-foreground">Score your asset</p>
        </div>
        <Link href="/">
          <Button variant="outline">← View samples</Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: upload + form */}
          <div className="space-y-6">
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Asset preview" className="max-h-64 mx-auto object-contain rounded" />
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">Drop your asset here</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, PDF · max 10MB</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Context form */}
            <div className="space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Asset context</h2>
              {[
                { key: 'therapeuticArea', label: 'Therapeutic Area', placeholder: 'e.g. Type 2 Diabetes' },
                { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Adult patients 45-65' },
                { key: 'objective', label: 'Campaign Objective', placeholder: 'e.g. Drive HCP conversation' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={context[key as keyof ScoringContext]}
                    onChange={e => setContext(c => ({ ...c, [key]: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleScore}
              disabled={!file || loading}
              className="w-full"
              size="lg"
            >
              {loading ? PROGRESS_STEPS[progressStep] : 'Score this asset →'}
            </Button>
          </div>

          {/* Right: results */}
          <div>
            {result ? (
              <div className="space-y-6">
                <ScoreCard score={result.overallScore} category={result.overallCategory} assetName={file?.name || 'Your asset'} />
                <Separator />
                <DimensionBars dimensions={result.dimensions} />
                <Separator />
                <AnnotationPanel annotations={result.annotations} />
                <Separator />
                <RecommendationList fixes={result.priorityFixes} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {loading ? 'Agents running in parallel...' : 'Upload an asset to see the score'}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Commit:**
```bash
git add src/app/score/
git commit -m "feat: add upload + live scoring page"
```

---

## Task 11: Deploy to Vercel

**Step 1: Push to GitHub**
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

**Step 2: Deploy**
```bash
npx vercel --prod
```

When prompted, add environment variable:
- `ANTHROPIC_API_KEY` = your key

**Step 3: Test the deployed URL**
- Open landing page — sample asset should appear pre-scored with zero loading
- Click "Score your asset" — upload a PNG and score it
- Verify scoring completes under 30 seconds

**Step 4: Commit deploy config if needed**
```bash
git add .vercel/
git commit -m "chore: add vercel deployment config"
```

---

## What This Demo Shows Carm

When you share the URL:

1. **Lands on a pre-scored pharma ad** — no loading, no setup, instant output
2. **Clicks between 3 sample assets** — sees different scores, understands the range
3. **Reads the evidence quotes** — "your ISI appears in 6pt gray text" is credible, specific, actionable
4. **Sees priority fix list** — ranked by impact, immediately useful
5. **Uploads their own asset** — sees live scoring with progress indicators per agent
6. **Understands the differentiator** — scores aren't black boxes, they're evidence-backed

The pitch: **"We can de-risk your July deadline. Here's a working scorer. We own the validation methodology. You own the product."**
