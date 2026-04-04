import { MISSION } from './mission'

const KM_TO_MI = 0.621371
const EARTH_RADIUS_KM = 6371
const MOON_RADIUS_KM = 1737
const SPEED_OF_LIGHT_KMS = 299792
const AVG_CAR_SPEED_KMH = 100
const COMMERCIAL_AIRCRAFT_KMH = 900

export function generateFacts(
  distanceFromEarth_km: number,
  speed_kms: number,
  distanceFromMoon_km: number
): string[] {
  const facts: string[] = []

  // Angular size of Earth as seen from Orion
  const earthAngularDeg = (2 * Math.atan(EARTH_RADIUS_KM / distanceFromEarth_km) * 180) / Math.PI
  facts.push(
    `Earth subtends ${earthAngularDeg.toFixed(2)}° from Orion — ${(earthAngularDeg / 0.5).toFixed(1)}× the Moon's apparent size from Earth`
  )

  // Car comparison
  const carYears = distanceFromEarth_km / (AVG_CAR_SPEED_KMH * 8760)
  facts.push(
    `Driving at 100 km/h without stopping, you'd need ${carYears.toFixed(1)} years to cover this distance`
  )

  // Record comparison
  const pct = (distanceFromEarth_km / MISSION.humanDistanceRecord_km) * 100
  if (distanceFromEarth_km >= MISSION.humanDistanceRecord_km) {
    facts.push(
      `Orion has broken the human distance record — ${(distanceFromEarth_km - MISSION.humanDistanceRecord_km).toFixed(0)} km beyond Apollo 13's mark`
    )
  } else {
    facts.push(
      `Orion is ${pct.toFixed(1)}% of the way to the human distance record set by Apollo 13 (${MISSION.humanDistanceRecord_km.toLocaleString()} km)`
    )
  }

  // Speed comparison
  const speedKmh = speed_kms * 3600
  const vsAircraft = speedKmh / COMMERCIAL_AIRCRAFT_KMH
  facts.push(
    `Orion is travelling at ${speedKmh.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h — ${vsAircraft.toFixed(0)}× faster than a commercial aircraft`
  )

  // Light delay
  const lightDelay = distanceFromEarth_km / SPEED_OF_LIGHT_KMS
  facts.push(
    `Radio signals from Mission Control take ${lightDelay.toFixed(2)}s to reach the crew — and another ${lightDelay.toFixed(2)}s for the reply`
  )

  // Moon angular size from Orion
  if (distanceFromMoon_km > 0) {
    const moonAngularDeg = (2 * Math.atan(MOON_RADIUS_KM / distanceFromMoon_km) * 180) / Math.PI
    const moonAngularEarthRef = 0.5 // degrees
    if (moonAngularDeg > moonAngularEarthRef) {
      facts.push(
        `The Moon looks ${(moonAngularDeg / moonAngularEarthRef).toFixed(1)}× larger from Orion than it does from Earth`
      )
    } else {
      facts.push(
        `The Moon appears ${moonAngularDeg.toFixed(2)}° across from Orion — ${(moonAngularEarthRef / moonAngularDeg).toFixed(1)}× smaller than from Earth`
      )
    }
  }

  // Historical context
  facts.push('You are watching history — this is the first crewed mission beyond low Earth orbit since Apollo 17 in December 1972.')

  return facts
}
