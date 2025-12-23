// =============================================
// ENUMS & BASE TYPES
// =============================================

// Pokemon Energy Types
export type EnergyType =
  | 'water'
  | 'fire'
  | 'grass'
  | 'electric'
  | 'psychic'
  | 'fighting'
  | 'dark'
  | 'steel'
  | 'fairy'
  | 'dragon'
  | 'colorless'

// Pokemon Card Rarity
export type Rarity = 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra'

// Pokemon Card Stage
export type Stage = 'Basic' | 'Stage 1' | 'Stage 2'

// Wrapper type for card effects
export type WrapperType =
  | 'water'
  | 'fire'
  | 'grass'
  | 'lightning'
  | 'psychic'
  | 'fighting'
  | 'darkness'
  | 'metal'
  | 'dragon'
  | 'fairy'
  | 'colorless'

// =============================================
// DATABASE ENTITIES
// =============================================

// Database Attack entity
export interface Attack {
  id: number
  card_id: number
  name: string
  damage: number
  energy_cost: EnergyType[]
  description: string
}

// Database Card entity
export interface Card {
  id: number
  name: string
  subtitle: string | null
  hp: number
  type: EnergyType
  stage: string
  pokedex_number: string
  species: string
  height: string
  weight: string
  image_url: string
  image_offset_x: number // % offset for image positioning (-50 to 50)
  image_offset_y: number // % offset for image positioning (-50 to 50)
  image_scale: number // scale factor (0.5 to 2.0, 1.0 = 100%)
  weakness: EnergyType
  retreat_cost: number
  flavor_text: string
  illustrator: string | null
  rarity: Rarity
  created_at?: string
  card_attacks?: Attack[]
}

// Database User entity
export interface User {
  id: string
  username: string
  password_hash?: string
  created_at: string
  updated_at: string
}

// =============================================
// BOOSTER SYSTEM TYPES
// =============================================

// User inventory item - tracks owned cards
export interface UserInventoryItem {
  id: number
  user_id: string
  card_id: number
  quantity: number
  first_obtained_at: string
  last_obtained_at: string
}

// User inventory with card details (from view)
export interface UserCollectionItem extends UserInventoryItem {
  name: string
  subtitle: string | null
  hp: number
  type: EnergyType
  rarity: Rarity
  image_url: string
  pokedex_number: string
}

// Daily booster tracking
export interface UserDailyBoosters {
  id: number
  user_id: string
  date: string
  boosters_opened: number
  last_opened_at: string | null
}

// Booster history entry
export interface BoosterHistoryEntry {
  id: number
  user_id: string
  opened_at: string
  cards_obtained: number[]
}

// Rarity probability config
export interface RarityProbability {
  rarity: Rarity
  probability: number
}

// Card obtained from opening a booster
export interface BoosterCard {
  card_id: number
  card_name: string
  card_rarity: Rarity
  card_image_url: string
  is_new: boolean
}

// Full card details for booster reveal
export interface BoosterCardFull extends Card {
  is_new: boolean
}

// Booster status for a user
export interface BoosterStatus {
  user_id: string
  username: string
  boosters_opened_today: number
  boosters_remaining: number
  last_opened_at: string | null
}

// Collection stats
export interface CollectionStats {
  user_id: string
  unique_cards: number
  total_cards: number
  total_available: number
  completion_percentage: number
}

// =============================================
// BOOSTER SYSTEM CONSTANTS
// =============================================

export const MAX_DAILY_BOOSTERS = 5
export const CARDS_PER_BOOSTER = 3

// Default rarity probabilities
export const DEFAULT_RARITY_PROBABILITIES: RarityProbability[] = [
  { rarity: 'common', probability: 0.5 },
  { rarity: 'uncommon', probability: 0.3 },
  { rarity: 'rare', probability: 0.12 },
  { rarity: 'holo', probability: 0.06 },
  { rarity: 'ultra', probability: 0.02 },
]

// Rarity display colors
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af', // gray
  uncommon: '#22c55e', // green
  rare: '#3b82f6', // blue
  holo: '#a855f7', // purple
  ultra: '#f59e0b', // gold/amber
}

// Rarity display names
export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Commune',
  uncommon: 'Peu commune',
  rare: 'Rare',
  holo: 'Holo Rare',
  ultra: 'Ultra Rare',
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface OpenBoosterResponse {
  success: boolean
  cards: BoosterCardFull[]
  boosters_remaining: number
  error?: string
}

export interface BoosterStatusResponse {
  success: boolean
  status: BoosterStatus
  error?: string
}

export interface CollectionResponse {
  success: boolean
  collection: UserCollectionItem[]
  stats: CollectionStats
  error?: string
}

// =============================================
// MAPPINGS
// =============================================

// Map energy types to wrapper type names
export const typeMapping: Record<EnergyType, WrapperType> = {
  water: 'water',
  fire: 'fire',
  grass: 'grass',
  electric: 'lightning',
  psychic: 'psychic',
  fighting: 'fighting',
  dark: 'darkness',
  steel: 'metal',
  fairy: 'fairy',
  dragon: 'dragon',
  colorless: 'colorless',
}

// Map pokemon types to their weaknesses
export const weaknessMapping: Record<EnergyType, EnergyType> = {
  water: 'electric',
  fire: 'water',
  grass: 'fire',
  electric: 'fighting',
  psychic: 'dark',
  fighting: 'psychic',
  dark: 'fighting',
  steel: 'fire',
  fairy: 'steel',
  dragon: 'fairy',
  colorless: 'fighting',
}
