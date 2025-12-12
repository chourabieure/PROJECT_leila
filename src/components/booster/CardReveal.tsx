'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { BoosterCardFull, EnergyType, Rarity } from '@/utils/types'
import { RARITY_COLORS, RARITY_NAMES, typeMapping, weaknessMapping } from '@/utils/types'
import { PokemonCardWrapper, type CardRarity } from '@/components/ui/pokemon-card-wrapper'
import { PokemonCard } from '@/components/ui/pokemon-card'

interface CardRevealProps {
  cards: BoosterCardFull[]
  currentIndex: number
  onCardClick: () => void
  onComplete: () => void
}

// Map our rarity to wrapper rarity
function mapRarityToWrapper(rarity: Rarity): CardRarity {
  switch (rarity) {
    case 'common':
      return 'common'
    case 'uncommon':
      return 'common'
    case 'rare':
      return 'rare holo'
    case 'holo':
      return 'rare holo cosmos'
    case 'ultra':
      return 'rare rainbow'
    default:
      return 'common'
  }
}

// Map energy type to wrapper type
function mapTypeToWrapper(type: EnergyType) {
  return typeMapping[type]
}

export function CardReveal({ cards, currentIndex, onCardClick, onComplete }: CardRevealProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [showComplete, setShowComplete] = useState(false)

  // Auto-flip the current card after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlippedCards((prev) => new Set([...prev, currentIndex]))
    }, 500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Show complete button after all cards are revealed
  useEffect(() => {
    if (flippedCards.size === cards.length && cards.length > 0) {
      const timer = setTimeout(() => {
        setShowComplete(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [flippedCards.size, cards.length])

  const handleCardClick = (index: number) => {
    // Flip the card if not already flipped
    if (!flippedCards.has(index)) {
      setFlippedCards((prev) => new Set([...prev, index]))
    }

    // Move to next card if this is the current card
    if (index === currentIndex && currentIndex < cards.length - 1) {
      onCardClick()
    }
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${i === currentIndex ? 'bg-amber-400 scale-125' : ''}
              ${flippedCards.has(i) ? 'bg-amber-400/60' : 'bg-slate-700'}
            `}
          />
        ))}
      </div>

      {/* Cards display */}
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {cards.map((card, index) => {
          const isFlipped = flippedCards.has(index)
          const isActive = index === currentIndex
          const weaknessType = weaknessMapping[card.type]

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                relative cursor-pointer transition-all duration-500 ease-out
                ${isActive && !isFlipped ? 'scale-105 z-10' : 'scale-100'}
              `}
              style={{
                perspective: '1500px',
              }}
            >
              {/* Card container for 3D flip */}
              <div
                className="relative transition-transform duration-700 ease-out"
                style={{
                  width: '315px',
                  height: '440px',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Card Back */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <Image src="/cardBack.jpg" alt="Card back" fill className="object-cover" />

                  {/* Click hint */}
                  {isActive && !isFlipped && (
                    <div className="absolute bottom-6 left-0 right-0 text-center z-10">
                      <span className="text-white/90 text-sm font-medium animate-pulse px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                        Tap to reveal
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Front - Pokemon Card */}
                <div
                  className="absolute inset-0 rounded-xl shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <PokemonCardWrapper
                    rarity={mapRarityToWrapper(card.rarity)}
                    type={mapTypeToWrapper(card.type)}
                    subtypes="basic"
                    supertype="pokémon"
                  >
                    <PokemonCard
                      name={card.name}
                      hp={card.hp}
                      type={card.type}
                      stage="Basic"
                      pokedexNumber={card.pokedex_number || '???'}
                      species="Pokémon"
                      height={'0\'0"'}
                      weight="0.0 lbs"
                      imageUrl={card.image_url || '/pokemon-effects/trainerbg.jpg'}
                      attacks={[
                        {
                          name: 'Tackle',
                          damage: 20,
                          energyCost: [card.type],
                        },
                      ]}
                      weakness={{ type: weaknessType, modifier: '×2' }}
                      retreatCost={1}
                      flavorText="A mysterious Pokémon."
                      illustrator={card.illustrator || 'Unknown'}
                      cardNumber={card.pokedex_number || '???'}
                      setTotal="999"
                      rarity={card.rarity}
                      year="2024"
                    />
                  </PokemonCardWrapper>

                  {/* New badge */}
                  {card.is_new && (
                    <div className="absolute top-4 right-4 z-30">
                      <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500 text-white rounded-full shadow-lg animate-bounce">
                        NEW!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkle effects for rare cards */}
              {isFlipped && (card.rarity === 'holo' || card.rarity === 'ultra' || card.rarity === 'rare') && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping" />
                  <div
                    className="absolute top-8 right-6 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping"
                    style={{ animationDelay: '0.3s' }}
                  />
                  <div
                    className="absolute bottom-12 left-8 w-1 h-1 bg-purple-300 rounded-full animate-ping"
                    style={{ animationDelay: '0.6s' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Current card info */}
      {currentCard && flippedCards.has(currentIndex) && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-white mb-1">{currentCard.name}</h2>
          <p className="text-slate-400">
            <span style={{ color: RARITY_COLORS[currentCard.rarity] }}>{RARITY_NAMES[currentCard.rarity]}</span>
            {currentCard.is_new && <span className="ml-2 text-emerald-400">• New to collection!</span>}
          </p>
        </div>
      )}

      {/* Navigation / Complete buttons */}
      <div className="flex items-center gap-4 mt-4">
        {showComplete && (
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 animate-in fade-in zoom-in duration-300"
          >
            ✓ Complete
          </button>
        )}
      </div>
    </div>
  )
}
