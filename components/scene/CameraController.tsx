'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackerStore } from '@/lib/store'

interface Props {
  orionPos: [number, number, number]
  moonPos: [number, number, number]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitRef: React.RefObject<any>
}

function getCameraTarget(
  mode: 'overview' | 'orion' | 'moon',
  orionPos: [number, number, number],
  moonPos: [number, number, number],
): { camPos: THREE.Vector3; lookAt: THREE.Vector3 } {
  if (mode === 'overview') {
    return {
      camPos: new THREE.Vector3(0, 4, 18),
      lookAt: new THREE.Vector3(0, 0, 0),
    }
  }

  if (mode === 'orion') {
    const op = new THREE.Vector3(...orionPos)
    // Pull camera back along the Earth→Orion direction, raise slightly
    const dir = op.clone().normalize()
    const offset = dir.clone().multiplyScalar(-1.8)
    offset.y += 0.4
    return {
      camPos: op.clone().add(offset),
      lookAt: op,
    }
  }

  // moon
  const mp = new THREE.Vector3(...moonPos)
  const dir = mp.clone().normalize()
  const offset = dir.clone().multiplyScalar(-2.5)
  offset.y += 0.8
  return {
    camPos: mp.clone().add(offset),
    lookAt: mp,
  }
}

export function CameraController({ orionPos, moonPos, orbitRef }: Props) {
  const cameraMode = useTrackerStore((s) => s.cameraMode)
  const { camera } = useThree()

  const targetCamPos = useRef(new THREE.Vector3(0, 4, 18))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const isAnimating = useRef(false)

  // When mode or Orion/Moon positions change, update targets
  useEffect(() => {
    const { camPos, lookAt } = getCameraTarget(cameraMode, orionPos, moonPos)
    targetCamPos.current.copy(camPos)
    targetLookAt.current.copy(lookAt)
    isAnimating.current = true
    if (orbitRef.current) orbitRef.current.enabled = false
  }, [cameraMode, orionPos, moonPos, orbitRef])

  useFrame((_, delta) => {
    if (!isAnimating.current) return

    // Exponential decay lerp — feels smooth
    const k = 1 - Math.exp(-5 * delta)

    camera.position.lerp(targetCamPos.current, k)
    currentLookAt.current.lerp(targetLookAt.current, k)
    camera.lookAt(currentLookAt.current)

    const dist = camera.position.distanceTo(targetCamPos.current)
    if (dist < 0.02) {
      camera.position.copy(targetCamPos.current)
      currentLookAt.current.copy(targetLookAt.current)
      camera.lookAt(currentLookAt.current)
      isAnimating.current = false

      if (orbitRef.current) {
        orbitRef.current.target.copy(targetLookAt.current)
        orbitRef.current.update()
        orbitRef.current.enabled = true
      }
    }
  })

  return null
}
