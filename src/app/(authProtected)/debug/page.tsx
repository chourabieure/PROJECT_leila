'use client'

import { useState, useCallback } from 'react'
import { useAllCards } from '@/hooks/useAllCards'
import { supabase } from '@/lib/supabase'
import {
  RARITY_NAMES,
  typeMapping,
  weaknessMapping,
  type EnergyType,
  type Rarity,
  type Card,
  type Attack,
} from '@/utils/types'
import { PokemonCard } from '@/components/ui/pokemon-card'
import { PokemonCardWrapper, type CardRarity } from '@/components/ui/pokemon-card-wrapper'

const ENERGY_TYPES: EnergyType[] = [
  'water',
  'fire',
  'grass',
  'electric',
  'psychic',
  'fighting',
  'dark',
  'steel',
  'fairy',
  'dragon',
  'colorless',
]

const RARITY_OPTIONS: Rarity[] = ['common', 'uncommon', 'rare', 'holo', 'ultra']

const STAGE_OPTIONS = ['Basic', 'Stage 1', 'Stage 2']

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

// Energy Icon Component
const EnergyIcon = ({ type, size = 16 }: { type: EnergyType; size?: number }) => {
  const colors: Record<EnergyType, string> = {
    water: '#28AADC',
    fire: '#F08030',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    fighting: '#C03028',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
    dragon: '#7038F8',
    colorless: '#A8A878',
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-black/20"
      style={{
        width: size,
        height: size,
        backgroundColor: colors[type],
      }}
      title={type}
    >
      <span className="text-[8px] font-bold text-white drop-shadow-sm">{type.charAt(0).toUpperCase()}</span>
    </span>
  )
}

// Input styles
const inputClass =
  'bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full'
const selectClass =
  'bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50'

