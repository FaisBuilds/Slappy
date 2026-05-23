'use client'

import { Howl } from 'howler'
import { useEffect, useRef, useState } from 'react'
import { createSoundPool } from '@/lib/sound-pool'

type UseSoundProps = {
  sounds: string[]
}

export const useSound = ({ sounds }: UseSoundProps) => {
  const poolRef = useRef<ReturnType<typeof createSoundPool> | null>(null)
  const howlMapRef = useRef<Map<string, Howl>>(new Map())
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!sounds || sounds.length === 0) return

    poolRef.current = createSoundPool(sounds)

    sounds.forEach((src) => {
      if (!howlMapRef.current.has(src)) {
        const howl = new Howl({
          src: [src],
          preload: true,
          // html5: false uses standard Web Audio API buffers. 
          // Crucial for low-latency multi-trigger reactions inside Capacitor wrappers.
          html5: false, 
          onplay: () => setIsPlaying(true),
          onend: () => setIsPlaying(false),
          onplayerror: () => setIsPlaying(false),
        })

        howlMapRef.current.set(src, howl)
      }
    })

    return () => {
      howlMapRef.current.forEach((sound) => {
        sound.stop()
        sound.unload()
      })
      howlMapRef.current.clear()
    }
  }, [sounds])

  const playNext = () => {
    if (!poolRef.current) return

    const next = poolRef.current.getNext()
    const sound = howlMapRef.current.get(next)

    if (!sound) return

    // Allow sounds to overlap dynamically on concurrent triggers
    sound.play()
  }

  return {
    playNext,
    isPlaying,
  }
}