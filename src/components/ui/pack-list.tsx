import { animated, useSpring, useSprings } from '@react-spring/three'
import { useTexture } from '@react-three/drei'
import { useDrag } from '@use-gesture/react'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Pack } from './pack'

const RADIUS = 2
const SCALE = {
  INIT: 1,
  ROTATED: 1.08,
}
const INIT_ROTATION = [0, 0, 0]

const PACK_COUNT = 10
const ANGLE_STEP = (2 * Math.PI) / PACK_COUNT
const VELOCITY_INTENSITY = 0.005
const CARD_SIZE = {
  WIDTH: 0.315 * 1.5,
  HEIGHT: 0.44 * 1.5,
}

// width: '315px',
// height: '440px',

const geometry = new THREE.PlaneGeometry(CARD_SIZE.WIDTH, CARD_SIZE.HEIGHT)

const snapToClosest = (angle: number) => {
  return Math.round(angle / ANGLE_STEP) * ANGLE_STEP
}

export const PackList = ({ onPackOpen }: { onPackOpen?: (packIndex: number) => void }) => {
  // Load the card back texture
  const texture = useTexture('/cardBack.png')
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  })

  const [isInit, setIsInit] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  // Store the rotation angle at drag start
  const dragStartAngle = useRef(0)

  const [{ rotation, scale }, set] = useSpring(() => ({
    rotation: INIT_ROTATION,
    scale: SCALE.INIT,
    config: { mass: 1, tension: 150, friction: 40 },
  }))

  const [springs, setPacks] = useSprings(PACK_COUNT, (i) => {
    const angle = ANGLE_STEP * i
    const x = RADIUS * Math.sin(angle)
    const z = RADIUS * Math.cos(angle)
    return {
      from: {
        rotation: [0, angle, 0],
        position: [x / 10, 0, z / 10],
      },
      to: {
        rotation: [0, angle, 0],
        position: [x, 0, z],
      },
      delay: i * 100,
      onRest: () => {
        if (i === PACK_COUNT - 1) {
          setIsInit(false)
        }
      },
    }
  })

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], down, first, tap }) => {
      if (tap) {
        return
      }

      // Store the starting angle when drag begins
      if (first) {
        dragStartAngle.current = rotation.get()[1]
      }

      setIsDragging(true)

      // Convert horizontal pixel movement to rotation angle
      // Negative because dragging right should rotate left (show next pack)
      const dragAngle = -mx * 0.005
      const yAngle = dragStartAngle.current + dragAngle

      if (down) {
        set({
          rotation: [0, yAngle, 0],
          scale: SCALE.ROTATED,
          config: { mass: 0.5, tension: 50, friction: 20 },
        })
      } else {
        // Add inertia based on velocity when released
        const inertia = -dx * vx * VELOCITY_INTENSITY
        const finalAngle = yAngle + inertia
        const snappedY = snapToClosest(finalAngle)

        set({
          rotation: [0, snappedY, 0],
          scale: SCALE.INIT,
          config: { mass: 1, tension: 180, friction: 26 },
        })

        // Update active index
        // When group rotates by angle θ, pack at local angle -θ comes to front
        const steps = Math.round(snappedY / ANGLE_STEP)
        const newActiveIndex = (PACK_COUNT - (steps % PACK_COUNT) + PACK_COUNT) % PACK_COUNT
        setActiveIndex(newActiveIndex)
        setIsDragging(false)
      }
    },
    {
      filterTaps: true,
      delay: 100,
      enabled: !isInit && !isSelected,
    },
  )

  const handlePackClick = () => {
    console.log('Pack clicked! Index:', activeIndex)
    setIsSelected(true)
    setPacks.start((i) => {
      if (i === activeIndex) {
        return {}
      }
      const prevPosition = springs[i].position.get()
      return {
        position: [prevPosition[0], -10, prevPosition[2]],
        config: {
          mass: 1,
          tension: 150,
        },
      }
    })
    onPackOpen?.(activeIndex)
  }

  const handleClickBack = () => {
    if (!isSelected) return
    console.log('CLIOCK BACK')
    setIsSelected(false)
    setPacks.start((i) => {
      const angle = ANGLE_STEP * i
      const x = RADIUS * Math.sin(angle)
      const z = RADIUS * Math.cos(angle)
      return {
        position: [x, 0, z],
        config: {
          mass: 1,
          tension: 150,
        },
      }
    })
  }

  return (
    <>
      <mesh {...bind()} onClick={handleClickBack} position={[0, 0, 0]} scale={[5, 5, 1]} visible={false}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <animated.group
        position={[0, -CARD_SIZE.HEIGHT / 4, 0]}
        scale={scale}
        rotation={rotation as unknown as THREE.Euler}
      >
        {springs.map((item, idx) => {
          const isClickable = !isInit && !isDragging && activeIndex === idx
          return (
            <animated.group
              key={idx}
              rotation={item.rotation as unknown as THREE.Euler}
              position={item.position as unknown as THREE.Vector3}
            >
              <Pack
                geometry={geometry}
                material={material}
                isClickable={isClickable}
                isSelected={isSelected && activeIndex === idx}
                onClick={handlePackClick}
              />
            </animated.group>
          )
        })}
      </animated.group>
    </>
  )
}
