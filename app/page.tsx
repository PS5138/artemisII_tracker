'use client'

import dynamic from 'next/dynamic'
import { DataPoller } from '@/lib/DataPoller'
import { TelemetryPanel } from '@/components/panels/TelemetryPanel'
import { METClock } from '@/components/panels/METClock'
import { RecordTracker } from '@/components/panels/RecordTracker'
import { MilestonePanel } from '@/components/panels/MilestonePanel'
import { SpaceWeatherPanel } from '@/components/panels/SpaceWeatherPanel'
import { CrewPanel } from '@/components/panels/CrewPanel'
import { ContextFacts } from '@/components/panels/ContextFacts'
import { useTrackerStore } from '@/lib/store'

// Three.js scene must be client-side only (no SSR)
const SpaceScene = dynamic(
  () => import('@/components/scene/SpaceScene').then((m) => m.SpaceScene),
  { ssr: false }
)

function CameraControls() {
  const { cameraMode, setCameraMode, showTrueScale, toggleScale } = useTrackerStore()

  return (
    <div className="flex gap-2 flex-wrap">
      {(['overview', 'orion', 'moon'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setCameraMode(mode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest transition-all
            ${cameraMode === mode
              ? 'bg-cyan-500 text-black'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
        >
          {mode}
        </button>
      ))}
      <button
        onClick={toggleScale}
        className="px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
      >
        {showTrueScale ? 'Compressed Scale' : 'True Scale'}
      </button>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <DataPoller />
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-50 bg-black/80">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-widest uppercase text-white">Artemis II</span>
            <span className="text-xs text-zinc-500 tracking-widest uppercase hidden sm:block">Live Mission Tracker</span>
          </div>
          <div className="text-xs text-zinc-500">
            Data: JPL Horizons · NOAA SWPC
          </div>
        </header>

        {/* Main layout */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-0">
          {/* 3D Scene */}
          <div className="relative" style={{ minHeight: '60vh' }}>
            <div className="absolute inset-0">
              <SpaceScene />
            </div>
            {/* Camera controls overlay */}
            <div className="absolute bottom-4 left-4 z-10">
              <CameraControls />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="border-l border-zinc-800/60 overflow-y-auto bg-zinc-950/50">
            <div className="p-4 flex flex-col gap-4">
              <METClock />
              <TelemetryPanel />
              <RecordTracker />
              <ContextFacts />
              <SpaceWeatherPanel />
              <MilestonePanel />
              <CrewPanel />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
