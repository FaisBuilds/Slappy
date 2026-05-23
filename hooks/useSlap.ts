'use client'

import { useEffect, useRef, useState } from 'react'
import { Motion } from '@capacitor/motion'

type UseSlapOptions = {
  onSlap?: () => void
}

export const useSlap = ({ onSlap }: UseSlapOptions = {}) => {
  const [slapCount, setSlapCount] = useState(0)
  const [isListening, setIsListening] = useState(false)

  const cooldownRef = useRef(false)
  const listenerAddedRef = useRef(false)
  const isAppVisibleRef = useRef(true)
  const resumeStabilizationRef = useRef(false)
  
  // Use a mutable ref to hold the callback so that changing it 
  // doesn't tear down and rebuild the hardware motion event listener
  const onSlapRef = useRef(onSlap)
  useEffect(() => {
    onSlapRef.current = onSlap
  }, [onSlap])

  useEffect(() => {
    if (listenerAddedRef.current) return
    listenerAddedRef.current = true

    let listener: { remove: () => Promise<void> } | null = null

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isAppVisibleRef.current = false
      } else {
        isAppVisibleRef.current = true
        resumeStabilizationRef.current = true
        setTimeout(() => {
          resumeStabilizationRef.current = false
        }, 1500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const startListening = async () => {
      try {
        listener = await Motion.addListener('accel', (event) => {
          const acc =
            event.acceleration?.x != null
              ? event.acceleration
              : event.accelerationIncludingGravity

          if (!acc) return
          if (!isAppVisibleRef.current) return
          if (resumeStabilizationRef.current) return
          if (cooldownRef.current) return

          const x = acc.x ?? 0
          const y = acc.y ?? 0
          const z = acc.z ?? 0

          const force = Math.sqrt(x * x + y * y + z * z)

          // Unified trigger condition (No soft/medium/hard variations)
          if (force > 5) {
            cooldownRef.current = true
            setSlapCount((prev) => prev + 1)

            // Safely reference the current callback without closure stale state
            onSlapRef.current?.()

            setTimeout(() => {
              cooldownRef.current = false
            }, 400)
          }
        })

        setIsListening(true)
      } catch (error) {
        console.error('Motion listener error:', error)
        setIsListening(false)
      }
    }

    startListening()

    return () => {
      listener?.remove()
      listenerAddedRef.current = false
      setIsListening(false)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty array ensures this setup runs exactly once on mount

  return {
    isListening,
    slapCount,
  }
}