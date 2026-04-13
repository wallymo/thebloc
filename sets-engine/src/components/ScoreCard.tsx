'use client'

import { ScoreCategory } from '@/types/scoring'

const SCORE_COLOR: Record<ScoreCategory, string> = {
  Poor:     '#C0392B',
  Adequate: '#E67E22',
  Good:     '#27AE60',
  Strong:   '#2C5F2D',
}

const BADGE_STYLE: Record<ScoreCategory, React.CSSProperties> = {
  Poor:     { background: '#FEE', color: '#C0392B', border: '1px solid #FBCCC9' },
  Adequate: { background: '#FEF3E2', color: '#E67E22', border: '1px solid #FAD7A0' },
  Good:     { background: '#EAF7EF', color: '#27AE60', border: '1px solid #A9DFB8' },
  Strong:   { background: '#EAF2EA', color: '#2C5F2D', border: '1px solid #A8CBAA' },
}

const CATEGORY_RANGES: Record<ScoreCategory, string> = {
  Poor:     '0–39',
  Adequate: '40–59',
  Good:     '60–79',
  Strong:   '80–100',
}

interface Props {
  score: number
  category: ScoreCategory
  assetName: string
}

export function ScoreCard({ score, category, assetName }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 8, paddingBottom: 8 }}>
      {/* Eyebrow */}
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#7A7670',
        margin: 0,
        textAlign: 'center',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {assetName}
      </p>

      {/* Big score */}
      <div style={{
        fontSize: 96,
        fontFamily: 'Georgia, serif',
        fontWeight: 400,
        lineHeight: 1,
        color: SCORE_COLOR[category],
        letterSpacing: '-0.04em',
      }}>
        {score}
      </div>

      {/* Category badge */}
      <div style={{
        ...BADGE_STYLE[category],
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '5px 14px',
        borderRadius: 2,
      }}>
        {category}
      </div>

      {/* Range hint */}
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        color: '#B0ADA7',
        margin: 0,
        letterSpacing: '0.04em',
      }}>
        {CATEGORY_RANGES[category]} range · out of 100
      </p>
    </div>
  )
}
