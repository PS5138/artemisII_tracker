'use client'

import { create } from 'zustand'
import type { TelemetryData } from './horizons'
import type { SpaceWeatherData } from './spaceweather'

const MAX_HISTORY = 300

interface TrackerState {
  telemetry: TelemetryData | null
  telemetryError: string | null
  weather: SpaceWeatherData | null
  weatherError: string | null
  lastTelemetryFetch: number | null
  lastWeatherFetch: number | null
  cameraMode: 'overview' | 'orion' | 'moon'
  orionHistory: Array<{ x: number; y: number; z: number }>
  prevSpeed_kms: number | null

  setTelemetry: (data: TelemetryData) => void
  setTelemetryError: (err: string) => void
  setWeather: (data: SpaceWeatherData) => void
  setWeatherError: (err: string) => void
  setCameraMode: (mode: 'overview' | 'orion' | 'moon') => void
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  telemetry: null,
  telemetryError: null,
  weather: null,
  weatherError: null,
  lastTelemetryFetch: null,
  lastWeatherFetch: null,
  cameraMode: 'overview',
  orionHistory: [],
  prevSpeed_kms: null,

  setTelemetry: (data) => {
    const prev = get().telemetry
    const history = get().orionHistory
    const newEntry = { x: data.orion.x, y: data.orion.y, z: data.orion.z }
    const newHistory = history.length >= MAX_HISTORY
      ? [...history.slice(1), newEntry]
      : [...history, newEntry]
    set({
      telemetry: data,
      telemetryError: null,
      lastTelemetryFetch: Date.now(),
      prevSpeed_kms: prev?.speed_kms ?? null,
      orionHistory: newHistory,
    })
  },
  setTelemetryError: (err) => set({ telemetryError: err }),
  setWeather: (data) => set({ weather: data, weatherError: null, lastWeatherFetch: Date.now() }),
  setWeatherError: (err) => set({ weatherError: err }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
}))
