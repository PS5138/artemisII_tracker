'use client'

import { useEffect, useState } from 'react'
import { getMissionElapsed } from '@/lib/mission'

type Elapsed = ReturnType<typeof getMissionElapsed>

export function METClock() {
  // null on server — real value set client-side only, avoiding hydration mismatch
  const [elapsed, setElapsed] = useState<Elapsed | null>(null)

  useEffect(() => {
    setElapsed(getMissionElapsed())
    const timer = setInterval(() => setElapsed(getMissionElapsed()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Mission Elapsed Time</h2>
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-4xl font-bold text-white">{elapsed?.days ?? '--'}</span>
        <span className="text-lg text-zinc-400 mr-2">d</span>
        <span className="text-4xl font-bold text-white">{elapsed ? pad(elapsed.hours) : '--'}</span>
        <span className="text-lg text-zinc-400 mr-2">h</span>
        <span className="text-4xl font-bold text-white">{elapsed ? pad(elapsed.minutes) : '--'}</span>
        <span className="text-lg text-zinc-400 mr-2">m</span>
        <span className="text-4xl font-bold text-white">{elapsed ? pad(elapsed.seconds) : '--'}</span>
        <span className="text-lg text-zinc-400">s</span>
      </div>
    </div>
  )
}
