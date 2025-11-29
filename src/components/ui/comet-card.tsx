'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react'
import { cn } from '@/lib/utils'

export const CometCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  className,
  containerClassName,
  children,
}: {
  rotateDepth?: number
  translateDepth?: number
  className?: string
  containerClassName?: string
  children: React.ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [gyroEnabled, setGyroEnabled] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`-${rotateDepth}deg`, `${rotateDepth}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${rotateDepth}deg`, `-${rotateDepth}deg`])

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [`-${translateDepth}px`, `${translateDepth}px`])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [`${translateDepth}px`, `-${translateDepth}px`])

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`

  // Handle gyroscope orientation
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event

      if (beta === null || gamma === null) return

      // Normalize values to -0.5 to 0.5 range
      // gamma: -45 to 45 maps to -0.5 to 0.5
      // beta: 0 to 90 (portrait, tilting forward/back) maps to -0.5 to 0.5
      const normalizedX = Math.max(-0.5, Math.min(0.5, gamma / 45))
      const normalizedY = Math.max(-0.5, Math.min(0.5, (beta - 45) / 45))

      x.set(normalizedX)
      y.set(normalizedY)
    },
    [x, y],
  )

  // Request permission for iOS 13+ devices
  const requestGyroPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission()
        if (permission === 'granted') {
          setGyroEnabled(true)
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } catch {
        // Permission denied or error
      }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // Non-iOS devices or older iOS
      setGyroEnabled(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  // Auto-enable gyro on non-iOS devices
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (!isMobile) return

    // Check if permission API exists (iOS 13+)
    const hasPermissionAPI =
      typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent

    if (hasPermissionAPI) {
      // iOS requires user gesture to request permission - handled by touch
      return
    }

    // For Android and other devices, try to enable directly
    if (typeof DeviceOrientationEvent !== 'undefined') {
      setGyroEnabled(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || gyroEnabled) return

    const rect = ref.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    if (gyroEnabled) return
    x.set(0)
    y.set(0)
  }

  // Handle touch to request gyro permission on iOS
  const handleTouchStart = () => {
    if (!gyroEnabled) {
      requestGyroPermission()
    }
  }

  return (
    <div className={cn('perspective-distant transform-3d', className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          boxShadow:
            'rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px',
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{
          scale: 1.05,
          z: 50,
          transition: { duration: 0.2 },
        }}
        className={cn('relative rounded-4xl', containerClassName)}
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-4xl mix-blend-overlay"
          style={{
            background: glareBackground,
            opacity: 0.6,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  )
}
