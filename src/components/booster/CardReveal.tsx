'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Attack, BoosterCardFull, EnergyType, Rarity } from '@/utils/types'
import { typeMapping, weaknessMapping } from '@/utils/types'
import { PokemonCardWrapper, type CardRarity } from '@/components/ui/pokemon-card-wrapper'
import { PokemonCard } from '@/components/ui/pokemon-card'
import { cn } from '@/lib/utils'

interface CardRevealProps {
  cards: BoosterCardFull[]
  currentIndex: number
  onCardClick: () => void
  onComplete: () => void
}

// Map database attack to PokemonCard attack format
function mapAttacks(attacks?: Attack[]) {
  if (!attacks || attacks.length === 0) {
    return []
  }
  return attacks.map((attack) => ({
    name: attack.name,
    damage: attack.damage,
    energyCost: attack.energy_cost,
    description: attack.description,
  }))
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

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
      {/* Cards display */}
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {cards.map((card, index) => {
          const isFlipped = flippedCards.has(index)
          const weaknessType = weaknessMapping[card.type]

          return (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              className={cn(
                'relative cursor-pointer transition-all duration-500 ease-out',
                !isFlipped && 'scale-100 hover:scale-105',
              )}
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
                  className="group absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <Image src="/cardBack.png" alt="Card back" fill className="object-cover" />
                  <div className="group-hover:opacity-100 opacity-0 transition-all duration-200 scale-100 group-hover:scale-110 absolute bottom-6 left-0 right-0 text-center z-10">
                    <span className="text-white/90 text-sm font-medium animate-pulse px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                      Appuie pour révéler
                    </span>
                  </div>
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
                      stage={card.stage as 'Basic' | 'Stage 1' | 'Stage 2'}
                      pokedexNumber={card.pokedex_number || '???'}
                      species={card.species || 'Pokémon'}
                      height={card.height || '0\'0"'}
                      weight={card.weight || '0.0 lbs'}
                      imageUrl={card.image_url || '/pokemon-effects/trainerbg.jpg'}
                      imageOffsetX={card.image_offset_x ?? 0}
                      imageOffsetY={card.image_offset_y ?? 0}
                      imageScale={card.image_scale ?? 1}
                      attacks={mapAttacks(card.attacks)}
                      weakness={{ type: weaknessType, modifier: '×2' }}
                      retreatCost={card.retreat_cost || 1}
                      flavorText={card.flavor_text || 'A mysterious Pokémon.'}
                      illustrator={card.illustrator || 'Unknown'}
                      cardNumber={card.pokedex_number || '???'}
                      setTotal="999"
                      rarity={card.rarity}
                      year="2024"
                    />
                  </PokemonCardWrapper>

                  {/* New badge */}
                  {card.is_new && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30">
                      <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500 text-white rounded-full shadow-lg animate-bounce">
                        NOUVEAU !
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation / Complete buttons */}
      <div className="flex items-center gap-4 mt-4">
        {showComplete && (
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 animate-in fade-in zoom-in duration-300"
          >
            ✓ Terminé
          </button>
        )}
      </div>
    </div>
  )
}
