'use client'

import { create } from 'zustand'
import type { TelemetryData } from './horizons'
import type { SpaceWeatherData } from './spaceweather'

interface TrackerState {
  telemetry: TelemetryData | null
  telemetryError: string | null
  weather: SpaceWeatherData | null
  weatherError: string | null
  lastTelemetryFetch: number | null
  lastWeatherFetch: number | null
  cameraMode: 'overview' | 'orion' | 'moon'
  showTrueScale: boolean

  setTelemetry: (data: TelemetryData) => void
  setTelemetryError: (err: string) => void
  setWeather: (data: SpaceWeatherData) => void
  setWeatherError: (err: string) => void
  setCameraMode: (mode: 'overview' | 'orion' | 'moon') => void
  toggleScale: () => void
}

export const useTrackerStore = create<TrackerState>((set) => ({
  telemetry: null,
  telemetryError: null,
  weather: null,
  weatherError: null,
  lastTelemetryFetch: null,
  lastWeatherFetch: null,
  cameraMode: 'overview',
  showTrueScale: false,

  setTelemetry: (data) => set({ telemetry: data, telemetryError: null, lastTelemetryFetch: Date.now() }),
  setTelemetryError: (err) => set({ telemetryError: err }),
  setWeather: (data) => set({ weather: data, weatherError: null, lastWeatherFetch: Date.now() }),
  setWeatherError: (err) => set({ weatherError: err }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  toggleScale: () => set((s) => ({ showTrueScale: !s.showTrueScale })),
}))
