import supabase from './supabase'

export type Player = {
  id: string
  username: string
  total_slaps: number
  updated_at: string
}

export async function createPlayer(
  username: string
): Promise<Player | null> {
  try {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('players')
      .insert({
        username,
        total_slaps: 0,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return null
    }

    return data as Player
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getPlayer(
  username: string
): Promise<Player | null> {
  try {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      return null
    }

    return data as Player
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function incrementSlaps(
  username: string
): Promise<boolean> {
  try {
    if (!supabase) return false

    const { error } = await supabase.rpc('increment_slaps', {
      target_username: username,
    })

    if (error) {
      console.error('increment_slaps RPC error:', error.message, error)
      return false
    }

    return true
  } catch (error) {
    console.error('increment_slaps exception:', error)
    return false
  }
}

export async function getLeaderboard(): Promise<Player[]> {
  try {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_slaps', { ascending: false })
      .limit(100)

    if (error || !data) {
      return []
    }

    return data as Player[]
  } catch (error) {
    console.error(error)
    return []
  }
}