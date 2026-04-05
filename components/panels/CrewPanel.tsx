'use client'

import { useEffect, useState } from 'react'
import { MISSION, getMissionElapsed } from '@/lib/mission'

function getCurrentActivity(elapsedHrs: number): string {
  if (elapsedHrs < 0.17) return 'Launch and ascent'
  if (elapsedHrs < 3.5)  return 'Earth orbit — spacecraft checkout and systems verification'
  if (elapsedHrs < 5)    return 'Trans-Lunar Injection burn — departing Earth orbit'
  if (elapsedHrs < 96)   return 'Outbound coast — translunar trajectory, science and observations'
  if (elapsedHrs < 118)  return 'Approaching the Moon'
  if (elapsedHrs < 125)  return 'Lunar flyby — closest approach, free-return slingshot around the Moon'
  if (elapsedHrs < 200)  return 'Return coast — coasting back toward Earth under gravity'
  if (elapsedHrs < 215)  return 'Earth approach — re-entry preparation and systems checkout'
  return 'Re-entry and splashdown'
}

export function CrewPanel() {
  const [elapsedHrs, setElapsedHrs] = useState<number | null>(null)

  useEffect(() => {
    setElapsedHrs(getMissionElapsed().totalSeconds / 3600)
    const t = setInterval(() => setElapsedHrs(getMissionElapsed().totalSeconds / 3600), 60_000)
    return () => clearInterval(t)
  }, [])

  const activity = getCurrentActivity(elapsedHrs ?? 0)

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Crew</h2>
      <p className="text-xs text-zinc-400 mb-4">
        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Current activity</span>
        <br />
        <span className="text-zinc-200">{activity}</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        {MISSION.crew.map((member) => (
          <div key={member.name} className="rounded-lg bg-zinc-800/60 p-3 flex flex-col gap-1">
            <div className="text-xs font-semibold text-white">{member.name}</div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-widest">{member.role} · {member.agency}</div>
            <div className="text-xs text-zinc-400 mt-1">{member.fact}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
