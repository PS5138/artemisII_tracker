'use client'

import { useTrackerStore } from '@/lib/store'
import type { WeatherStatus } from '@/lib/spaceweather'

const STATUS_CONFIG: Record<WeatherStatus, { color: string; bg: string; border: string; label: string }> = {
  GREEN: { color: 'text-green-400', bg: 'bg-green-500', border: 'border-green-700/50', label: 'All Clear' },
  AMBER: { color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-700/50', label: 'Elevated' },
  RED:   { color: 'text-red-400',    bg: 'bg-red-500',    border: 'border-red-700/50',    label: 'Warning'  },
}

function ParticleFluxBar({ flux }: { flux: number }) {
  // ACE EPAM e38-53 channel: background ~10-100, elevated >1000, storm >10000
  const logFlux = Math.log10(Math.max(flux, 1))
  const logMax = 5 // log10(100000)
  const pct = Math.min((logFlux / logMax) * 100, 100)
  const color = flux > 10000 ? 'bg-red-500' : flux > 1000 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div>
      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Particle Flux</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-mono text-zinc-300 w-16 text-right">
          {flux > 1000 ? `${(flux / 1000).toFixed(1)}k` : flux.toFixed(0)} pfu
        </span>
      </div>
      <div className="text-xs text-zinc-600 mt-0.5">ACE EPAM 38–53 keV electrons</div>
    </div>
  )
}

function LastUpdated({ ts }: { ts: number | null }) {
  if (!ts) return null
  const mins = Math.floor((Date.now() - ts) / 60000)
  const label = mins < 1 ? 'just now' : `${mins}m ago`
  return <span className="text-xs text-zinc-600">{label}</span>
}

export function SpaceWeatherPanel() {
  const weather = useTrackerStore((s) => s.weather)
  const error = useTrackerStore((s) => s.weatherError)
  const lastFetch = useTrackerStore((s) => s.lastWeatherFetch)

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Space Weather</h2>
        <LastUpdated ts={lastFetch} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-4 h-4 rounded-full ${cfg.bg} animate-pulse flex-shrink-0`} />
        <span className={`text-xl font-bold ${cfg.color}`}>{weather.status}</span>
        <span className="text-sm text-zinc-400">— {cfg.label}</span>
      </div>

      <p className="text-sm text-zinc-300 mb-4">{weather.summary}</p>

      <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 mb-4">
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

      {weather.particleFlux !== null && (
        <div className="border-t border-zinc-800 pt-4 mb-4">
          <ParticleFluxBar flux={weather.particleFlux} />
        </div>
      )}

      <div className="p-3 rounded-lg bg-zinc-800/50 text-xs text-zinc-400">
        Beyond Earth&apos;s magnetosphere, crew radiation exposure is elevated during M/X-class events.
        Orion&apos;s crew module provides additional shielding; a safe haven procedure exists for severe storms.
      </div>
    </div>
  )
}
