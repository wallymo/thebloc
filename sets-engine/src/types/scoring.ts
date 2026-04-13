export type ScoreCategory = 'Poor' | 'Adequate' | 'Good' | 'Strong';

export interface DimensionScore {
  score: number;
  category: ScoreCategory;
  evidenceQuote: string;
  recommendations: string[];
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
