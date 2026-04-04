'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { EarthGlobe } from './EarthGlobe'
import { MoonGlobe } from './MoonGlobe'
import { OrionMarker } from './OrionMarker'
import { useTrackerStore } from '@/lib/store'

// Scale factors — compressed scale for visualisation
// Earth-Moon distance is ~384,400 km; we represent it as ~8 scene units
// All positions are scaled proportionally
const SCALE = 1 / 50000 // 1 scene unit = 50,000 km

function scaleVec(x: number, y: number, z: number): [number, number, number] {
  return [x * SCALE, y * SCALE, z * SCALE]
}

export function SpaceScene() {
  const telemetry = useTrackerStore((s) => s.telemetry)
  const showTrueScale = useTrackerStore((s) => s.showTrueScale)

  const scale = showTrueScale ? SCALE * 0.1 : SCALE

  // Orion position (km) → scene units
  const orionPos: [number, number, number] = telemetry
    ? [telemetry.orion.x * scale, telemetry.orion.z * scale, -telemetry.orion.y * scale]
    : [0, 0, 6] // default position before first fetch

  // Moon position
  const moonPos: [number, number, number] = telemetry
    ? [telemetry.moon.x * scale, telemetry.moon.z * scale, -telemetry.moon.y * scale]
    : [8, 0, 0]

  return (
    <Canvas
      camera={{ position: [0, 4, 18], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.05} />
      <directionalLight position={[50, 0, 0]} intensity={1.2} color="#fff5e0" />

      <Suspense fallback={null}>
        <Stars radius={300} depth={60} count={5000} factor={4} fade speed={0.5} />
        <EarthGlobe position={[0, 0, 0]} />
        <MoonGlobe position={moonPos} />
        <OrionMarker position={orionPos} />
      </Suspense>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={60}
        autoRotate={false}
      />
    </Canvas>
  )
}
