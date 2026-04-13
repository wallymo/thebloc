import { NextRequest, NextResponse } from 'next/server'
import { scoreAsset } from '@/lib/scorer'
import type { ScoringContext } from '@/types/scoring'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { assetBase64: string; mimeType: string; context: ScoringContext }
    const { assetBase64, mimeType, context } = body

    if (!assetBase64 || !mimeType || !context) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    if (Buffer.byteLength(assetBase64, 'base64') > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const result = await scoreAsset(assetBase64, mimeType, context)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Scoring error:', err)
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
