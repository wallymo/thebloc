'use client'

import { ScoringResult } from '@/types/scoring'

const DIMENSION_LABEL: Record<string, string> = {
  science:    'Science & Regulatory',
  engagement: 'Engagement',
  clarity:    'Clarity',
}

function barColor(score: number): string {
  if (score < 40) return '#C0392B'
  if (score < 60) return '#E67E22'
  if (score < 80) return '#27AE60'
  return '#2C5F2D'
}

interface Props {
  dimensions: ScoringResult['dimensions']
}

export function DimensionBars({ dimensions }: Props) {
  const sorted = (Object.entries(dimensions) as [string, ScoringResult['dimensions'][keyof ScoringResult['dimensions']]][])
    .sort((a, b) => a[1].score - b[1].score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {sorted.map(([key, dim]) => (
        <div key={key}>
          {/* Label + score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0E0E0E' }}>
              {DIMENSION_LABEL[key]}
            </span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: barColor(dim.score), letterSpacing: '-0.02em' }}>
              {dim.score}
              <span style={{ fontSize: 12, color: '#B0ADA7', fontFamily: 'Arial, sans-serif', marginLeft: 2 }}>/100</span>
            </span>
          </div>

          {/* Bar track */}
          <div style={{ height: 5, background: '#E8E6DF', borderRadius: 0, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: barColor(dim.score),
              width: `${dim.score}%`,
              transition: 'width 0.7s ease',
            }} />
          </div>

          {/* Quote */}
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: 12,
            color: '#7A7670',
            fontStyle: 'italic',
            marginTop: 6,
            marginBottom: 0,
          }}>
            &ldquo;{dim.evidenceQuote}&rdquo;
          </p>
        </div>
      ))}
    </div>
  )
}
