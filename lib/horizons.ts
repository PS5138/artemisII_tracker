const HORIZONS_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api'

export interface HorizonsVector {
  x: number // km
  y: number // km
  z: number // km
  vx: number // km/s
  vy: number // km/s
  vz: number // km/s
  time: string // ISO string
}

export interface TelemetryData {
  orion: HorizonsVector
  moon: HorizonsVector
  distanceFromEarth_km: number
  distanceFromMoon_km: number
  speed_kms: number
  speed_mph: number
  distanceFromEarth_mi: number
  distanceFromMoon_mi: number
  lightDelay_s: number
  fetchedAt: string
}

function buildHorizonsUrl(objectId: string, now: Date): string {
  // Format: 'YYYY-Mon-DD HH:MM' — Horizons needs month abbreviation or ISO
  const pad = (n: number) => String(n).padStart(2, '0')
  const d = now.toISOString() // UTC
  const datePart = d.slice(0, 10) // YYYY-MM-DD
  const timePart = d.slice(11, 16) // HH:MM
  const start = `${datePart} ${timePart}`
  const stopDate = new Date(now.getTime() + 3600000)
  const sd = stopDate.toISOString()
  const stop = `${sd.slice(0, 10)} ${sd.slice(11, 16)}`

  // Build query manually — Horizons requires unencoded single quotes around certain values
  const qs = [
    `format=json`,
    `COMMAND='${objectId}'`,
    `EPHEM_TYPE=VECTORS`,
    `CENTER='500@399'`,
    `START_TIME='${start}'`,
    `STOP_TIME='${stop}'`,
    `STEP_SIZE='1h'`,
    `VEC_TABLE=2`,
    `OUT_UNITS=KM-S`,
    `CSV_FORMAT=NO`,
    `VEC_LABELS=YES`,
    `OBJ_DATA=NO`,
  ].join('&')

  return `${HORIZONS_BASE}?${qs}`
}

// Parses the Horizons VECTORS result block
// Result looks like:
// $$SOE
// 2460500.000000000 = A.D. 2026-Apr-...
//  X = ...  Y = ...  Z = ...
//  VX= ...  VY= ...  VZ= ...
// $$EOE
function parseHorizonsResponse(raw: string): HorizonsVector {
  const soe = raw.indexOf('$$SOE')
  const eoe = raw.indexOf('$$EOE')
  if (soe === -1 || eoe === -1) throw new Error('No ephemeris data in Horizons response')

  const block = raw.slice(soe + 5, eoe).trim()
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)

  // First line is the time
  const timeLine = lines[0]
  // Format: "2460500.000000000 = A.D. 2026-Apr-02 10:35:12.0000 TDB"
  const timeMatch = timeLine.match(/A\.D\.\s+(\d{4}-\w+-\d{2}\s+[\d:.]+)/)
  const timeStr = timeMatch ? timeMatch[1] : timeLine

  // Find X, Y, Z line
  const xyzLine = lines.find((l) => l.includes('X =') || l.includes('X='))
  const vLine = lines.find((l) => l.includes('VX=') || l.includes('VX ='))

  if (!xyzLine || !vLine) throw new Error('Could not parse position/velocity from Horizons response')

  const numRe = /[-+]?\d+\.?\d*(?:[eE][-+]?\d+)?/g

  const xyzNums = xyzLine.match(numRe)?.map(Number)
  const vNums = vLine.match(numRe)?.map(Number)

  if (!xyzNums || xyzNums.length < 3 || !vNums || vNums.length < 3) {
    throw new Error('Insufficient numeric values in Horizons response')
  }

  return {
    x: xyzNums[0],
    y: xyzNums[1],
    z: xyzNums[2],
    vx: vNums[0],
    vy: vNums[1],
    vz: vNums[2],
    time: timeStr,
  }
}

function magnitude(v: HorizonsVector): number {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)
}

function distance(a: HorizonsVector, b: HorizonsVector): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

const KM_TO_MI = 0.621371
const SPEED_OF_LIGHT_KMS = 299792

export async function fetchTelemetry(): Promise<TelemetryData> {
  const now = new Date()

  const [orionRes, moonRes] = await Promise.all([
    fetch(buildHorizonsUrl('-1024', now), { next: { revalidate: 0 } }),
    fetch(buildHorizonsUrl('301', now), { next: { revalidate: 0 } }),
  ])

  if (!orionRes.ok) throw new Error(`Horizons Orion fetch failed: ${orionRes.status}`)
  if (!moonRes.ok) throw new Error(`Horizons Moon fetch failed: ${moonRes.status}`)

  const [orionJson, moonJson] = await Promise.all([orionRes.json(), moonRes.json()])

  const orion = parseHorizonsResponse(orionJson.result as string)
  const moon = parseHorizonsResponse(moonJson.result as string)

  const distanceFromEarth_km = magnitude(orion)
  const distanceFromMoon_km = distance(orion, moon)
  const speed_kms = Math.sqrt(orion.vx ** 2 + orion.vy ** 2 + orion.vz ** 2)

  return {
    orion,
    moon,
    distanceFromEarth_km,
    distanceFromMoon_km,
    speed_kms,
    speed_mph: speed_kms * KM_TO_MI * 3600,
    distanceFromEarth_mi: distanceFromEarth_km * KM_TO_MI,
    distanceFromMoon_mi: distanceFromMoon_km * KM_TO_MI,
    lightDelay_s: distanceFromEarth_km / SPEED_OF_LIGHT_KMS,
    fetchedAt: now.toISOString(),
  }
}
