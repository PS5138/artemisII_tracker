'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useTrackerStore } from '@/lib/store'

// Must match SpaceScene's scale factor
const COMPRESSED_SCALE = 1 / 50000
const TRUE_SCALE = COMPRESSED_SCALE * 0.1

// Convert a raw Horizons km vector to scene coords (same axis remapping as SpaceScene)
function toScene(p: { x: number; y: number; z: number }, scale: number): THREE.Vector3 {
  return new THREE.Vector3(p.x * scale, p.z * scale, -p.y * scale)
}

export function TrajectoryPath() {
  const history = useTrackerStore((s) => s.orionHistory)
  const showTrueScale = useTrackerStore((s) => s.showTrueScale)

  const points = useMemo(() => {
    if (history.length < 2) return null
    const scale = showTrueScale ? TRUE_SCALE : COMPRESSED_SCALE
    return history.map((p) => toScene(p, scale))
  }, [history, showTrueScale])

  if (!points || points.length < 2) return null

  return (
    <Line
      points={points}
      color="#00e5ff"
      lineWidth={1.2}
      transparent
      opacity={0.35}
    />
  )
}
