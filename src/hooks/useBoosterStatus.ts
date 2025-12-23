'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BoosterStatus } from '@/utils/types'
import { USER_ID } from '@/utils/constants'

interface UseBoosterStatusReturn {
  // State
  status: BoosterStatus | null
  isLoading: boolean
  error: string | null

  // Derived state
  canOpenBooster: boolean
  boostersOpened: number
  boostersRemaining: number
  lastOpenedAt: Date | null

  // Time until reset
  timeUntilReset: string

  // Actions
  refresh: () => Promise<void>
}

// Calculate time until midnight (daily reset)
function getTimeUntilMidnight(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)

  const diff = midnight.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function useBoosterStatus(): UseBoosterStatusReturn {
  const [status, setStatus] = useState<BoosterStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilMidnight())

  // Fetch booster status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('user_booster_status')
        .select('*')
        .eq('user_id', USER_ID)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        setError(fetchError.message)
        return
      }

      if (data) {
        setStatus(data)
      } else {
        // Default status for new users or new day
        setStatus({
          user_id: USER_ID,
          username: '',
          boosters_opened_today: 0,
          boosters_remaining: 5,
          last_opened_at: null,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilMidnight())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Auto-fetch on mount and when userId changes
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Derived values
  const boostersOpened = status?.boosters_opened_today ?? 0
  const boostersRemaining = status?.boosters_remaining ?? 5
  const canOpenBooster = boostersRemaining > 0
  const lastOpenedAt = status?.last_opened_at ? new Date(status.last_opened_at) : null

  return {
    status,
    isLoading,
    error,
    canOpenBooster,
    boostersOpened,
    boostersRemaining,
    lastOpenedAt,
    timeUntilReset,
    refresh: fetchStatus,
  }
}
