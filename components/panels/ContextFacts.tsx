'use client'

import { useEffect, useState } from 'react'
import { useTrackerStore } from '@/lib/store'
import { generateFacts } from '@/lib/facts'

export function ContextFacts() {
  const telemetry = useTrackerStore((s) => s.telemetry)
  const [factIndex, setFactIndex] = useState(0)
  const [facts, setFacts] = useState<string[]>([])

  useEffect(() => {
    if (!telemetry) return
    setFacts(generateFacts(telemetry.distanceFromEarth_km, telemetry.speed_kms, telemetry.distanceFromMoon_km))
  }, [telemetry])

  useEffect(() => {
    if (facts.length === 0) return
    const t = setInterval(() => setFactIndex((i) => (i + 1) % facts.length), 8000)
    return () => clearInterval(t)
  }, [facts])

  if (!telemetry || facts.length === 0) return null

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/40 p-5 backdrop-blur-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">In Perspective</h2>
      <p className="text-sm text-zinc-200 leading-relaxed min-h-[3rem] transition-all">
        {facts[factIndex]}
      </p>
      <div className="flex gap-1 mt-3">
        {facts.map((_, i) => (
          <button
            key={i}
            onClick={() => setFactIndex(i)}
            className={`h-1 rounded-full transition-all ${i === factIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  )
}
