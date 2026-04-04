'use client'

import { useEffect } from 'react'
import { useTrackerStore } from './store'
import { isMissionOver } from './mission'
import type { TelemetryData } from './horizons'
import type { SpaceWeatherData } from './spaceweather'

const TELEMETRY_INTERVAL_MS = 60_000  // 60s
const WEATHER_INTERVAL_MS = 300_000   // 5min

export function DataPoller() {
  const { setTelemetry, setTelemetryError, setWeather, setWeatherError } = useTrackerStore()

  useEffect(() => {
    // Don't poll at all once the mission is over
    if (isMissionOver()) return

    async function pollTelemetry() {
      try {
        const res = await fetch('/api/telemetry')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data: TelemetryData = await res.json()
        setTelemetry(data)
      } catch (err) {
        setTelemetryError(err instanceof Error ? err.message : 'Telemetry fetch failed')
      }
    }

    async function pollWeather() {
      try {
        const res = await fetch('/api/spaceweather')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data: SpaceWeatherData = await res.json()
        setWeather(data)
      } catch (err) {
        setWeatherError(err instanceof Error ? err.message : 'Space weather fetch failed')
      }
    }

    pollTelemetry()
    pollWeather()

    const telemetryTimer = setInterval(pollTelemetry, TELEMETRY_INTERVAL_MS)
    const weatherTimer = setInterval(pollWeather, WEATHER_INTERVAL_MS)

    return () => {
      clearInterval(telemetryTimer)
      clearInterval(weatherTimer)
    }
  }, [setTelemetry, setTelemetryError, setWeather, setWeatherError])

  return null
}
