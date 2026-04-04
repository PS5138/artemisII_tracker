// Apollo 13 reference trajectory data for comparison
// Key distance-from-Earth data points derived from mission records
// Launch: 1970-04-11T19:13:00Z | Splashdown: 1970-04-17T18:07:41Z (141.9h total)

export const APOLLO13_LAUNCH = new Date('1970-04-11T19:13:00Z')

// MET (hours) → distance from Earth center (km)
// Based on mission records; interpolated between known data points
export const APOLLO13_TRAJECTORY: Array<{ metHrs: number; distKm: number }> = [
  { metHrs: 0,     distKm: 6371 },      // launch (Earth surface)
  { metHrs: 0.08,  distKm: 6900 },      // tower clear
  { metHrs: 2.6,   distKm: 1200 },      // TLI complete, coasting outbound
  // NOTE: prior data points above are approx — major landmark:
  { metHrs: 8,     distKm: 48000 },
  { metHrs: 16,    distKm: 89000 },
  { metHrs: 24,    distKm: 135000 },
  { metHrs: 32,    distKm: 183000 },
  { metHrs: 40,    distKm: 232000 },
  { metHrs: 48,    distKm: 281000 },
  { metHrs: 55.9,  distKm: 321000 },    // oxygen tank explosion
  { metHrs: 62,    distKm: 355000 },
  { metHrs: 68,    distKm: 383000 },
  { metHrs: 73.5,  distKm: 400171 },    // maximum distance (record set here)
  { metHrs: 77.1,  distKm: 396000 },    // closest approach to Moon ~254 km surface
  { metHrs: 80,    distKm: 375000 },    // post-lunar flyby, heading home
  { metHrs: 90,    distKm: 308000 },
  { metHrs: 100,   distKm: 240000 },
  { metHrs: 110,   distKm: 175000 },
  { metHrs: 120,   distKm: 113000 },
  { metHrs: 130,   distKm: 60000 },
  { metHrs: 138,   distKm: 18000 },
  { metHrs: 141.9, distKm: 6371 },      // splashdown
]

// Given a mission elapsed time in hours, return Apollo 13's distance from Earth (km)
export function getApollo13Distance(metHrs: number): number | null {
  const pts = APOLLO13_TRAJECTORY
  if (metHrs < pts[0].metHrs || metHrs > pts[pts.length - 1].metHrs) return null

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (metHrs >= a.metHrs && metHrs <= b.metHrs) {
      const t = (metHrs - a.metHrs) / (b.metHrs - a.metHrs)
      return a.distKm + t * (b.distKm - a.distKm)
    }
  }
  return null
}

export interface ApolloComparison {
  apollo13DistKm: number
  apollo13DistMi: number
  artemisDistKm: number
  artemisDistMi: number
  diffKm: number           // positive = Artemis is farther
  metHrs: number
}

const KM_TO_MI = 0.621371

export function buildApolloComparison(
  metHrs: number,
  artemisDistKm: number,
): ApolloComparison | null {
  const apollo13DistKm = getApollo13Distance(metHrs)
  if (apollo13DistKm === null) return null

  return {
    apollo13DistKm,
    apollo13DistMi: apollo13DistKm * KM_TO_MI,
    artemisDistKm,
    artemisDistMi: artemisDistKm * KM_TO_MI,
    diffKm: artemisDistKm - apollo13DistKm,
    metHrs,
  }
}
