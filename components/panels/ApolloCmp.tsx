'use client'

import { useTrackerStore } from '@/lib/store'
import { buildApolloComparison } from '@/lib/apollo'
import { getMissionElapsed } from '@/lib/mission'
import { InfoPopup } from './InfoPopup'

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function ApolloCmp() {
  const telemetry = useTrackerStore((s) => s.telemetry)

  if (!telemetry) return null

  const elapsedHrs = getMissionElapsed().totalSeconds / 3600
  const cmp = buildApolloComparison(elapsedHrs, telemetry.distanceFromEarth_km)

  if (!cmp) return null

  const artemisAhead = cmp.diffKm > 0
  const diffAbs = Math.abs(cmp.diffKm)

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Apollo 13 Comparison</h2>
        <InfoPopup content={
          <div className="space-y-3">
            <p className="text-zinc-200 font-medium">How Apollo 13 distance values are calculated</p>
            <p>There is no live API for historical mission data. Apollo 13&apos;s distance from Earth is reconstructed from a static lookup table of key mission events, then <span className="text-zinc-200">linearly interpolated</span> between those points.</p>
            <div>
              <p className="text-zinc-400 font-medium mb-1">Known anchor points used:</p>
              <ul className="space-y-0.5 text-zinc-400">
                <li>T+0h — Launch (Earth surface)</li>
                <li>T+55.9h — Oxygen tank explosion</li>
                <li>T+73.5h — Max distance: <span className="text-zinc-200">400,171 km</span></li>
                <li>T+77.1h — Lunar closest approach</li>
                <li>T+141.9h — Splashdown</li>
              </ul>
            </div>
            <p className="text-zinc-500 border-t border-zinc-700 pt-2">Intermediate values are approximate — accurate to within ~5,000 km. The record distance and event timestamps are verified from NASA mission records.</p>
          </div>
        } />
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Where Apollo 13 was at this same mission elapsed time ({Math.floor(elapsedHrs)}h {Math.floor((elapsedHrs % 1) * 60)}m)
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Artemis II</div>
          <div className="text-xl font-mono font-bold text-cyan-400">{fmt(cmp.artemisDistKm)}</div>
          <div className="text-xs text-zinc-400">km from Earth</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Apollo 13</div>
          <div className="text-xl font-mono font-bold text-zinc-300">{fmt(cmp.apollo13DistKm)}</div>
          <div className="text-xs text-zinc-400">km from Earth</div>
        </div>
      </div>

      {/* Bar comparison */}
      {(() => {
        const maxDist = Math.max(cmp.artemisDistKm, cmp.apollo13DistKm, 1)
        const artemisPct = (cmp.artemisDistKm / maxDist) * 100
        const apolloPct = (cmp.apollo13DistKm / maxDist) * 100
        return (
          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Artemis II</span>
                <span>{fmt(cmp.artemisDistKm)} km</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${artemisPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Apollo 13</span>
                <span>{fmt(cmp.apollo13DistKm)} km</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="h-full rounded-full bg-zinc-500 transition-all duration-700" style={{ width: `${apolloPct}%` }} />
              </div>
            </div>
          </div>
        )
      })()}

      <div className={`text-xs px-3 py-2 rounded-lg ${artemisAhead ? 'bg-cyan-950/40 text-cyan-300' : 'bg-zinc-800/60 text-zinc-400'}`}>
        {artemisAhead
          ? `Artemis II is ${fmt(diffAbs)} km farther from Earth than Apollo 13 was at this point`
          : `Apollo 13 was ${fmt(diffAbs)} km farther from Earth at this same elapsed time`}
      </div>
    </div>
  )
}
