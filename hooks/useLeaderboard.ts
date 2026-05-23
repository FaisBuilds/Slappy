'use client'

import { useCallback, useEffect, useState } from 'react'
import { getLeaderboard, Player } from '@/lib/players'

type UseLeaderboardReturn = {
  players: Player[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useLeaderboard =
  (): UseLeaderboardReturn => {
    const [players, setPlayers] = useState<Player[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(
      null
    )

    const fetchData = useCallback(async () => {
      try {
        setError(null)
        const data = await getLeaderboard()
        setPlayers(data)
      } catch (err) {
        setError('Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }, [])

    useEffect(() => {
      fetchData()

      const interval = setInterval(() => {
        fetchData()
      }, 30000) // 30s auto refresh

      return () => clearInterval(interval)
    }, [fetchData])

    return {
      players,
      isLoading,
      error,
      refetch: fetchData,
    }
  }