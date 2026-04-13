'use client'

interface Props {
  fixes: string[]
}

export function RecommendationList({ fixes }: Props) {
  return (
    <div>
      {/* Section label */}
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#C84B31',
        marginBottom: 20,
      }}>
        Priority Fixes
      </p>

      {/* List */}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {fixes.map((fix, i) => (
          <li
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr',
              gap: 0,
              background: '#FFFFFF',
              border: '1px solid #E8E6DF',
            }}
          >
            {/* Number cell */}
            <div style={{
              background: '#0E0E0E',
              color: '#C84B31',
              fontFamily: 'Georgia, serif',
              fontSize: 16,
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            {/* Text cell */}
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#0E0E0E', margin: 0, lineHeight: 1.5 }}>
                {fix}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
