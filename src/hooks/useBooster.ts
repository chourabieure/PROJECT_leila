'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { BoosterCardFull, Card } from '@/utils/types'

interface UseBoosterReturn {
  // State
  isOpening: boolean
  cards: BoosterCardFull[]
  error: string | null
  boostersRemaining: number

  // Actions
  openBooster: () => Promise<BoosterCardFull[] | null>
  resetCards: () => void
  refreshStatus: () => Promise<void>
}

export function useBooster(userId: string | undefined): UseBoosterReturn {
  const [isOpening, setIsOpening] = useState(false)
  const [cards, setCards] = useState<BoosterCardFull[]>([])
  const [error, setError] = useState<string | null>(null)
  const [boostersRemaining, setBoostersRemaining] = useState(3)

  // Fetch current booster status
  const refreshStatus = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error: fetchError } = await supabase
        .from('user_booster_status')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching booster status:', fetchError)
        return
      }

      if (data) {
        setBoostersRemaining(data.boosters_remaining)
      } else {
        // No record means user hasn't opened any boosters today
        setBoostersRemaining(3)
      }
    } catch (err) {
      console.error('Error refreshing status:', err)
    }
  }, [userId])

  // Open a booster pack
  const openBooster = useCallback(async (): Promise<BoosterCardFull[] | null> => {
    if (!userId) {
      setError('Utilisateur non authentifié')
      return null
    }

    if (boostersRemaining <= 0) {
      setError("Plus de boosters disponibles aujourd'hui")
      return null
    }

    setIsOpening(true)
    setError(null)
    setCards([])

    try {
      // Call the database function to open a booster
      const { data: boosterCards, error: boosterError } = await supabase.rpc('open_booster', { p_user_id: userId })

      if (boosterError) {
        // Check if it's the daily limit error
        if (boosterError.message.includes('Daily booster limit reached')) {
          setError('Tu as atteint ta limite quotidienne de 3 boosters !')
          setBoostersRemaining(0)
        } else {
          setError(boosterError.message)
        }
        return null
      }

      if (!boosterCards || boosterCards.length === 0) {
        setError('Aucune carte reçue du booster')
        return null
      }

      // The function returns out_card_id, out_card_name, out_card_rarity, out_card_image_url, out_is_new
      // Fetch full card details with attacks for each card obtained
      const cardIds = boosterCards.map((c: { out_card_id: number }) => c.out_card_id)
      const { data: fullCards, error: cardsError } = await supabase
        .from('cards')
        .select('*, attacks:attacks(*)')
        .in('id', cardIds)

      if (cardsError) {
        setError('Erreur lors de la récupération des détails des cartes')
        return null
      }

      // Merge card details with is_new flag
      const cardsWithNew: BoosterCardFull[] = boosterCards.map((bc: { out_card_id: number; out_is_new: boolean }) => {
        const card = fullCards?.find((c: Card) => c.id === bc.out_card_id)
        return {
          ...card,
          is_new: bc.out_is_new,
        } as BoosterCardFull
      })

      setCards(cardsWithNew)
      setBoostersRemaining((prev) => Math.max(0, prev - 1))

      return cardsWithNew
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue s'est produite"
      setError(errorMessage)
      return null
    } finally {
      setIsOpening(false)
    }
  }, [userId, boostersRemaining])

  // Reset cards (clear the revealed cards)
  const resetCards = useCallback(() => {
    setCards([])
    setError(null)
  }, [])

  return {
    isOpening,
    cards,
    error,
    boostersRemaining,
    openBooster,
    resetCards,
    refreshStatus,
  }
}
