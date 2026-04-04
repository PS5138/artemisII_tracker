'use client'

import { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { EarthGlobe } from './EarthGlobe'
import { MoonGlobe } from './MoonGlobe'
import { OrionMarker } from './OrionMarker'
import { TrajectoryPath } from './TrajectoryPath'
import { CameraController } from './CameraController'
import { useTrackerStore } from '@/lib/store'

// 1 scene unit = 500,000 km (true scale)
// Earth radius  = 0.1274 scene units
// Moon distance ≈ 0.77 scene units
// Orion max     ≈ 0.80 scene units
const TRUE_SCALE = 1 / 500000

export function SpaceScene() {
  const telemetry = useTrackerStore((s) => s.telemetry)
  const orbitRef = useRef(null)

  const orionPos = useMemo<[number, number, number]>(() => telemetry
    ? [telemetry.orion.x * TRUE_SCALE, telemetry.orion.z * TRUE_SCALE, -telemetry.orion.y * TRUE_SCALE]
    : [0, 0, 0.8],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [telemetry?.orion.x, telemetry?.orion.y, telemetry?.orion.z])

  const moonPos = useMemo<[number, number, number]>(() => telemetry
    ? [telemetry.moon.x * TRUE_SCALE, telemetry.moon.z * TRUE_SCALE, -telemetry.moon.y * TRUE_SCALE]
    : [0.77, 0, 0],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [telemetry?.moon.x, telemetry?.moon.y, telemetry?.moon.z])

  return (
    <Canvas
      camera={{ position: [0, 0.4, 2.2], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      {/* Brighter ambient so the dark sides of bodies are visible */}
      <ambientLight intensity={0.45} />
      {/* Primary sun — offset along X axis */}
      <directionalLight position={[50, 5, 10]} intensity={2.2} color="#fff8f0" />
      {/* Soft fill light from the camera side so textures stay readable */}
      <directionalLight position={[0, 2, 20]} intensity={0.5} color="#cce8ff" />

      <Suspense fallback={null}>
        <Stars radius={200} depth={80} count={6000} factor={3} fade speed={0.3} />
        <EarthGlobe position={[0, 0, 0]} />
        <MoonGlobe position={moonPos} />
        <OrionMarker position={orionPos} />
        <TrajectoryPath />
      </Suspense>

      <CameraController orionPos={orionPos} moonPos={moonPos} orbitRef={orbitRef} />

      <OrbitControls
        ref={orbitRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.01}
        maxDistance={8}
        autoRotate={false}
      />
    </Canvas>
  )
}
