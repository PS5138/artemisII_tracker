'use client'

import { useTrackerStore } from '@/lib/store'
import type { WeatherStatus } from '@/lib/spaceweather'

const STATUS_CONFIG: Record<WeatherStatus, { color: string; bg: string; border: string; label: string }> = {
  GREEN: { color: 'text-green-400', bg: 'bg-green-500', border: 'border-green-700/50', label: 'All Clear' },
  AMBER: { color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-700/50', label: 'Elevated' },
  RED:   { color: 'text-red-400',    bg: 'bg-red-500',    border: 'border-red-700/50',    label: 'Warning'  },
}

export function SpaceWeatherPanel() {
  const weather = useTrackerStore((s) => s.weather)
  const error = useTrackerStore((s) => s.weatherError)

  if (error) {
    return (
      <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Space Weather</h2>
        <p className="text-xs text-zinc-500">{error}</p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 animate-pulse">
        <div className="h-4 w-28 bg-zinc-700 rounded mb-3" />
        <div className="h-8 w-16 bg-zinc-700 rounded" />
      </div>
    )
  }

  const cfg = STATUS_CONFIG[weather.status]

  return (
    <div className={`rounded-xl bg-zinc-900/70 border p-5 backdrop-blur-sm ${cfg.border}`}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">Space Weather</h2>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-4 h-4 rounded-full ${cfg.bg} animate-pulse flex-shrink-0`} />
        <span className={`text-xl font-bold ${cfg.color}`}>{weather.status}</span>
        <span className="text-sm text-zinc-400">— {cfg.label}</span>
      </div>

      <p className="text-sm text-zinc-300 mb-4">{weather.summary}</p>

      <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Kp Index</div>
          <div className="text-2xl font-mono font-bold text-white">{weather.kpIndex.toFixed(1)}</div>
          <div className="text-xs text-zinc-500">geomagnetic activity</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Solar Flares (24h)</div>
          <div className="text-2xl font-mono font-bold text-white">{weather.solarFlares24h.length}</div>
          {weather.solarFlares24h.length > 0 && (
            <div className="text-xs text-zinc-400">
              {weather.solarFlares24h.map((f) => f.classType).join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 text-xs text-zinc-400">
        Beyond Earth&apos;s magnetosphere, the crew&apos;s radiation exposure is elevated during M/X-class events. Orion&apos;s crew module provides additional shielding.
      </div>
    </div>
  )
}
