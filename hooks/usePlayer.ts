'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'slapdroid_total_slaps'

export const usePlayer = () => {
  const [totalSlaps, setTotalSlaps] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const totalSlapsRef = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedTotal = Number(localStorage.getItem(STORAGE_KEY))
      const total = Number.isSafeInteger(storedTotal) && storedTotal >= 0
        ? storedTotal
        : 0

      totalSlapsRef.current = total
      setTotalSlaps(total)
      setIsLoaded(true)
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  const addSlap = useCallback(() => {
    if (!isLoaded) return

    const nextTotal = totalSlapsRef.current + 1
    totalSlapsRef.current = nextTotal
    setTotalSlaps(nextTotal)
    localStorage.setItem(STORAGE_KEY, String(nextTotal))
  }, [isLoaded])

  return {
    totalSlaps,
    isLoaded,
    addSlap,
  }
}