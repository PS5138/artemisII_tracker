import { NextResponse } from 'next/server'
import { fetchTelemetry } from '@/lib/horizons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const data = await fetchTelemetry()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[telemetry] fetch failed:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
