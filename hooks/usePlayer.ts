'use client'

import { useEffect, useState } from 'react'
import {
  createPlayer,
  getPlayer,
  incrementSlaps,
} from '@/lib/players'

const STORAGE_KEY = 'slap_username'

export const usePlayer = () => {
  const [username, setUsername] = useState('')
  const [totalSlaps, setTotalSlaps] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)

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

        if (player) {
          setTotalSlaps(player.total_slaps)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

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

      setUsername(cleanUsername)
      setTotalSlaps(player.total_slaps)
      setIsNewUser(false)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const addSlap = () => {
    if (!username) return

    setTotalSlaps((prev) => prev + 1)

    incrementSlaps(username).catch(() => {
      // fail silently offline
    })
  }

  return {
    username,
    totalSlaps,
    isNewUser,
    createAccount,
    addSlap,
  }
}