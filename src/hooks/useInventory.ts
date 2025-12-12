'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  UserCollectionItem, 
  CollectionStats,
  Rarity 
} from '@/utils/types'

interface UseInventoryReturn {
  // State
  collection: UserCollectionItem[]
  stats: CollectionStats | null
  isLoading: boolean
  error: string | null
  
  // Filters
  rarityFilter: Rarity | 'all'
  setRarityFilter: (rarity: Rarity | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Derived data
  filteredCollection: UserCollectionItem[]
  
  // Actions
  refresh: () => Promise<void>
}

export function useInventory(userId: string | undefined): UseInventoryReturn {
  const [collection, setCollection] = useState<UserCollectionItem[]>([])
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

      setCollection(collectionData || [])

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
        const { count: totalCards } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })

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
  const filteredCollection = collection.filter(item => {
    // Rarity filter
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) {
      return false
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        item.pokedex_number?.toLowerCase().includes(query)
      )
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

