'use client'

import { useTrackerStore } from '@/lib/store'
import { isMissionOver, MISSION } from '@/lib/mission'

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

function StatRow({ label, km, mi }: { label: string; km: number; mi: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-400 uppercase tracking-widest">{label}</span>
      <span className="text-2xl font-mono font-bold text-white">
        {fmt(km)} <span className="text-sm font-normal text-zinc-400">km</span>
      </span>
      <span className="text-sm font-mono text-zinc-300">
        {fmt(mi)} <span className="text-xs text-zinc-500">mi</span>
      </span>
    </div>
  )
}

function VelocityTrend({ current, prev }: { current: number; prev: number | null }) {
  if (prev === null) return null
  const delta = current - prev
  const absDelta = Math.abs(delta)
  if (absDelta < 0.001) return null

  const isAccel = delta > 0
  return (
    <span
      className={`text-xs font-mono ml-1 ${isAccel ? 'text-green-400' : 'text-orange-400'}`}
      title={`${isAccel ? '+' : ''}${delta.toFixed(3)} km/s since last poll`}
    >
      {isAccel ? '↑' : '↓'} {absDelta.toFixed(3)} km/s
    </span>
  )
}

function LastUpdated({ ts }: { ts: number | null }) {
  if (!ts) return null
  const secs = Math.floor((Date.now() - ts) / 1000)
  const label = secs < 5 ? 'just now' : `${secs}s ago`
  return <span className="text-xs text-zinc-600">{label}</span>
}

export function TelemetryPanel() {
  const telemetry = useTrackerStore((s) => s.telemetry)
  const error = useTrackerStore((s) => s.telemetryError)
  const prevSpeed = useTrackerStore((s) => s.prevSpeed_kms)
  const lastFetch = useTrackerStore((s) => s.lastTelemetryFetch)

  if (isMissionOver()) {
    return (
      <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Live Telemetry</h2>
        <div className="text-sm text-zinc-400">
          Artemis II splashed down on{' '}
          <span className="text-zinc-200">
            {MISSION.splashdown.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          . Live telemetry polling has stopped.
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-4 text-sm text-red-400">
        Telemetry unavailable: {error}
      </div>
    )
  }

  if (!telemetry) {
    return (
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-700/40 p-4 animate-pulse">
        <div className="h-4 w-32 bg-zinc-700 rounded mb-3" />
        <div className="h-8 w-48 bg-zinc-700 rounded" />
      </div>
    )
  }

  const speedKmh = telemetry.speed_kms * 3600

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 flex flex-col gap-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Live Telemetry</h2>
        <div className="flex items-center gap-2">
          <LastUpdated ts={lastFetch} />
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <StatRow label="Distance from Earth" km={telemetry.distanceFromEarth_km} mi={telemetry.distanceFromEarth_mi} />
        <StatRow label="Distance from Moon" km={telemetry.distanceFromMoon_km} mi={telemetry.distanceFromMoon_mi} />
      </div>

      <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-400 uppercase tracking-widest">Speed</span>
          <span className="text-2xl font-mono font-bold text-white">
            {fmt(telemetry.speed_mph, 0)} <span className="text-sm font-normal text-zinc-400">mph</span>
          </span>
          <div className="flex items-center flex-wrap">
            <span className="text-sm font-mono text-zinc-300">
              {telemetry.speed_kms.toFixed(2)} <span className="text-xs text-zinc-500">km/s</span>
            </span>
            <VelocityTrend current={telemetry.speed_kms} prev={prevSpeed} />
          </div>
          <span className="text-xs text-zinc-600 mt-0.5">
            {fmt(speedKmh, 0)} km/h
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-400 uppercase tracking-widest">Light Delay</span>
          <span className="text-2xl font-mono font-bold text-white">
            {telemetry.lightDelay_s.toFixed(2)}<span className="text-sm font-normal text-zinc-400">s</span>
          </span>
          <span className="text-sm text-zinc-500">one-way signal travel</span>
          <span className="text-xs text-zinc-600 mt-0.5">
            {(telemetry.lightDelay_s * 2).toFixed(2)}s round-trip
          </span>
        </div>
      </div>
    </div>
  )
}
