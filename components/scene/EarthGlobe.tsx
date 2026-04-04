'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
}

export function EarthGlobe({ position }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group position={position}>
      {/* Main globe */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#1a6fa8"
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>
      {/* Atmosphere glow */}
      <Sphere args={[1.02, 32, 32]}>
        <meshStandardMaterial
          color="#4da6ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}
