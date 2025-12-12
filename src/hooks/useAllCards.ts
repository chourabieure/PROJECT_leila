'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Card, Rarity } from '@/utils/types'

interface UseAllCardsReturn {
  // State
  allCards: Card[]
  isLoading: boolean
  error: string | null

  // Filters
  rarityFilter: Rarity | 'all'
  setRarityFilter: (rarity: Rarity | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Derived data
  filteredCards: Card[]

  // Actions
  refresh: () => Promise<void>
}

export function useAllCards(): UseAllCardsReturn {
  const [allCards, setAllCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all cards with attacks
  const fetchAllCards = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*, attacks:attacks(*)')
        .order('pokedex_number', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setAllCards(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter cards based on current filters
  const filteredCards = allCards.filter((card) => {
    // Rarity filter
    if (rarityFilter !== 'all' && card.rarity !== rarityFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return card.name.toLowerCase().includes(query) || card.pokedex_number?.toLowerCase().includes(query)
    }

    return true
  })

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllCards()
  }, [fetchAllCards])

  return {
    allCards,
    isLoading,
    error,
    rarityFilter,
    setRarityFilter,
    searchQuery,
    setSearchQuery,
    filteredCards,
    refresh: fetchAllCards,
  }
}
