export type WeatherStatus = 'GREEN' | 'AMBER' | 'RED'

export interface SolarFlare {
  beginTime: string
  peakTime: string
  endTime: string
  classType: string // e.g. "M1.5", "X2.3"
}

export interface SpaceWeatherData {
  status: WeatherStatus
  kpIndex: number
  solarFlares24h: SolarFlare[]
  particleFlux: number | null
  summary: string
  fetchedAt: string
}

// NOAA X-ray flux (last 7 days) — pick last reading
async function fetchSolarFlares(): Promise<SolarFlare[]> {
  const res = await fetch(
    'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json',
    { next: { revalidate: 0 } }
  )
  if (!res.ok) return []

  const data = await res.json() as Array<{
    time_tag: string
    flux: number
    energy: string
  }>

  // We want M-class (>=1e-5) and X-class (>=1e-4) events in last 24h
  // Flares are detected as contiguous runs of elevated flux. A gap of >=5 entries (~25min for 5-min data) ends a flare.
  const cutoff = Date.now() - 86400000
  const flares: SolarFlare[] = []

  let inFlare = false
  let flareStart = ''
  let peakFlux = 0
  let peakTime = ''
  let gapCount = 0
  const GAP_THRESHOLD = 3 // consecutive quiet readings to end a flare

  for (const entry of data) {
    if (new Date(entry.time_tag).getTime() < cutoff) continue
    const flux = entry.flux ?? 0
    if (flux >= 1e-5) {
      gapCount = 0
      if (!inFlare) {
        inFlare = true
        flareStart = entry.time_tag
        peakFlux = flux
        peakTime = entry.time_tag
      } else if (flux > peakFlux) {
        peakFlux = flux
        peakTime = entry.time_tag
      }
    } else if (inFlare) {
      gapCount++
      if (gapCount >= GAP_THRESHOLD) {
        inFlare = false
        gapCount = 0
        const cls = peakFlux >= 1e-4 ? `X${(peakFlux / 1e-4).toFixed(1)}` : `M${(peakFlux / 1e-5).toFixed(1)}`
        flares.push({ beginTime: flareStart, peakTime, endTime: entry.time_tag, classType: cls })
        flareStart = ''
        peakFlux = 0
      }
    }
  }

  // Close any open flare at end of data
  if (inFlare && peakFlux > 0) {
    const cls = peakFlux >= 1e-4 ? `X${(peakFlux / 1e-4).toFixed(1)}` : `M${(peakFlux / 1e-5).toFixed(1)}`
    flares.push({ beginTime: flareStart, peakTime, endTime: peakTime, classType: cls })
  }

  return flares
}

// Kp index (geomagnetic)
async function fetchKpIndex(): Promise<number> {
  const res = await fetch(
    'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
    { next: { revalidate: 0 } }
  )
  if (!res.ok) return 0

  const data = await res.json() as Array<{ kp_index: number; time_tag: string }>
  const last = data[data.length - 1]
  return last?.kp_index ?? 0
}

// ACE EPAM particle flux
async function fetchParticleFlux(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://services.swpc.noaa.gov/json/ace/ace_epam_5m.json',
      { next: { revalidate: 0 } }
    )
    if (!res.ok) return null
    const data = await res.json() as Array<{ e38_53: number }>
    const last = data[data.length - 1]
    return last?.e38_53 ?? null
  } catch {
    return null
  }
}

function computeStatus(kp: number, flares: SolarFlare[], particleFlux: number | null): WeatherStatus {
  const hasXClass = flares.some((f) => f.classType.startsWith('X'))
  const hasMClass = flares.some((f) => f.classType.startsWith('M'))
  const elevatedParticles = particleFlux !== null && particleFlux > 1000

  if (kp >= 7 || hasXClass || elevatedParticles) return 'RED'
  if (kp >= 4 || hasMClass) return 'AMBER'
  return 'GREEN'
}

function buildSummary(status: WeatherStatus, kp: number, flares: SolarFlare[]): string {
  if (status === 'GREEN') return 'Quiet conditions. No significant solar activity.'
  if (status === 'AMBER') {
    const parts = []
    if (kp >= 4) parts.push(`Kp=${kp.toFixed(1)} (active geomagnetic conditions)`)
    const mFlares = flares.filter((f) => f.classType.startsWith('M'))
    if (mFlares.length) parts.push(`${mFlares.length} M-class flare(s) in last 24h`)
    return parts.join('. ') || 'Elevated solar activity.'
  }
  // RED
  const parts = []
  if (kp >= 7) parts.push(`Kp=${kp.toFixed(1)} — severe geomagnetic storm`)
  const xFlares = flares.filter((f) => f.classType.startsWith('X'))
  if (xFlares.length) parts.push(`${xFlares.length} X-class flare(s) — elevated radiation`)
  return parts.join('. ') || 'Severe space weather conditions.'
}

export async function fetchSpaceWeather(): Promise<SpaceWeatherData> {
  const [flares, kp, particleFlux] = await Promise.all([
    fetchSolarFlares(),
    fetchKpIndex(),
    fetchParticleFlux(),
  ])

  const status = computeStatus(kp, flares, particleFlux)

  return {
    status,
    kpIndex: kp,
    solarFlares24h: flares,
    particleFlux,
    summary: buildSummary(status, kp, flares),
    fetchedAt: new Date().toISOString(),
  }
}
