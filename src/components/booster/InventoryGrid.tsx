'use client'

import type { UserCollectionItem, EnergyType, Rarity } from '@/utils/types'
import { typeMapping, weaknessMapping } from '@/utils/types'
import { PokemonCardWrapper, type CardRarity } from '@/components/ui/pokemon-card-wrapper'
import { PokemonCard } from '@/components/ui/pokemon-card'

interface InventoryGridProps {
  collection: UserCollectionItem[]
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

export function InventoryGrid({ collection }: InventoryGridProps) {
  if (collection.length === 0) {
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
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No cards yet</h3>
        <p className="text-slate-500 max-w-md">Open your first booster pack to start building your collection!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap w-full gap-8 justify-center overflow-y-auto hide-scrollbar p-6 pb-30">
      {collection.map((item) => {
        const weaknessType = weaknessMapping[item.type]

        return (
          <div key={item.id} className="relative group">
            <PokemonCardWrapper
              rarity={mapRarityToWrapper(item.rarity)}
              type={mapTypeToWrapper(item.type)}
              subtypes="basic"
              supertype="pokémon"
              style={{ width: '315px', height: '440px' } as React.CSSProperties}
              className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2"
            >
              <PokemonCard
                name={item.name}
                hp={item.hp}
                type={item.type}
                stage="Basic"
                pokedexNumber={item.pokedex_number || '???'}
                species="Pokémon"
                height={'0\'0"'}
                weight="0.0 lbs"
                imageUrl={item.image_url || '/pokemon-effects/trainerbg.jpg'}
                attacks={[
                  {
                    name: 'Tackle',
                    damage: 20,
                    energyCost: [item.type],
                  },
                ]}
                weakness={{ type: weaknessType, modifier: '×2' }}
                retreatCost={1}
                flavorText="A mysterious Pokémon."
                illustrator={item.subtitle || 'Unknown'}
                cardNumber={item.pokedex_number || '???'}
                setTotal="999"
                rarity={item.rarity}
                year="2024"
              />
            </PokemonCardWrapper>

            {/* Quantity badge */}
            {item.quantity > 1 && (
              <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-amber-500 rounded-full shadow-lg">
                <span className="text-xs font-bold text-black">×{item.quantity}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
