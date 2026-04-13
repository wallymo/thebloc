'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ScoringResult, ScoringContext } from '@/types/scoring'
import { ScoreCard } from '@/components/ScoreCard'
import { DimensionBars } from '@/components/DimensionBars'
import { RecommendationList } from '@/components/RecommendationList'
import { AnnotationPanel } from '@/components/AnnotationPanel'

const STEPS = [
  'Uploading asset...',
  'Analyzing Science & Regulatory...',
  'Analyzing Engagement...',
  'Analyzing Clarity...',
  'Validating results...',
]

const FIELD_CONFIGS = [
  { key: 'therapeuticArea', label: 'Therapeutic Area', placeholder: 'e.g. Type 2 Diabetes' },
  { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Adult patients 45–65' },
  { key: 'objective', label: 'Campaign Objective', placeholder: 'e.g. Drive HCP conversation' },
]

export default function ScorePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [context, setContext] = useState<ScoringContext>({ therapeuticArea: '', audience: '', objective: '' })
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleScore() {
    if (!file) return
    setLoading(true)
    setError(null)
    setStep(0)
    const interval = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 6000)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve((e.target?.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetBase64: base64, mimeType: file.type, context }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scoring failed')
      }

      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scoring failed')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: '#F5F4F0' }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: '#0E0E0E', padding: '14px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.06em' }}>SETS Engine</span>
        </div>
        <Link href="/">
          <button style={{
            background: 'transparent',
            color: '#A09D97',
            fontFamily: 'Arial, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '8px 20px',
            border: '1px solid #333',
            cursor: 'pointer',
          }}>
            ← View Samples
          </button>
        </Link>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

          {/* ── LEFT: Upload + Context ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                background: '#FFFFFF',
                padding: 36,
                cursor: 'pointer',
                border: '2px dashed #D6D3CB',
                transition: 'border-color 0.15s',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C84B31')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#D6D3CB')}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 240, maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0E0E0E', marginBottom: 8 }}>
                    Drop your asset here
                  </p>
                  <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#7A7670', margin: 0 }}>
                    PNG · JPG · PDF · max 10MB
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Context fields */}
            <div style={{ background: '#FFFFFF', padding: 36 }}>
              <p className="section-label">Asset Context</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {FIELD_CONFIGS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{
                      display: 'block',
                      fontFamily: 'Arial, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#7A7670',
                      marginBottom: 8,
                    }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={context[key as keyof ScoringContext]}
                      onChange={e => setContext(c => ({ ...c, [key]: e.target.value }))}
                      style={{
                        width: '100%',
                        border: '1px solid #D6D3CB',
                        borderRadius: 0,
                        padding: '10px 14px',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: 13,
                        color: '#0E0E0E',
                        background: '#F5F4F0',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#C84B31')}
                      onBlur={e => (e.target.style.borderColor = '#D6D3CB')}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE', borderLeft: '4px solid #C84B31', padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#C84B31' }}>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleScore}
              disabled={!file || loading}
              style={{
                background: file && !loading ? '#C84B31' : '#E8E6DF',
                color: file && !loading ? '#FFFFFF' : '#7A7670',
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '18px 32px',
                border: 'none',
                cursor: file && !loading ? 'pointer' : 'not-allowed',
                width: '100%',
                transition: 'background 0.2s',
              }}
            >
              {loading ? STEPS[step] : 'Score This Asset →'}
            </button>
          </div>

          {/* ── RIGHT: Results ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result ? (
              <>
                <div style={{ background: '#FFFFFF', padding: 36 }}>
                  <ScoreCard score={result.overallScore} category={result.overallCategory} assetName={file?.name ?? 'Your asset'} />
                </div>
                <div style={{ background: '#FFFFFF', padding: 36 }}>
                  <p className="section-label">Dimension Scores</p>
                  <DimensionBars dimensions={result.dimensions} />
                </div>
                <div style={{ background: '#FFFFFF', padding: 36 }}>
                  <AnnotationPanel annotations={result.annotations} />
                </div>
                <div style={{ background: '#FFFFFF', padding: 36 }}>
                  <RecommendationList fixes={result.priorityFixes} />
                </div>
              </>
            ) : (
              <div style={{
                background: '#FFFFFF',
                padding: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                flexDirection: 'column',
                gap: 16,
              }}>
                {loading ? (
                  <>
                    <div style={{
                      width: 40,
                      height: 40,
                      border: '3px solid #E8E6DF',
                      borderTop: '3px solid #C84B31',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#7A7670', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {STEPS[step]}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#D6D3CB', fontWeight: 400, margin: 0 }}>
                      No asset scored yet
                    </p>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#B0ADA7', margin: 0 }}>
                      Upload an asset and click Score to see results
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
