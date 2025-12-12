'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useBooster, useBoosterStatus, useInventory, useAllCards } from '@/hooks'
import { BoosterPack } from '@/components/booster/BoosterPack'
import { CardReveal } from '@/components/booster/CardReveal'
import { CollectionGrid } from '@/components/booster/CollectionGrid'
import type { BoosterCardFull } from '@/utils/types'

export default function BoosterPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { openBooster, isOpening, error, boostersRemaining, resetCards, refreshStatus } = useBooster(user?.id)
  const { timeUntilReset, canOpenBooster } = useBoosterStatus(user?.id)
  const { stats, refresh: refreshInventory, collection } = useInventory(user?.id)
  const { filteredCards, refresh: refreshAllCards, rarityFilter, setRarityFilter } = useAllCards()

  const [isRevealing, setIsRevealing] = useState(false)
  const [revealedCards, setRevealedCards] = useState<BoosterCardFull[]>([])
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0)

  // Refresh status on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refreshStatus()
    }
  }, [refreshStatus, user?.id])

  // Handle opening booster
  const handleOpenBooster = async () => {
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
    <div className="overflow-y-auto w-full ">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <section className="text-center mb-16 pt-8">
          <div className="inline-flex flex-col items-center gap-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < boostersRemaining
                      ? 'bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="text-center">
              <span className="text-6xl font-black text-white">{boostersRemaining}</span>
              <span className="text-2xl text-slate-400 ml-2">/ 5</span>
            </div>

            <p className="text-slate-500 text-sm">Boosters restants aujourd&apos;hui</p>

            {boostersRemaining === 0 && (
              <p className="text-amber-400/80 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Réinitialisation dans {timeUntilReset}
              </p>
            )}
          </div>
        </section>

        {/* Booster Pack Section */}
        <section className="flex flex-col items-center mb-20">
          {!isRevealing ? (
            <>
              <BoosterPack onClick={handleOpenBooster} disabled={!canOpenBooster || isOpening} isOpening={isOpening} />

              {error && <p className="mt-4 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}
            </>
          ) : (
            <CardReveal
              cards={revealedCards}
              currentIndex={currentRevealIndex}
              onCardClick={handleCardReveal}
              onComplete={handleRevealComplete}
            />
          )}
        </section>

        {/* Inventory Section */}
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
  )
}
