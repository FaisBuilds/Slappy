'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createPlayer,
  getPlayer,
  incrementSlaps,
} from '@/lib/players'

const STORAGE_KEY = 'slap_username'
const PENDING_KEY = 'slap_pending_sync'
const CACHED_TOTAL_KEY = 'slap_cached_total'

const getPendingCount = () => {
  const pending = Number.parseInt(
    localStorage.getItem(PENDING_KEY) ?? '0',
    10
  )
  return Number.isFinite(pending) && pending > 0 ? pending : 0
}

export const usePlayer = () => {
  const [username, setUsername] = useState('')
  const [totalSlaps, setTotalSlaps] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)
  const syncInProgressRef = useRef(false)

  const syncPending = useCallback(async (playerName: string) => {
    if (syncInProgressRef.current) return

    syncInProgressRef.current = true
    try {
      let pending = getPendingCount()
      while (pending > 0) {
        const synced = await incrementSlaps(playerName)
        if (!synced) break

        pending -= 1
        localStorage.setItem(PENDING_KEY, String(pending))
      }
    } finally {
      syncInProgressRef.current = false
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const storedUsername =
          localStorage.getItem(STORAGE_KEY)

        if (!storedUsername) {
          setIsNewUser(true)
          return
        }

        setUsername(storedUsername)

        const player = await getPlayer(storedUsername)
        const pending = getPendingCount()

        if (player) {
          const total = player.total_slaps + pending
          localStorage.setItem(CACHED_TOTAL_KEY, String(player.total_slaps))
          setTotalSlaps(total)
          void syncPending(storedUsername)
        } else {
          const cachedTotal = Number.parseInt(
            localStorage.getItem(CACHED_TOTAL_KEY) ?? '0',
            10
          )
          setTotalSlaps(
            (Number.isFinite(cachedTotal) ? cachedTotal : 0) + pending
          )
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [syncPending])

  const createAccount = async (
    newUsername: string
  ): Promise<boolean> => {
    try {
      const cleanUsername = newUsername.trim()

      if (!cleanUsername) {
        return false
      }

      const player = await createPlayer(cleanUsername)

      if (!player) {
        return false
      }

      localStorage.setItem(
        STORAGE_KEY,
        cleanUsername
      )
      localStorage.setItem(PENDING_KEY, '0')
      localStorage.setItem(CACHED_TOTAL_KEY, String(player.total_slaps))

      setUsername(cleanUsername)
      setTotalSlaps(player.total_slaps)
      setIsNewUser(false)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const addSlap = useCallback(() => {
    if (!username) return

    const pending = getPendingCount() + 1
    localStorage.setItem(PENDING_KEY, String(pending))
    setTotalSlaps((prev) => prev + 1)
    void syncPending(username)
  }, [syncPending, username])

  return {
    username,
    totalSlaps,
    isNewUser,
    createAccount,
    addSlap,
  }
}