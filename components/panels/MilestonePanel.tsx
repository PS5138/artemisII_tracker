'use client'

import { useEffect, useState } from 'react'
import { MILESTONES, getNextMilestone, getMilestoneDate, getMissionElapsed } from '@/lib/mission'

function useCountdown(targetDate: Date | null) {
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number; s: number } | null>(null)
  // Use the timestamp as the dependency — Date objects are new references every render
  const targetMs = targetDate?.getTime() ?? null

  useEffect(() => {
    if (targetMs === null) return
    function update() {
      const diff = targetMs! - Date.now()
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      const s = Math.floor(diff / 1000)
      setCountdown({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetMs])

  return countdown
}

// Tick elapsed hours once per second; null until client mounts (avoids hydration mismatch)
function useElapsedHrs() {
  const [elapsedHrs, setElapsedHrs] = useState<number | null>(null)
  useEffect(() => {
    setElapsedHrs(getMissionElapsed().totalSeconds / 3600)
    const t = setInterval(() => setElapsedHrs(getMissionElapsed().totalSeconds / 3600), 1000)
    return () => clearInterval(t)
  }, [])
  return elapsedHrs
}

export function MilestonePanel() {
  const elapsedHrs = useElapsedHrs()
  const next = getNextMilestone()
  const nextDate = next ? getMilestoneDate(next) : null
  const countdown = useCountdown(nextDate)
  const pad = (n: number) => String(n).padStart(2, '0')

  const completedIds = new Set(
    elapsedHrs === null ? [] : MILESTONES.filter((m) => m.offsetHrs <= elapsedHrs).map((m) => m.id)
  )

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">Mission Timeline</h2>

      {next && countdown && (
        <div className="mb-5 p-4 rounded-lg bg-cyan-950/40 border border-cyan-800/50">
          <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">Next Milestone</div>
          <div className="text-base font-semibold text-white mb-1">{next.label}</div>
          <div className="text-xs text-zinc-400 mb-3">{next.description}</div>
          <div className="font-mono text-lg text-cyan-300">
            {countdown.d}d {pad(countdown.h)}h {pad(countdown.m)}m {pad(countdown.s)}s
          </div>
        </div>
      )}

      {!next && (
        <div className="mb-5 p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-sm text-zinc-400">
          Mission complete — all milestones achieved.
        </div>
      )}

      <div className="relative">
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-zinc-700" />
        <div className="flex flex-col gap-4">
          {MILESTONES.map((m) => {
            const done = completedIds.has(m.id)
            const isNext = next?.id === m.id
            return (
              <div key={m.id} className="flex items-start gap-4 pl-7 relative">
                <div className={`absolute left-0 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${done ? 'bg-cyan-500 border-cyan-500' : isNext ? 'bg-zinc-900 border-cyan-400' : 'bg-zinc-900 border-zinc-600'}`}>
                  {done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isNext && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <div>
                  <div className={`text-sm font-medium ${done ? 'text-zinc-400' : isNext ? 'text-white' : 'text-zinc-300'}`}>
                    {m.label}
                  </div>
                  <div className="text-xs text-zinc-500">{m.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
