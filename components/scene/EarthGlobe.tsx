'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// True-scale Earth radius relative to the scene scale factor
// At SCALE=1/50000, Earth surface = 6371/50000 = 0.1274 scene units
export const EARTH_SCENE_RADIUS_TRUE = 0.1274
export const EARTH_SCENE_RADIUS_COMPRESSED = 1.0

interface Props {
  position: [number, number, number]
  trueScale?: boolean
}

function EarthMesh({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture('/textures/earth.jpg')
  const normalMap = useTexture('/textures/earth_normal.jpg')

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <>
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.8}
          metalness={0.05}
        />
      </Sphere>
      {/* Atmosphere glow */}
      <Sphere args={[radius * 1.02, 32, 32]}>
        <meshStandardMaterial
          color="#4da6ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  )
}

export function EarthGlobe({ position, trueScale = false }: Props) {
  const radius = trueScale ? EARTH_SCENE_RADIUS_TRUE : EARTH_SCENE_RADIUS_COMPRESSED
  return (
    <group position={position}>
      <EarthMesh radius={radius} />
    </group>
  )
}
