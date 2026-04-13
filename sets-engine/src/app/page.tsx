'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SAMPLE_ASSETS } from '@/data/samples'
import { ScoringResult } from '@/types/scoring'
import { ScoreCard } from '@/components/ScoreCard'
import { DimensionBars } from '@/components/DimensionBars'
import { RecommendationList } from '@/components/RecommendationList'
import { AnnotationPanel } from '@/components/AnnotationPanel'
import { AssetViewer } from '@/components/AssetViewer'

export default function Home() {
  const [selected, setSelected] = useState(SAMPLE_ASSETS[0])
  const result: ScoringResult = selected.result

  return (
    <main className="min-h-screen" style={{ background: '#F5F4F0' }}>

      {/* ── HEADER ── */}
      <header style={{ background: '#0E0E0E', color: 'white', padding: '48px 64px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>The Bloc</p>
          <h1 style={{ fontSize: 44, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 14 }}>
            SETS <span style={{ color: '#C84B31' }}>Engine</span>
          </h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 15, color: '#A09D97', maxWidth: 520, lineHeight: 1.6, marginBottom: 0 }}>
            AI-powered scoring for pharma &amp; healthcare marketing assets — evaluating Science, Engagement, Targeting &amp; Simplicity.
          </p>

          <div style={{
            marginTop: 36,
            display: 'flex',
            gap: 48,
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            color: '#666',
            letterSpacing: '0.06em',
            borderTop: '1px solid #222',
            paddingTop: 24,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            <div>
              <strong style={{ display: 'block', color: '#999', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Pillar</strong>
              PowerBe-Comms
            </div>
            <div>
              <strong style={{ display: 'block', color: '#999', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Dimensions</strong>
              Science · Engagement · Targeting · Simplicity
            </div>
            <div>
              <strong style={{ display: 'block', color: '#999', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Version</strong>
              Validation Preview
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link href="/score">
                <button style={{
                  background: '#C84B31',
                  color: 'white',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '12px 28px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}>
                  Score Your Asset →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── SAMPLE SELECTOR ── */}
      <div style={{ borderBottom: '1px solid #D6D3CB', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 64px' }}>
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {SAMPLE_ASSETS.map(sample => (
              <button
                key={sample.id}
                onClick={() => setSelected(sample)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '16px 24px',
                  border: 'none',
                  borderBottom: selected.id === sample.id ? '3px solid #C84B31' : '3px solid transparent',
                  background: 'transparent',
                  color: selected.id === sample.id ? '#C84B31' : '#7A7670',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 64px' }}>

        {/* Asset context strip */}
        <div style={{ marginBottom: 40 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Sample Asset</p>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#7A7670', margin: 0 }}>
            <span style={{ color: '#0E0E0E', fontWeight: 700 }}>{selected.name}</span>
            {' · '}
            {selected.context.therapeuticArea}
            {' · '}
            {selected.context.audience}
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

          {/* Left: asset preview */}
          <div style={{ background: '#FFFFFF', padding: 36 }}>
            <p className="section-label">Asset Preview</p>
            <AssetViewer asset={selected} />
          </div>

          {/* Right: scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ background: '#FFFFFF', padding: 36 }}>
              <ScoreCard score={result.overallScore} category={result.overallCategory} assetName={selected.name} />
            </div>
            <div style={{ background: '#FFFFFF', padding: 36 }}>
              <p className="section-label">Dimension Scores</p>
              <DimensionBars dimensions={result.dimensions} />
            </div>
          </div>
        </div>

        {/* Bottom row: annotations + recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 2 }}>
          <div style={{ background: '#FFFFFF', padding: 36 }}>
            <AnnotationPanel annotations={result.annotations} />
          </div>
          <div style={{ background: '#FFFFFF', padding: 36 }}>
            <RecommendationList fixes={result.priorityFixes} />
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid #D6D3CB',
        padding: '24px 64px',
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        color: '#7A7670',
        letterSpacing: '0.06em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>© 2026 The Bloc · An IPG / IW Company</span>
        <span style={{ color: '#C84B31', fontWeight: 700 }}>SETS ENGINE — VALIDATION PREVIEW</span>
      </footer>
    </main>
  )
}
