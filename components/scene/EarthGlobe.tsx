'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// At TRUE_SCALE (1/500000): Earth radius = 6371/500000 = 0.01274 scene units
// We inflate slightly for visibility while keeping the proportions clearly different from Moon
export const EARTH_RADIUS = 0.1274

function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture('/textures/earth.jpg')
  const normalMap = useTexture('/textures/earth_normal.jpg')

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <>
      <Sphere ref={meshRef} args={[EARTH_RADIUS, 64, 64]}>
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughness={0.75}
          metalness={0.05}
        />
      </Sphere>
      {/* Atmosphere glow */}
      <Sphere args={[EARTH_RADIUS * 1.04, 32, 32]}>
        <meshStandardMaterial
          color="#4da6ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  )
}

export function EarthGlobe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <EarthMesh />
    </group>
  )
}
