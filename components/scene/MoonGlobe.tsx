'use client'

import { useTexture } from '@react-three/drei'
import { Sphere } from '@react-three/drei'

// Moon radius = 1737 km; proportional to EARTH_RADIUS (0.1274) → 0.0347
export const MOON_RADIUS = 0.0347

function MoonMesh({ position }: { position: [number, number, number] }) {
  const texture = useTexture('/textures/moon.jpg')
  return (
    <Sphere position={position} args={[MOON_RADIUS, 32, 32]}>
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
    </Sphere>
  )
}

export function MoonGlobe({ position }: { position: [number, number, number] }) {
  return <MoonMesh position={position} />
}
