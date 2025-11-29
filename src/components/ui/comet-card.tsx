'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react'
import { cn } from '@/lib/utils'

export const CometCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  className,
  children,
}: {
  rotateDepth?: number
  translateDepth?: number
  className?: string
  children: React.ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [debugInfo, setDebugInfo] = useState({ beta: 0, gamma: 0, x: 0, y: 0 })
  const [debugLog, setDebugLog] = useState<string[]>([])
  const [hasPermissionAPI, setHasPermissionAPI] = useState(false)

  const addLog = useCallback((msg: string) => {
    setDebugLog((prev) => [...prev.slice(-5), msg])
  }, [])

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
      // beta: front-to-back tilt (-180 to 180), gamma: left-to-right tilt (-90 to 90)
      const { beta, gamma } = event

      if (beta === null || gamma === null) return

      // Normalize values to -0.5 to 0.5 range
      // Assuming device is held at ~45 degrees, adjust beta accordingly
      // gamma: -45 to 45 maps to -0.5 to 0.5
      // beta: 0 to 90 (portrait, tilting forward/back) maps to -0.5 to 0.5
      const normalizedX = Math.max(-0.5, Math.min(0.5, gamma / 45))
      const normalizedY = Math.max(-0.5, Math.min(0.5, (beta - 45) / 45))

      x.set(normalizedX)
      y.set(normalizedY)

      setDebugInfo({ beta, gamma, x: normalizedX, y: normalizedY })
    },
    [x, y],
  )

  // Request permission for iOS 13+ devices
  const requestGyroPermission = useCallback(async () => {
    addLog('requestGyroPermission called')
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        addLog('Calling requestPermission()...')
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission()
        addLog(`Permission result: ${permission}`)
        if (permission === 'granted') {
          setGyroEnabled(true)
          setPermissionDenied(false)
          window.addEventListener('deviceorientation', handleOrientation)
          addLog('Gyro enabled!')
        } else {
          setPermissionDenied(true)
          addLog(`Permission denied: ${permission}`)
        }
      } catch (err) {
        setPermissionDenied(true)
        addLog(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // Non-iOS devices or older iOS
      addLog('No permission API, enabling directly')
      setGyroEnabled(true)
      window.addEventListener('deviceorientation', handleOrientation)
    } else {
      addLog('DeviceOrientationEvent not available')
    }
  }, [handleOrientation, addLog])

  // Auto-enable gyro on non-iOS devices, or setup touch to request permission on iOS
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    addLog(`isMobile: ${isMobile}`)

    // Check if permission API exists (iOS 13+)
    const hasAPI = typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent
    setHasPermissionAPI(hasAPI)
    addLog(`hasPermissionAPI: ${hasAPI}`)

    if (!isMobile) {
      addLog('Not mobile, skipping gyro setup')
      return
    }

    if (hasAPI) {
      // iOS requires user gesture to request permission - handled by touch/button
      addLog('iOS detected, waiting for user gesture')
      return
    }

    // For Android and other devices, try to enable directly
    if (typeof DeviceOrientationEvent !== 'undefined') {
      addLog('Android/other, enabling gyro directly')
      setGyroEnabled(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation, addLog])

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
    addLog('Touch detected')
    if (!gyroEnabled) {
      requestGyroPermission()
    }
  }

  // Manual retry (resets denied state)
  const handleRetryPermission = () => {
    addLog('Manual retry clicked')
    setPermissionDenied(false)
    requestGyroPermission()
  }

  return (
    <>
      {/* Debug overlay */}
      <div className="fixed left-4 top-4 z-[9999] max-w-[90vw] rounded-lg bg-black/90 p-3 font-mono text-xs text-white">
        <div className="mb-2 font-bold text-green-400">🔧 Gyro Debug</div>
        <div>Gyro enabled: {gyroEnabled ? '✅ YES' : '❌ NO'}</div>
        <div>Permission denied: {permissionDenied ? '🚫 YES' : '✅ NO'}</div>
        <div>Has iOS permission API: {hasPermissionAPI ? '✅ YES' : '❌ NO'}</div>

        <div className="mt-2 border-t border-white/20 pt-2">
          <div>Beta (raw): {debugInfo.beta.toFixed(1)}°</div>
          <div>Gamma (raw): {debugInfo.gamma.toFixed(1)}°</div>
        </div>
        <div className="mt-2 border-t border-white/20 pt-2">
          <div>X (normalized): {debugInfo.x.toFixed(3)}</div>
          <div>Y (normalized): {debugInfo.y.toFixed(3)}</div>
        </div>

        {/* Log messages */}
        <div className="mt-2 max-h-24 overflow-y-auto border-t border-white/20 pt-2">
          <div className="mb-1 text-gray-400">Log:</div>
          {debugLog.map((log, i) => (
            <div key={i} className="text-gray-300">
              {log}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleRetryPermission}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white active:bg-blue-700"
          >
            🔄 Request Permission
          </button>
        </div>

        {permissionDenied && (
          <div className="mt-2 rounded bg-red-900/50 p-2 text-red-300">
            <div className="font-bold">Permission denied!</div>
            <div className="mt-1 text-[10px]">
              Go to Settings → Safari → Advanced → Website Data, delete this site, then reload.
            </div>
          </div>
        )}
      </div>

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
          className="relative rounded-4xl"
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
    </>
  )
}
