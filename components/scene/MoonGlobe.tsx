'use client'

import { useTexture } from '@react-three/drei'
import { Sphere } from '@react-three/drei'

// Moon radius = 1737 km; at SCALE=1/50000 → 0.0347 scene units
// Compressed: 0.273 (proportional to compressed Earth of 1.0)
export const MOON_SCENE_RADIUS_TRUE = 0.0347
export const MOON_SCENE_RADIUS_COMPRESSED = 0.273

interface Props {
  position: [number, number, number]
  trueScale?: boolean
}

function MoonMesh({ position, radius }: { position: [number, number, number]; radius: number }) {
  const texture = useTexture('/textures/moon.jpg')
  return (
    <Sphere position={position} args={[radius, 32, 32]}>
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
    </Sphere>
  )
}

export function MoonGlobe({ position, trueScale = false }: Props) {
  const radius = trueScale ? MOON_SCENE_RADIUS_TRUE : MOON_SCENE_RADIUS_COMPRESSED
  return <MoonMesh position={position} radius={radius} />
}