// Editable Card Component
function EditableCard({ card, onUpdate }: { card: Card; onUpdate: () => void }) {
  const [editedCard, setEditedCard] = useState<Card>({ ...card, attacks: card.attacks ? [...card.attacks] : [] })
  const [editedAttacks, setEditedAttacks] = useState<Attack[]>(card.attacks ? card.attacks.map((a) => ({ ...a })) : [])
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check if there are changes
  const hasChanges = useCallback(() => {
    const cardChanged =
      editedCard.name !== card.name ||
      editedCard.subtitle !== card.subtitle ||
      editedCard.hp !== card.hp ||
      editedCard.type !== card.type ||
      editedCard.stage !== card.stage ||
      editedCard.pokedex_number !== card.pokedex_number ||
      editedCard.species !== card.species ||
      editedCard.height !== card.height ||
      editedCard.weight !== card.weight ||
      editedCard.image_url !== card.image_url ||
      editedCard.image_offset_x !== card.image_offset_x ||
      editedCard.image_offset_y !== card.image_offset_y ||
      editedCard.image_scale !== card.image_scale ||
      editedCard.weakness !== card.weakness ||
      editedCard.retreat_cost !== card.retreat_cost ||
      editedCard.flavor_text !== card.flavor_text ||
      editedCard.illustrator !== card.illustrator ||
      editedCard.rarity !== card.rarity

    if (cardChanged) return true

    // Check attacks
    const originalAttacks = card.attacks || []
    if (editedAttacks.length !== originalAttacks.length) return true

    for (let i = 0; i < editedAttacks.length; i++) {
      const edited = editedAttacks[i]
      const original = originalAttacks[i]
      if (
        edited.name !== original.name ||
        edited.damage !== original.damage ||
        edited.description !== original.description ||
        JSON.stringify(edited.energy_cost) !== JSON.stringify(original.energy_cost)
      ) {
        return true
      }
    }

    return false
  }, [editedCard, editedAttacks, card])

  const updateCard = (field: keyof Card, value: unknown) => {
    setEditedCard((prev) => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
    setErrorMessage(null)
  }

  const updateAttack = (index: number, field: keyof Attack, value: unknown) => {
    setEditedAttacks((prev) => {
      const newAttacks = [...prev]
      newAttacks[index] = { ...newAttacks[index], [field]: value }
      return newAttacks
    })
    setSaveStatus('idle')
    setErrorMessage(null)
  }

  const addEnergyToAttack = (attackIndex: number, energy: EnergyType) => {
    setEditedAttacks((prev) => {
      const newAttacks = [...prev]
      newAttacks[attackIndex] = {
        ...newAttacks[attackIndex],
        energy_cost: [...newAttacks[attackIndex].energy_cost, energy],
      }
      return newAttacks
    })
    setSaveStatus('idle')
  }

  const removeEnergyFromAttack = (attackIndex: number, energyIndex: number) => {
    setEditedAttacks((prev) => {
      const newAttacks = [...prev]
      newAttacks[attackIndex] = {
        ...newAttacks[attackIndex],
        energy_cost: newAttacks[attackIndex].energy_cost.filter((_, i) => i !== energyIndex),
      }
      return newAttacks
    })
    setSaveStatus('idle')
  }

  const addAttack = () => {
    const newAttack: Attack = {
      id: Date.now(), // Temporary ID
      card_id: card.id,
      name: 'New Attack',
      damage: 0,
      energy_cost: ['colorless'],
      description: '',
    }
    setEditedAttacks((prev) => [...prev, newAttack])
    setSaveStatus('idle')
  }

  const removeAttack = (index: number) => {
    setEditedAttacks((prev) => prev.filter((_, i) => i !== index))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage(null)

    try {
      // Update card - use .select() to verify the update actually happened
      const { data: updatedCard, error: cardError } = await supabase
        .from('cards')
        .update({
          name: editedCard.name,
          subtitle: editedCard.subtitle,
          hp: editedCard.hp,
          type: editedCard.type,
          stage: editedCard.stage,
          pokedex_number: editedCard.pokedex_number,
          species: editedCard.species,
          height: editedCard.height,
          weight: editedCard.weight,
          image_url: editedCard.image_url,
          image_offset_x: editedCard.image_offset_x,
          image_offset_y: editedCard.image_offset_y,
          image_scale: editedCard.image_scale,
          weakness: editedCard.weakness,
          retreat_cost: editedCard.retreat_cost,
          flavor_text: editedCard.flavor_text,
          illustrator: editedCard.illustrator,
          rarity: editedCard.rarity,
        })
        .eq('id', card.id)
        .select()

      if (cardError) throw cardError

      // Check if update actually happened (RLS might block it silently)
      if (!updatedCard || updatedCard.length === 0) {
        throw new Error('Update blocked by RLS. Add UPDATE policy to cards table.')
      }

      // Delete existing attacks
      const { error: deleteError } = await supabase.from('attacks').delete().eq('card_id', card.id)

      if (deleteError) throw deleteError

      // Insert updated attacks
      if (editedAttacks.length > 0) {
        const attacksToInsert = editedAttacks.map((attack) => ({
          card_id: card.id,
          name: attack.name,
          damage: attack.damage,
          energy_cost: attack.energy_cost,
          description: attack.description,
        }))

        const { error: attackError } = await supabase.from('attacks').insert(attacksToInsert)

        if (attackError) throw attackError
      }

      setSaveStatus('success')
      onUpdate()
    } catch (err) {
      console.error('Save error:', err)
      setSaveStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEditedCard({ ...card, attacks: card.attacks ? [...card.attacks] : [] })
    setEditedAttacks(card.attacks ? card.attacks.map((a) => ({ ...a })) : [])
    setSaveStatus('idle')
  }

  const weaknessType = weaknessMapping[editedCard.type as EnergyType]

  return (
    <div className="backdrop-blur rounded-xl border border-slate-700 overflow-hidden hover:border-slate-500 transition-all">
      {/* Card Preview */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-center">
        <div className="transform scale-75 origin-top">
          <PokemonCardWrapper
            rarity={mapRarityToWrapper(editedCard.rarity)}
            type={typeMapping[editedCard.type as EnergyType]}
            subtypes="basic"
            supertype="pokémon"
            style={{ width: '315px', height: '440px' } as React.CSSProperties}
          >
            <PokemonCard
              name={editedCard.name}
              hp={editedCard.hp}
              type={editedCard.type as EnergyType}
              stage={editedCard.stage as 'Basic' | 'Stage 1' | 'Stage 2'}
              pokedexNumber={editedCard.pokedex_number || '???'}
              species={editedCard.species || 'Pokémon'}
              height={editedCard.height || '0\'0"'}
              weight={editedCard.weight || '0.0 lbs'}
              imageUrl={editedCard.image_url || '/pokemon-effects/trainerbg.jpg'}
              imageOffsetX={editedCard.image_offset_x ?? 0}
              imageOffsetY={editedCard.image_offset_y ?? 0}
              imageScale={editedCard.image_scale ?? 1}
              attacks={mapAttacks(editedAttacks)}
              weakness={{ type: weaknessType, modifier: '×2' }}
              retreatCost={editedCard.retreat_cost || 1}
              flavorText={editedCard.flavor_text || 'A mysterious Pokémon.'}
              illustrator={editedCard.illustrator || 'Unknown'}
              cardNumber={editedCard.pokedex_number || '???'}
              setTotal="999"
              rarity={editedCard.rarity}
              year="2024"
            />
          </PokemonCardWrapper>
        </div>
      </div>

      {/* Card Header */}
      <div className="flex items-start gap-4 p-4 border-b border-slate-700">
        {/* Card Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedCard.name}
              onChange={(e) => updateCard('name', e.target.value)}
              className={inputClass + ' font-bold'}
            />
            <select
              value={editedCard.type}
              onChange={(e) => updateCard('type', e.target.value)}
              className={selectClass}
            >
              {ENERGY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={editedCard.subtitle || ''}
            onChange={(e) => updateCard('subtitle', e.target.value || null)}
            placeholder="Subtitle..."
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedCard.pokedex_number}
              onChange={(e) => updateCard('pokedex_number', e.target.value)}
              className={inputClass + ' w-20'}
              placeholder="#"
            />
            <input
              type="number"
              value={editedCard.hp}
              onChange={(e) => updateCard('hp', parseInt(e.target.value) || 0)}
              className={inputClass + ' w-20'}
            />
            <span className="text-amber-400 text-sm">HP</span>
            <select
              value={editedCard.rarity}
              onChange={(e) => updateCard('rarity', e.target.value)}
              className={selectClass}
            >
              {RARITY_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {RARITY_NAMES[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Stage:</span>
            <select
              value={editedCard.stage}
              onChange={(e) => updateCard('stage', e.target.value)}
              className={selectClass + ' flex-1'}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Species:</span>
            <input
              type="text"
              value={editedCard.species}
              onChange={(e) => updateCard('species', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Height:</span>
            <input
              type="text"
              value={editedCard.height}
              onChange={(e) => updateCard('height', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Weight:</span>
            <input
              type="text"
              value={editedCard.weight}
              onChange={(e) => updateCard('weight', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Weakness:</span>
            <select
              value={editedCard.weakness}
              onChange={(e) => updateCard('weakness', e.target.value)}
              className={selectClass + ' flex-1'}
            >
              {ENERGY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Retreat:</span>
            <input
              type="number"
              value={editedCard.retreat_cost}
              onChange={(e) => updateCard('retreat_cost', parseInt(e.target.value) || 0)}
              className={inputClass + ' w-16'}
              min={0}
              max={4}
            />
          </div>
        </div>
      </div>

      {/* Image URL */}
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm shrink-0">Image URL:</span>
          <input
            type="text"
            value={editedCard.image_url}
            onChange={(e) => updateCard('image_url', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Image Position & Scale Controls */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Position & Scale</span>
          <button
            onClick={() => {
              updateCard('image_offset_x', 0)
              updateCard('image_offset_y', 0)
              updateCard('image_scale', 1)
            }}
            className="text-xs px-2 py-0.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="space-y-3">
          {/* Offset X */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs w-20 shrink-0">Offset X:</span>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={editedCard.image_offset_x ?? 0}
              onChange={(e) => updateCard('image_offset_x', parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <input
              type="number"
              value={editedCard.image_offset_x ?? 0}
              onChange={(e) => updateCard('image_offset_x', parseFloat(e.target.value) || 0)}
              className={inputClass + ' w-16 text-center'}
              min="-50"
              max="50"
            />
            <span className="text-slate-500 text-xs">%</span>
          </div>
          {/* Offset Y */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs w-20 shrink-0">Offset Y:</span>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={editedCard.image_offset_y ?? 0}
              onChange={(e) => updateCard('image_offset_y', parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <input
              type="number"
              value={editedCard.image_offset_y ?? 0}
              onChange={(e) => updateCard('image_offset_y', parseFloat(e.target.value) || 0)}
              className={inputClass + ' w-16 text-center'}
              min="-50"
              max="50"
            />
            <span className="text-slate-500 text-xs">%</span>
          </div>
          {/* Scale */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs w-20 shrink-0">Scale:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={editedCard.image_scale ?? 1}
              onChange={(e) => updateCard('image_scale', parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <input
              type="number"
              value={editedCard.image_scale ?? 1}
              onChange={(e) => updateCard('image_scale', parseFloat(e.target.value) || 1)}
              className={inputClass + ' w-16 text-center'}
              min="0.5"
              max="2"
              step="0.05"
            />
            <span className="text-slate-500 text-xs">×</span>
          </div>
        </div>
      </div>

      {/* Attacks Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Attacks ({editedAttacks.length})
          </h3>
          <button
            onClick={addAttack}
            className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
          >
            + Add Attack
          </button>
        </div>

        {editedAttacks.length > 0 ? (
          <div className="space-y-3">
            {editedAttacks.map((attack, attackIndex) => (
              <div key={attack.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                {/* Attack Header */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={attack.damage}
                    onChange={(e) => updateAttack(attackIndex, 'damage', parseInt(e.target.value) || 0)}
                    className={inputClass + ' w-[50px]! text-amber-400 font-bold flex-0'}
                    placeholder="DMG"
                  />
                  <input
                    type="text"
                    value={attack.name}
                    onChange={(e) => updateAttack(attackIndex, 'name', e.target.value)}
                    className={inputClass + ' flex-1 font-semibold'}
                    placeholder="Attack name"
                  />
                  <button
                    onClick={() => removeAttack(attackIndex)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove attack"
                  >
                    ✕
                  </button>
                </div>

                {/* Energy Cost */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-slate-500">Energy:</span>
                  <div className="flex gap-1 items-center flex-wrap">
                    {attack.energy_cost.map((energy, energyIndex) => (
                      <button
                        key={energyIndex}
                        onClick={() => removeEnergyFromAttack(attackIndex, energyIndex)}
                        className="hover:opacity-70 transition-opacity"
                        title="Click to remove"
                      >
                        <EnergyIcon type={energy} size={20} />
                      </button>
                    ))}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addEnergyToAttack(attackIndex, e.target.value as EnergyType)
                          e.target.value = ''
                        }
                      }}
                      className={selectClass + ' text-xs'}
                      defaultValue=""
                    >
                      <option value="">+</option>
                      {ENERGY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attack Description */}
                <textarea
                  value={attack.description}
                  onChange={(e) => updateAttack(attackIndex, 'description', e.target.value)}
                  className={inputClass + ' resize-none'}
                  placeholder="Attack description..."
                  rows={2}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No attacks</p>
        )}
      </div>

      {/* Flavor Text */}
      <div className="px-4 pb-3">
        <div className="flex items-start gap-2">
          <span className="text-slate-500 text-xs shrink-0 pt-1">Flavor:</span>
          <textarea
            value={editedCard.flavor_text}
            onChange={(e) => updateCard('flavor_text', e.target.value)}
            className={inputClass + ' resize-none text-xs italic'}
            rows={2}
          />
        </div>
      </div>

      {/* Illustrator */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs shrink-0">Illustrator:</span>
          <input
            type="text"
            value={editedCard.illustrator || ''}
            onChange={(e) => updateCard('illustrator', e.target.value || null)}
            className={inputClass + ' text-xs'}
            placeholder="Illustrator name"
          />
        </div>
      </div>

      {/* Footer with Save Button */}
      {hasChanges() && (
        <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700">
          {/* Error message */}
          {errorMessage && (
            <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
              {errorMessage}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {saveStatus === 'success' && <span className="text-emerald-400 text-sm">✓ Saved!</span>}
              {saveStatus === 'error' && <span className="text-red-400 text-sm">✕ Error saving</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⏳</span> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DebugPage() {
  const {
    filteredCards,
    isLoading,
    error,
    rarityFilter,
    setRarityFilter,
    searchQuery,
    setSearchQuery,
    allCards,
    refresh,
  } = useAllCards()

  const rarityOptions: (Rarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'holo', 'ultra']

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Debug - All Cards</h1>
          <p className="text-slate-400">
            Showing {filteredCards.length} of {allCards.length} cards from the database
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by name or pokedex number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Rarity Filter */}
            <div className="flex gap-2">
              {rarityOptions.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    rarityFilter === rarity
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {rarity === 'all' ? 'All' : RARITY_NAMES[rarity]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">Error: {error}</div>
        )}

        {/* Cards Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <EditableCard key={card.id.toString()} card={card} onUpdate={refresh} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCards.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold text-white mb-2">No cards found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  )
}
