'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
}

export function OrionMarker({ position }: Props) {
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + 0.3 * Math.sin(t * 2))
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.15 + 0.1 * Math.sin(t * 2)
    }
  })

  return (
    <group position={position}>
      {/* Core marker — pointer events for hover detection */}
      <mesh
        ref={coreRef}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerLeave={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.012, 0]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
      </mesh>

      {/* Pulsing glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#00e5ff" transparent opacity={0.2} />
      </mesh>

      {/* Label — only visible on hover */}
      {hovered && (
        <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#00e5ff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(0,229,255,0.5)',
            marginTop: 14,
          }}>
            Orion
          </div>
        </Html>
      )}
    </group>
  )
}
