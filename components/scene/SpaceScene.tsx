'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { EarthGlobe } from './EarthGlobe'
import { MoonGlobe } from './MoonGlobe'
import { OrionMarker } from './OrionMarker'
import { TrajectoryPath } from './TrajectoryPath'
import { CameraController } from './CameraController'
import { useTrackerStore } from '@/lib/store'

// 1 scene unit = 50,000 km (compressed)
// True-scale mode keeps the same position scale but shrinks body radii to real proportions
const COMPRESSED_SCALE = 1 / 50000
const TRUE_SCALE = COMPRESSED_SCALE * 0.1   // positions ~10× tighter — bodies also shrink

export function SpaceScene() {
  const telemetry = useTrackerStore((s) => s.telemetry)
  const showTrueScale = useTrackerStore((s) => s.showTrueScale)
  const orbitRef = useRef(null)

  const scale = showTrueScale ? TRUE_SCALE : COMPRESSED_SCALE

  // Orion position: Horizons uses Y-up ecliptic; map Z→up for Three.js
  const orionPos: [number, number, number] = telemetry
    ? [telemetry.orion.x * scale, telemetry.orion.z * scale, -telemetry.orion.y * scale]
    : [0, 0, 6]

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
        <EarthGlobe position={[0, 0, 0]} trueScale={showTrueScale} />
        <MoonGlobe position={moonPos} trueScale={showTrueScale} />
        <OrionMarker position={orionPos} />
        <TrajectoryPath />
      </Suspense>

      <CameraController orionPos={orionPos} moonPos={moonPos} orbitRef={orbitRef} />

      <OrbitControls
        ref={orbitRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={60}
        autoRotate={false}
      />
    </Canvas>
  )
}
