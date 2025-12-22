'use client'

import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { PackList } from './pack-list'

interface SceneProps {
  onPackOpen?: (packIndex: number) => void
}

export const Scene = ({ onPackOpen }: SceneProps) => {
  return (
    <Canvas className="touch-none">
      <PerspectiveCamera position={[0, 0, 3]} fov={100} makeDefault />
      <Suspense fallback={null}>
        <PackList onPackOpen={onPackOpen} />
      </Suspense>
      <Environment background preset="dawn" blur={0.8} />
    </Canvas>
  )
}
