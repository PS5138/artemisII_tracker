'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DataPoller } from '@/lib/DataPoller'
import { TelemetryPanel } from '@/components/panels/TelemetryPanel'
import { METClock } from '@/components/panels/METClock'
import { RecordTracker } from '@/components/panels/RecordTracker'
import { MilestonePanel } from '@/components/panels/MilestonePanel'
import { SpaceWeatherPanel } from '@/components/panels/SpaceWeatherPanel'
import { CrewPanel } from '@/components/panels/CrewPanel'
import { ContextFacts } from '@/components/panels/ContextFacts'
import { ApolloCmp } from '@/components/panels/ApolloCmp'
import { useTrackerStore } from '@/lib/store'

const SpaceScene = dynamic(
  () => import('@/components/scene/SpaceScene').then((m) => m.SpaceScene),
  { ssr: false }
)

function CameraControls() {
  const { cameraMode, setCameraMode } = useTrackerStore()
  return (
    <div className="flex gap-2">
      {(['overview', 'orion', 'moon'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setCameraMode(mode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest transition-all
            ${cameraMode === mode
              ? 'bg-cyan-500 text-black'
              : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <>
      <DataPoller />
      <div className="h-screen flex flex-col bg-black overflow-hidden">

        {/* Header */}
        <header className="border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between bg-black/90 flex-shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-widest uppercase text-white">Artemis II</span>
            <span className="text-xs text-zinc-500 tracking-widest uppercase hidden sm:block">Live Mission Tracker</span>
          </div>
          <div className="text-xs text-zinc-500">
            Data: JPL Horizons · NOAA SWPC
          </div>
        </header>

        {/* Main — fills remaining viewport, no page scroll */}
        <main className="flex-1 flex min-h-0 overflow-hidden">

          {/* 3D Scene */}
          <div className="flex-1 relative min-w-0">
            <div className="absolute inset-0">
              <SpaceScene />
            </div>

            {/* Camera controls overlay */}
            <div className="absolute bottom-4 left-4 z-10">
              <CameraControls />
            </div>

            {/* Sidebar toggle — sits at the right edge of the scene */}
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              title={sidebarOpen ? 'Collapse panel' : 'Expand panel'}
              className="absolute top-1/2 right-0 -translate-y-1/2 z-20 h-14 w-5 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 border-r-0 rounded-l-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <span className="text-[10px] font-bold">{sidebarOpen ? '›' : '‹'}</span>
            </button>
          </div>

          {/* Right sidebar — two columns, no page scroll */}
          {sidebarOpen && (
            <div className="w-[740px] flex-shrink-0 border-l border-zinc-800/60 bg-zinc-950/50 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                <div className="grid grid-cols-2 gap-3">

                  {/* Left column */}
                  <div className="flex flex-col gap-3">
                    <METClock />
                    <TelemetryPanel />
                    <RecordTracker />
                    <ContextFacts />
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-3">
                    <SpaceWeatherPanel />
                    <ApolloCmp />
                    <MilestonePanel />
                    <CrewPanel />
                  </div>

                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
