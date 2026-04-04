'use client'

import { Sphere } from '@react-three/drei'

interface Props {
  position: [number, number, number]
}

export function MoonGlobe({ position }: Props) {
  return (
    <Sphere position={position} args={[0.273, 32, 32]}>
      <meshStandardMaterial color="#a0a0a0" roughness={0.9} metalness={0} />
    </Sphere>
  )
}
