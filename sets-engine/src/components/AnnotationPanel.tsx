'use client'

import { Annotation } from '@/types/scoring'

const BORDER_COLOR: Record<Annotation['type'], string> = {
  error:    '#C84B31',
  warning:  '#B8860B',
  strength: '#2C5F2D',
}

const BG_COLOR: Record<Annotation['type'], string> = {
  error:    '#FDF3F1',
  warning:  '#FDF6E3',
  strength: '#EAF2EA',
}

const BADGE_STYLE: Record<Annotation['type'], React.CSSProperties> = {
  error:    { background: '#C84B31', color: '#FFFFFF' },
  warning:  { background: '#B8860B', color: '#FFFFFF' },
  strength: { background: '#2C5F2D', color: '#FFFFFF' },
}

const TYPE_LABEL: Record<Annotation['type'], string> = {
  error:    'Critical',
  warning:  'Warning',
  strength: 'Strength',
}

const DIM_LABEL: Record<string, string> = {
  science:    'Science',
  engagement: 'Engagement',
  clarity:    'Clarity',
}

const TYPE_ORDER: Record<Annotation['type'], number> = { error: 0, warning: 1, strength: 2 }

interface Props {
  annotations: Annotation[]
}

export function AnnotationPanel({ annotations }: Props) {
  const sorted = [...annotations].sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
  const errors   = annotations.filter(a => a.type === 'error').length
  const warnings = annotations.filter(a => a.type === 'warning').length

  return (
    <div>
      {/* Header */}
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#C84B31',
        marginBottom: 20,
      }}>
        Issues Found
      </p>
      <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#7A7670', marginBottom: 20 }}>
        {errors} critical · {warnings} warnings
      </p>

      {/* Annotation list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map(a => (
          <div
            key={a.id}
            style={{
              borderLeft: `3px solid ${BORDER_COLOR[a.type]}`,
              background: BG_COLOR[a.type],
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, color: '#0E0E0E' }}>
                {a.label}
              </span>
              <span style={{
                ...BADGE_STYLE[a.type],
                fontFamily: 'Arial, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: 2,
              }}>
                {TYPE_LABEL[a.type]}
              </span>
              <span style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#7A7670',
                background: '#E8E6DF',
                padding: '2px 7px',
                borderRadius: 2,
              }}>
                {DIM_LABEL[a.dimension]}
              </span>
            </div>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#7A7670', margin: 0, lineHeight: 1.5 }}>
              {a.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
