'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserCollectionItem, CollectionStats, Rarity, Attack } from '@/utils/types'

// Extended collection item with attacks
export interface UserCollectionItemWithAttacks extends UserCollectionItem {
  attacks?: Attack[]
}

interface UseInventoryReturn {
  // State
  collection: UserCollectionItemWithAttacks[]
  stats: CollectionStats | null
  isLoading: boolean
  error: string | null

  // Filters
  rarityFilter: Rarity | 'all'
  setRarityFilter: (rarity: Rarity | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Derived data
  filteredCollection: UserCollectionItemWithAttacks[]

  // Actions
  refresh: () => Promise<void>
}

export function useInventory(userId: string | undefined): UseInventoryReturn {
  const [collection, setCollection] = useState<UserCollectionItemWithAttacks[]>([])
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch user's collection
  const fetchCollection = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch collection using the view
      const { data: collectionData, error: collectionError } = await supabase
        .from('user_collection')
        .select('*')
        .eq('user_id', userId)
        .order('last_obtained_at', { ascending: false })

      if (collectionError) {
        setError(collectionError.message)
        return
      }

      // Fetch attacks for all cards in the collection
      const cardIds = (collectionData || []).map((item) => item.card_id)
      let attacksMap: Record<number, Attack[]> = {}

      if (cardIds.length > 0) {
        const { data: attacksData, error: attacksError } = await supabase
          .from('attacks')
          .select('*')
          .in('card_id', cardIds)

        if (attacksError) {
          console.error('Error fetching attacks:', attacksError)
        } else if (attacksData) {
          // Group attacks by card_id
          attacksMap = attacksData.reduce(
            (acc, attack) => {
              if (!acc[attack.card_id]) {
                acc[attack.card_id] = []
              }
              acc[attack.card_id].push(attack)
              return acc
            },
            {} as Record<number, Attack[]>,
          )
        }
      }

      // Merge attacks into collection items
      const collectionWithAttacks: UserCollectionItemWithAttacks[] = (collectionData || []).map((item) => ({
        ...item,
        attacks: attacksMap[item.card_id] || [],
      }))

      setCollection(collectionWithAttacks)

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_collection_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching stats:', statsError)
      }

      if (statsData) {
        setStats(statsData)
      } else {
        // Default stats for users with no cards
        const { count: totalCards } = await supabase.from('cards').select('*', { count: 'exact', head: true })

        setStats({
          user_id: userId,
          unique_cards: 0,
          total_cards: 0,
          total_available: totalCards || 0,
          completion_percentage: 0,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Filter collection based on current filters
  const filteredCollection = collection.filter((item) => {
    // Rarity filter
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(query) || item.pokedex_number?.toLowerCase().includes(query)
    }

    return true
  })

  // Auto-fetch on mount and when userId changes
  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  return {
    collection,
    stats,
    isLoading,
    error,
    rarityFilter,
    setRarityFilter,
    searchQuery,
    setSearchQuery,
    filteredCollection,
    refresh: fetchCollection,
  }
}
