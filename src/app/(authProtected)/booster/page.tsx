'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useBooster, useBoosterStatus, useInventory, useAllCards } from '@/hooks'
import { CardReveal } from '@/components/booster/CardReveal'
import { CollectionGrid } from '@/components/booster/CollectionGrid'
import { Scene } from '@/components/ui/scene'
import type { BoosterCardFull } from '@/utils/types'

type Section = 'packs' | 'inventory'

export default function BoosterPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { openBooster, isOpening, error, boostersRemaining, resetCards, refreshStatus } = useBooster(user?.id)
  const { timeUntilReset, canOpenBooster } = useBoosterStatus(user?.id)
  const { stats, refresh: refreshInventory, collection } = useInventory(user?.id)
  const { filteredCards, refresh: refreshAllCards, rarityFilter, setRarityFilter } = useAllCards()

  const [activeSection, setActiveSection] = useState<Section>('packs')
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealedCards, setRevealedCards] = useState<BoosterCardFull[]>([])
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0)

  // Refresh status on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refreshStatus()
    }
  }, [refreshStatus, user?.id])

  // Handle opening booster when a pack is clicked
  const handlePackOpen = async (packIndex: number) => {
    console.log('Opening pack:', packIndex)
    if (!user?.id || !canOpenBooster || isOpening) return

    const newCards = await openBooster()
    if (newCards && newCards.length > 0) {
      setRevealedCards(newCards)
      setCurrentRevealIndex(0)
      setIsRevealing(true)
    }
  }

  // Show loading while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Show message if not authenticated
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Non authentifié</h2>
          <p className="text-slate-400">Veuillez vous connecter pour accéder aux boosters.</p>
        </div>
      </div>
    )
  }

  // Handle reveal completion
  const handleRevealComplete = () => {
    setIsRevealing(false)
    setRevealedCards([])
    setCurrentRevealIndex(0)
    resetCards()
    refreshInventory()
    refreshAllCards()
  }

  // Handle card click during reveal
  const handleCardReveal = () => {
    if (currentRevealIndex < revealedCards.length - 1) {
      setCurrentRevealIndex((prev) => prev + 1)
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Section Toggle Buttons */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-full border border-slate-700/50 shadow-2xl">
        <button
          onClick={() => setActiveSection('packs')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeSection === 'packs'
              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Ouvrir des Packs
        </button>
        <button
          onClick={() => setActiveSection('inventory')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeSection === 'inventory'
              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Ma Collection
        </button>
      </div>

      {/* Packs Section - 3D Scene */}
      {activeSection === 'packs' && (
        <div className="flex-1 relative">
          {/* Booster Status Overlay */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40">
            <div className="inline-flex flex-col items-center gap-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < boostersRemaining
                        ? 'bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-center">
                <span className="text-3xl font-black text-white">{boostersRemaining}</span>
                <span className="text-lg text-slate-400 ml-1">/ 3</span>
              </div>
              {boostersRemaining === 0 && (
                <p className="text-amber-400/80 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {timeUntilReset}
                </p>
              )}
            </div>
          </div>

          {/* Card Reveal Overlay */}
          {isRevealing && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center">
              <CardReveal
                cards={revealedCards}
                currentIndex={currentRevealIndex}
                onCardClick={handleCardReveal}
                onComplete={handleRevealComplete}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40">
              <p className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">{error}</p>
            </div>
          )}

          {/* 3D Pack Scene */}
          <Scene onPackOpen={handlePackOpen} />
        </div>
      )}

      {/* Inventory Section */}
      {activeSection === 'inventory' && (
        <div className="flex-1 overflow-y-auto pt-20">
          <div className="container mx-auto px-4 py-8">
            <section className="pb-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ta Collection</h2>
                  {stats && (
                    <p className="text-slate-400">
                      <span className="text-amber-400 font-semibold">{stats.unique_cards}</span> cartes uniques
                      <span className="mx-2">•</span>
                      <span className="text-slate-300">{stats.total_cards}</span> au total
                      <span className="mx-2">•</span>
                      <span className="text-emerald-400">{stats.completion_percentage}%</span> complété
                    </p>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value as typeof rarityFilter)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  >
                    <option value="all">Toutes les raretés</option>
                    <option value="common">Commune</option>
                    <option value="uncommon">Peu commune</option>
                    <option value="rare">Rare</option>
                    <option value="holo">Holo</option>
                    <option value="ultra">Ultra Rare</option>
                  </select>
                </div>
              </div>

              <CollectionGrid allCards={filteredCards} ownedCards={collection} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
