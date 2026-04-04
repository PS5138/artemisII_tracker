import { NextResponse } from 'next/server'
import { fetchSpaceWeather } from '@/lib/spaceweather'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const data = await fetchSpaceWeather()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[spaceweather] fetch failed:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
