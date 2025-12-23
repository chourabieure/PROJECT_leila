'use client'

import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { StrictMode, Suspense } from 'react'
import { PackList } from './pack-list'

interface SceneProps {
  onPackOpen?: (packIndex: number) => void
}

export const Scene = ({ onPackOpen, ref }: SceneProps & { ref?: React.RefObject<{ handleClickBack: () => void }> }) => {
  return (
    <StrictMode>
      <Canvas className="touch-none">
        <PerspectiveCamera position={[0, 0, 3]} fov={100} makeDefault />
        <Suspense fallback={null}>
          <PackList onPackOpen={onPackOpen} ref={ref} />
        </Suspense>
        <Environment background preset="dawn" blur={0.8} />
      </Canvas>
    </StrictMode>
  )
}
