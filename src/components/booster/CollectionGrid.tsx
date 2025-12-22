'use client'

import type { Card, UserCollectionItem, EnergyType, Rarity, Attack } from '@/utils/types'
import { typeMapping, weaknessMapping } from '@/utils/types'
import { PokemonCardWrapper, type CardRarity } from '@/components/ui/pokemon-card-wrapper'
import { PokemonCard } from '@/components/ui/pokemon-card'
import Image from 'next/image'

interface CollectionGridProps {
  allCards: Card[]
  ownedCards: UserCollectionItem[]
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

export function CollectionGrid({ allCards, ownedCards }: CollectionGridProps) {
  // Create a set of owned card IDs for fast lookup
  const ownedCardIds = new Set(ownedCards.map((item) => item.card_id))

  // Create a map of owned cards for quantity lookup
  const ownedCardMap = new Map(ownedCards.map((item) => [item.card_id, item]))

  if (allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Aucune carte disponible</h3>
        <p className="text-slate-500 max-w-md">Il n&apos;y a pas encore de cartes dans la base de données.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap w-full gap-8 justify-center overflow-y-auto hide-scrollbar p-6 pb-30">
      {allCards.map((card) => {
        const isOwned = ownedCardIds.has(card.id)
        const ownedItem = ownedCardMap.get(card.id)
        const weaknessType = weaknessMapping[card.type]

        if (isOwned) {
          // Show face-up card
          return (
            <div key={card.id} className="relative group">
              <PokemonCardWrapper
                rarity={mapRarityToWrapper(card.rarity)}
                type={mapTypeToWrapper(card.type)}
                subtypes="basic"
                supertype="pokémon"
                style={{ width: '315px', height: '440px' } as React.CSSProperties}
                className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2"
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
                  setTotal="31"
                  rarity={card.rarity}
                  year="2024"
                />
              </PokemonCardWrapper>

              {/* Quantity badge */}
              {ownedItem && ownedItem.quantity > 1 && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 bg-amber-600 rounded-full shadow-lg">
                  <span className="text-xs font-bold text-white">×{ownedItem.quantity}</span>
                </div>
              )}
            </div>
          )
        } else {
          // Show face-down card (not discovered)
          return (
            <div key={card.id} className="relative group">
              <div
                className="relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                style={{ width: '315px', height: '440px' }}
              >
                <Image
                  src="/cardBack.png"
                  alt="Carte non découverte"
                  fill
                  className="object-cover grayscale-30 brightness-75"
                />

                {/* Mystery overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

                {/* Question mark badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-slate-900/80 border-2 border-slate-600 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl font-bold text-slate-400">?</span>
                  </div>
                </div>

                {/* Card number hint at bottom */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-xs text-slate-400 bg-slate-900/70 px-3 py-1 rounded-full">
                    #{card.pokedex_number || '???'}
                  </span>
                </div>
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}
