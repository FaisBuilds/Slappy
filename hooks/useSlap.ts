'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Motion } from '@capacitor/motion'
import { Howl } from 'howler'
import { createSoundPool } from '@/lib/sound-pool'
import { loadSoundManifest } from '@/lib/load-sounds'

const CALIBRATION_SAMPLE_COUNT = 40
const SLAP_COOLDOWN_MS = 400
const RESUME_STABILIZE_MS = 1500
const MIN_MAGNITUDE_THRESHOLD = 6
const THRESHOLD_MULTIPLIER = 4.5

function magnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z)
}

function median(values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function getAcceleration(event: {
  acceleration?: { x?: number | null; y?: number | null; z?: number | null }
  accelerationIncludingGravity?: {
    x?: number | null
    y?: number | null
    z?: number | null
  }
}) {
  const withGravity = event.accelerationIncludingGravity
  if (withGravity?.x != null) return withGravity

  return event.acceleration
}

type UseSlapOptions = {
  isEnabled?: boolean
  onSlap?: () => void
  onImpact?: () => void
}

export const useSlap = ({
  isEnabled = true,
  onSlap,
  onImpact,
}: UseSlapOptions = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [soundsReady, setSoundsReady] = useState(false)

  const cooldownRef = useRef(false)
  const listenerAddedRef = useRef(false)
  const isAppVisibleRef = useRef(true)
  const resumeStabilizationRef = useRef(false)

  const lastMagnitudeRef = useRef<number | null>(null)
  const calibrationDeltasRef = useRef<number[]>([])
  const magnitudeThresholdRef = useRef(MIN_MAGNITUDE_THRESHOLD)
  const isCalibratedRef = useRef(false)

  const onSlapRef = useRef(onSlap)
  const onImpactRef = useRef(onImpact)
  const isEnabledRef = useRef(isEnabled)

  useEffect(() => {
    onSlapRef.current = onSlap
  }, [onSlap])
  useEffect(() => {
    onImpactRef.current = onImpact
  }, [onImpact])
  useEffect(() => {
    isEnabledRef.current = isEnabled
  }, [isEnabled])

  const poolRef = useRef<ReturnType<typeof createSoundPool> | null>(null)
  const howlMapRef = useRef<Map<string, Howl>>(new Map())
  const soundPathsRef = useRef<string[]>([])

  const resetCalibration = useCallback(() => {
    calibrationDeltasRef.current = []
    lastMagnitudeRef.current = null
    magnitudeThresholdRef.current = MIN_MAGNITUDE_THRESHOLD
    isCalibratedRef.current = false
    setIsCalibrated(false)
  }, [])

  const finishCalibration = useCallback(() => {
    const deltas = calibrationDeltasRef.current
    if (deltas.length === 0) return

    const noiseFloor = median(deltas)
    magnitudeThresholdRef.current = Math.max(
      MIN_MAGNITUDE_THRESHOLD,
      noiseFloor * THRESHOLD_MULTIPLIER
    )

    isCalibratedRef.current = true
    setIsCalibrated(true)
  }, [])

  const recordMagnitudeSample = useCallback((currentMag: number) => {
    const lastMag = lastMagnitudeRef.current

    if (lastMag != null) {
      calibrationDeltasRef.current.push(
        Math.abs(currentMag - lastMag)
      )
    }

    lastMagnitudeRef.current = currentMag

    if (
      calibrationDeltasRef.current.length >= CALIBRATION_SAMPLE_COUNT
    ) {
      finishCalibration()
    }
  }, [finishCalibration])

  const playNextSound = useCallback(() => {
    if (!poolRef.current) return

    const src = poolRef.current.getNext()
    const howl = howlMapRef.current.get(src)
    if (!howl) return

    howl.play()
  }, [])

  const fireSlapRef = useRef<() => void>(() => {})

  useEffect(() => {
    fireSlapRef.current = () => {
      if (!isEnabledRef.current) return
      if (cooldownRef.current) return

      cooldownRef.current = true

      playNextSound()
      onImpactRef.current?.()
      onSlapRef.current?.()

      window.setTimeout(() => {
        cooldownRef.current = false
      }, SLAP_COOLDOWN_MS)
    }
  }, [playNextSound])

  const registerManualSlap = useCallback(() => {
    fireSlapRef.current()
  }, [])

  useEffect(() => {
    let cancelled = false
    const howls = howlMapRef.current

    loadSoundManifest()
      .then((paths) => {
        if (cancelled) return

        if (paths.length === 0) {
          console.warn('No .mp3 files in public/sounds/')
          return
        }

        soundPathsRef.current = paths
        poolRef.current = createSoundPool(paths)

        paths.forEach((src) => {
          if (howlMapRef.current.has(src)) return

          const howl = new Howl({
            src: [src],
            preload: true,
            html5: false,
            onplayerror: (_id, error) => {
              console.warn('WebAudio play failed, retrying:', src, error)
              howl.once('unlock', () => howl.play())
            },
          })

          howlMapRef.current.set(src, howl)
        })

        setSoundsReady(true)
      })
      .catch((error) => {
        console.error('Sound manifest load failed:', error)
      })

    return () => {
      cancelled = true
      howls.forEach((h) => {
        h.stop()
        h.unload()
      })
      howls.clear()
      poolRef.current = null
    }
  }, [])

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
        resetCalibration()
        window.setTimeout(() => {
          resumeStabilizationRef.current = false
        }, RESUME_STABILIZE_MS)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const startListening = async () => {
      try {
        listener = await Motion.addListener('accel', (event) => {
          if (!isAppVisibleRef.current) return
          if (resumeStabilizationRef.current) return
          if (!isEnabledRef.current) return
          if (cooldownRef.current) return

          const acc = getAcceleration(event)
          if (!acc) return

          const x = acc.x ?? 0
          const y = acc.y ?? 0
          const z = acc.z ?? 0
          const currentMag = magnitude(x, y, z)

          if (!isCalibratedRef.current) {
            recordMagnitudeSample(currentMag)
            return
          }

          const lastMag = lastMagnitudeRef.current ?? currentMag
          const forceDelta = Math.abs(currentMag - lastMag)
          lastMagnitudeRef.current = currentMag

          if (forceDelta >= magnitudeThresholdRef.current) {
            fireSlapRef.current()
          }
        })

        resetCalibration()
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
  }, [recordMagnitudeSample, resetCalibration])

  return {
    isListening,
    isCalibrated,
    soundsReady,
    registerManualSlap,
  }
}
