import { GoogleGenerativeAI } from '@google/generative-ai'
import { ScoringResult, ScoringContext, Annotation, ScoreCategory } from '@/types/scoring'
import { DEFAULT_WEIGHTS } from '@/config/weights'
import { buildSciencePrompt, buildEngagementPrompt, buildClarityPrompt } from '@/lib/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

function categoryFromScore(score: number): ScoreCategory {
  if (score < 40) return 'Poor'
  if (score < 60) return 'Adequate'
  if (score < 80) return 'Good'
  return 'Strong'
}

type AgentResult = {
  score: number
  category: ScoreCategory
  evidenceQuote: string
  recommendations: string[]
  annotations: Annotation[]
}

async function runAgent(prompt: string, assetBase64: string, mimeType: string): Promise<AgentResult> {
  const result = await model.generateContent([
    { inlineData: { data: assetBase64, mimeType } },
    prompt,
  ])

  const text = result.response.text()
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Agent returned invalid JSON')

  const parsed = JSON.parse(match[0])
  return {
    score: Math.min(100, Math.max(0, parsed.score ?? 50)),
    category: parsed.category ?? categoryFromScore(parsed.score ?? 50),
    evidenceQuote: parsed.evidenceQuote ?? '',
    recommendations: parsed.recommendations ?? [],
    annotations: parsed.annotations ?? [],
  }
}

export async function scoreAsset(
  assetBase64: string,
  mimeType: string,
  context: ScoringContext,
  weights = DEFAULT_WEIGHTS,
): Promise<ScoringResult> {
  const [science, engagement, clarity] = await Promise.all([
    runAgent(buildSciencePrompt(context), assetBase64, mimeType),
    runAgent(buildEngagementPrompt(context), assetBase64, mimeType),
    runAgent(buildClarityPrompt(context), assetBase64, mimeType),
  ])

  const overallScore = Math.round(
    science.score * weights.science +
    engagement.score * weights.engagement +
    clarity.score * weights.clarity,
  )

  const consistencyAnnotations: Annotation[] = engagement.score >= 70 && science.score < 40
    ? [{
        id: 'warn-consistency',
        type: 'warning',
        label: 'Consistency Warning',
        detail: 'High engagement with poor regulatory compliance — may mislead audience',
        dimension: 'science',
      }]
    : []

  const priorityFixes = [
    ...science.recommendations.map(r => ({ text: r, score: science.score })),
    ...engagement.recommendations.map(r => ({ text: r, score: engagement.score })),
    ...clarity.recommendations.map(r => ({ text: r, score: clarity.score })),
  ]
    .sort((a, b) => a.score - b.score)
    .map(r => r.text)
    .slice(0, 5)

  return {
    overallScore,
    overallCategory: categoryFromScore(overallScore),
    dimensions: {
      science: { score: science.score, category: science.category, evidenceQuote: science.evidenceQuote, recommendations: science.recommendations },
      engagement: { score: engagement.score, category: engagement.category, evidenceQuote: engagement.evidenceQuote, recommendations: engagement.recommendations },
      clarity: { score: clarity.score, category: clarity.category, evidenceQuote: clarity.evidenceQuote, recommendations: clarity.recommendations },
    },
    priorityFixes,
    annotations: [...science.annotations, ...engagement.annotations, ...clarity.annotations, ...consistencyAnnotations],
    scoredAt: new Date().toISOString(),
  }
}
