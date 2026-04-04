'use client'

import { useEffect, useState } from 'react'
import { MISSION, getMissionElapsed } from '@/lib/mission'

function getCurrentActivity(elapsedHrs: number): string {
  if (elapsedHrs < 1.5) return 'Launch and ascent'
  if (elapsedHrs < 6)   return 'Spacecraft checkout and systems verification'
  if (elapsedHrs < 24)  return 'Translunar coast — trajectory monitoring'
  if (elapsedHrs < 48)  return 'Translunar coast — science and observations'
  if (elapsedHrs < 66)  return 'Approaching lunar sphere of influence'
  if (elapsedHrs < 78)  return 'Lunar proximity operations'
  if (elapsedHrs < 90)  return 'Return trajectory burn and Earth-bound coast'
  return 'Coast phase — Earth approach'
}

export function CrewPanel() {
  const [elapsedHrs, setElapsedHrs] = useState(() => getMissionElapsed().totalSeconds / 3600)

  useEffect(() => {
    // Update activity label every minute
    const t = setInterval(() => {
      setElapsedHrs(getMissionElapsed().totalSeconds / 3600)
    }, 60_000)
    return () => clearInterval(t)
  }, [])

  const activity = getCurrentActivity(elapsedHrs)

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
