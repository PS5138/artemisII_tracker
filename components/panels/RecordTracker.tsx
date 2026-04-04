'use client'

import { useTrackerStore } from '@/lib/store'
import { MISSION } from '@/lib/mission'

const RECORD_KM = MISSION.humanDistanceRecord_km
const KM_TO_MI = 0.621371

export function RecordTracker() {
  const telemetry = useTrackerStore((s) => s.telemetry)

  if (!telemetry) return null

  const dist = telemetry.distanceFromEarth_km
  const pct = Math.min((dist / RECORD_KM) * 100, 100)
  const broken = dist >= RECORD_KM
  const diff = dist - RECORD_KM

  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm ${broken ? 'bg-yellow-950/40 border-yellow-600/50' : 'bg-zinc-900/70 border-zinc-700/40'}`}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-1">Human Distance Record</h2>
      <p className="text-xs text-zinc-500 mb-4">Apollo 13 (1970) — {RECORD_KM.toLocaleString()} km / {(RECORD_KM * KM_TO_MI).toLocaleString(undefined, { maximumFractionDigits: 0 })} mi</p>

      {broken ? (
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-yellow-400 mb-1">Record Broken!</div>
          <div className="text-sm text-yellow-300">
            +{Math.abs(diff).toLocaleString(undefined, { maximumFractionDigits: 0 })} km beyond the record
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Earth</span>
            <span>{pct.toFixed(1)}%</span>
            <span>Record</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {(RECORD_KM - dist).toLocaleString(undefined, { maximumFractionDigits: 0 })} km to record
          </div>
        </>
      )}
    </div>
  )
}
