'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useTrackerStore } from '@/lib/store'

const TRUE_SCALE = 1 / 500000

function toScene(p: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(p.x * TRUE_SCALE, p.z * TRUE_SCALE, -p.y * TRUE_SCALE)
}

export function TrajectoryPath() {
  const history = useTrackerStore((s) => s.orionHistory)

  const points = useMemo(() => {
    if (history.length < 2) return null
    return history.map(toScene)
  }, [history])

  if (!points || points.length < 2) return null

  return (
    <Line
      points={points}
      color="#00e5ff"
      lineWidth={1.2}
      transparent
      opacity={0.4}
    />
  )
}
