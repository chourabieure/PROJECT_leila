'use client'

import Image from 'next/image'

// Types
type EnergyType =
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
type Rarity = 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra' | 'secret'

interface Attack {
  name: string
  damage?: number
  energyCost: EnergyType[]
  description?: string
}

interface TypeModifier {
  type: EnergyType
  modifier: string
}

interface PokemonCardProps {
  name: string
  hp: number
  type: EnergyType
  stage: 'Basic' | 'Stage 1' | 'Stage 2'
  evolvesFrom?: string
  pokedexNumber: string
  species: string
  height: string
  weight: string
  imageUrl: string
  attacks: Attack[]
  weakness?: TypeModifier
  resistance?: TypeModifier
  retreatCost: number
  flavorText: string
  illustrator: string
  cardNumber: string
  setTotal: string
  rarity: Rarity
  year: string
}

// Energy type colors and backgrounds
const typeColors: Record<EnergyType, { primary: string; secondary: string; gradient: string }> = {
  water: {
    primary: '#28AADC',
    secondary: '#65C6EA',
    gradient: 'linear-gradient(135deg, #28AADC 0%, #65C6EA 50%, #87D3F0 100%)',
  },
  fire: {
    primary: '#F08030',
    secondary: '#F5AC78',
    gradient: 'linear-gradient(135deg, #F08030 0%, #F5AC78 50%, #FFCB7D 100%)',
  },
  grass: {
    primary: '#78C850',
    secondary: '#A7DB8D',
    gradient: 'linear-gradient(135deg, #78C850 0%, #A7DB8D 50%, #C6E8B8 100%)',
  },
  electric: {
    primary: '#F8D030',
    secondary: '#FAE078',
    gradient: 'linear-gradient(135deg, #F8D030 0%, #FAE078 50%, #FFF4A3 100%)',
  },
  psychic: {
    primary: '#F85888',
    secondary: '#FA92B2',
    gradient: 'linear-gradient(135deg, #F85888 0%, #FA92B2 50%, #FFC0D0 100%)',
  },
  fighting: {
    primary: '#C03028',
    secondary: '#D67873',
    gradient: 'linear-gradient(135deg, #C03028 0%, #D67873 50%, #E8A8A4 100%)',
  },
  dark: {
    primary: '#705848',
    secondary: '#A29288',
    gradient: 'linear-gradient(135deg, #705848 0%, #A29288 50%, #C5BBB5 100%)',
  },
  steel: {
    primary: '#B8B8D0',
    secondary: '#D1D1E0',
    gradient: 'linear-gradient(135deg, #B8B8D0 0%, #D1D1E0 50%, #E8E8F0 100%)',
  },
  fairy: {
    primary: '#EE99AC',
    secondary: '#F4BDC9',
    gradient: 'linear-gradient(135deg, #EE99AC 0%, #F4BDC9 50%, #FADCE3 100%)',
  },
  dragon: {
    primary: '#7038F8',
    secondary: '#A27DFA',
    gradient: 'linear-gradient(135deg, #7038F8 0%, #A27DFA 50%, #C4AAFC 100%)',
  },
  colorless: {
    primary: '#A8A878',
    secondary: '#C6C6A7',
    gradient: 'linear-gradient(135deg, #D0D0C0 0%, #E8E8D8 50%, #F5F5EC 100%)',
  },
}

// Energy Icon Component
const EnergyIcon = ({ type, size = 20 }: { type: EnergyType; size?: number }) => {
  const renderIcon = () => {
    switch (type) {
      case 'water':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`water-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5BB8E8" />
                <stop offset="100%" stopColor="#2A7FBA" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#water-grad-${size})`} stroke="#1A5A8A" strokeWidth="2" />
            <path
              d="M50 20 C50 20 25 50 25 65 C25 80 37 90 50 90 C63 90 75 80 75 65 C75 50 50 20 50 20"
              fill="#1A5A8A"
            />
          </svg>
        )
      case 'fire':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`fire-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#C41E3A" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#fire-grad-${size})`} stroke="#8B0000" strokeWidth="2" />
            <path
              d="M50 15 C35 35 30 45 30 60 C30 75 40 85 50 85 C60 85 70 75 70 60 C70 45 65 35 50 15 M50 40 C55 50 60 55 60 65 C60 72 55 78 50 78 C45 78 40 72 40 65 C40 55 45 50 50 40"
              fill="#FFDB58"
              fillRule="evenodd"
            />
          </svg>
        )
      case 'grass':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`grass-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7AC74C" />
                <stop offset="100%" stopColor="#4A8522" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#grass-grad-${size})`} stroke="#2D5016" strokeWidth="2" />
            <path
              d="M50 15 C30 30 20 50 25 70 C30 85 45 90 50 85 C50 85 35 70 40 50 C45 35 50 30 50 15"
              fill="#1A3D0C"
            />
            <path
              d="M50 15 C70 30 80 50 75 70 C70 85 55 90 50 85 C50 85 65 70 60 50 C55 35 50 30 50 15"
              fill="#1A3D0C"
            />
          </svg>
        )
      case 'electric':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`electric-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="100%" stopColor="#F7C600" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#electric-grad-${size})`} stroke="#B8960C" strokeWidth="2" />
            <polygon points="55,10 35,45 48,45 42,90 68,48 52,48" fill="#1A1A00" />
          </svg>
        )
      case 'psychic':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`psychic-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF69B4" />
                <stop offset="100%" stopColor="#8B008B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#psychic-grad-${size})`} stroke="#4B0082" strokeWidth="2" />
            <ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="#FFF" strokeWidth="6" />
            <circle cx="50" cy="50" r="8" fill="#FFF" />
          </svg>
        )
      case 'fighting':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`fighting-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C22E28" />
                <stop offset="100%" stopColor="#8B1A1A" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#fighting-grad-${size})`} stroke="#5C0000" strokeWidth="2" />
            <polygon points="50,15 20,85 50,65 80,85" fill="#FFF" />
          </svg>
        )
      case 'dark':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`dark-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#705746" />
                <stop offset="100%" stopColor="#413839" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#dark-grad-${size})`} stroke="#1A1A1A" strokeWidth="2" />
            <path d="M70 30 C45 30 30 50 30 70 C50 70 70 55 70 30" fill="#1A1A1A" />
          </svg>
        )
      case 'steel':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`steel-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B7B7CE" />
                <stop offset="100%" stopColor="#787887" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#steel-grad-${size})`} stroke="#5A5A6E" strokeWidth="2" />
            <polygon points="50,18 75,35 75,65 50,82 25,65 25,35" fill="#D0D0E0" stroke="#4A4A5A" strokeWidth="3" />
          </svg>
        )
      case 'fairy':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`fairy-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4BDC9" />
                <stop offset="100%" stopColor="#D685AD" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#fairy-grad-${size})`} stroke="#AA336A" strokeWidth="2" />
            <polygon points="50,15 56,40 80,40 60,55 68,80 50,65 32,80 40,55 20,40 44,40" fill="#FFF" />
          </svg>
        )
      case 'dragon':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`dragon-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6F35FC" />
                <stop offset="100%" stopColor="#4C0099" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#dragon-grad-${size})`} stroke="#2D0066" strokeWidth="2" />
            <path d="M30 70 L50 20 L70 70 L50 55 Z" fill="#FFD700" />
          </svg>
        )
      case 'colorless':
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`colorless-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5F5F5" />
                <stop offset="100%" stopColor="#D0D0D0" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#colorless-grad-${size})`} stroke="#999" strokeWidth="2" />
            <polygon
              points="50,15 58,38 83,38 63,53 70,78 50,63 30,78 37,53 17,38 42,38"
              fill="#FFF"
              stroke="#999"
              strokeWidth="2"
            />
          </svg>
        )
    }
  }

  return <span className="inline-flex items-center justify-center">{renderIcon()}</span>
}

// Rarity Symbol Component
const RaritySymbol = ({ rarity }: { rarity: Rarity }) => {
  switch (rarity) {
    case 'common':
      return <span className="inline-block w-2.5 h-2.5 rounded-full bg-black" />
    case 'uncommon':
      return (
        <span
          className="inline-block w-2.5 h-2.5 rotate-45 bg-black"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />
      )
    case 'rare':
    case 'holo':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="black">
          <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" />
        </svg>
      )
    case 'ultra':
    case 'secret':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="ultra-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
          <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" fill="url(#ultra-grad)" />
        </svg>
      )
    default:
      return <span className="inline-block w-2.5 h-2.5 rounded-full bg-black" />
  }
}

// Set Symbol Component (Unbroken Bonds style)
const SetSymbol = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 4L12 12L6 20" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 4L18 12L12 20" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Noise texture for background
const NoiseTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-soft-light pointer-events-none">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
)

// Main Pokemon Card Component
export const PokemonCard = ({
  name,
  hp,
  type,
  stage,
  evolvesFrom,
  pokedexNumber,
  species,
  height,
  weight,
  imageUrl,
  attacks,
  weakness,
  resistance,
  retreatCost,
  flavorText,
  illustrator,
  cardNumber,
  setTotal,
  rarity,
  year,
}: PokemonCardProps) => {
  const typeColor = typeColors[type]
  const isHolo = rarity === 'holo' || rarity === 'ultra' || rarity === 'secret'

  return (
    <div
      className="relative select-none"
      style={{
        width: '315px',
        height: '440px',
      }}
    >
      {/* Yellow Border */}
      <div
        className="absolute inset-0 rounded-[18px]"
        style={{
          background: 'linear-gradient(145deg, #FFDE00 0%, #E6C700 50%, #FFDE00 100%)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.2)',
        }}
      />

      {/* Inner Card Container */}
      <div
        className="absolute rounded-[12px] overflow-hidden"
        style={{
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          background: typeColor.gradient,
        }}
      >
        {/* Noise texture overlay */}
        <NoiseTexture />

        {/* Holographic shimmer effect for holo cards */}
        {isHolo && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              background: `linear-gradient(
                45deg,
                transparent 20%,
                rgba(255,255,255,0.3) 25%,
                transparent 30%,
                transparent 45%,
                rgba(255,200,100,0.2) 50%,
                transparent 55%,
                transparent 70%,
                rgba(100,200,255,0.2) 75%,
                transparent 80%
              )`,
              backgroundSize: '200% 200%',
              animation: 'shimmer 5s ease-in-out infinite',
            }}
          />
        )}

        {/* Content Container */}
        <div className="relative z-5 flex flex-col h-full p-3">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-2">
            {/* Stage Tag + Name */}
            <div className="flex items-center gap-1.5">
              {/* Stage pill */}
              <div
                className="px-2 py-0.5 text-[9px] font-bold italic tracking-wide"
                style={{
                  background: 'linear-gradient(180deg, #E8E8E8 0%, #B8B8B8 100%)',
                  borderRadius: '0 8px 8px 0',
                  clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
                  color: '#404040',
                  textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                {stage.toUpperCase()}
              </div>
              {/* Pokemon Name */}
              <span
                className="text-xl font-black tracking-tight text-black"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
              >
                {name}
              </span>
            </div>

            {/* HP + Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-black">HP</span>
              <span className="text-2xl font-black text-black" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                {hp}
              </span>
              <EnergyIcon type={type} size={26} />
            </div>
          </div>

          {/* Evolves From (if applicable) */}
          {evolvesFrom && <div className="text-[9px] text-gray-700 mb-1 -mt-1 ml-1">Evolves from {evolvesFrom}</div>}

          {/* Illustration Section */}
          <div className="relative mb-1">
            {/* Silver frame */}
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #E8E8E8 0%, #C0C0C0 30%, #A0A0A0 70%, #B0B0B0 100%)',
                padding: '4px',
                boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              {/* Image container */}
              <div
                className="relative overflow-hidden bg-linear-to-b from-sky-100 to-sky-200"
                style={{ height: '145px' }}
              >
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                />
              </div>

              {/* Data strip */}
              <div
                className="flex items-center justify-center py-1 text-[8px] tracking-wide"
                style={{
                  background: 'linear-gradient(180deg, #D8D8D8 0%, #A8A8A8 100%)',
                  color: '#404040',
                  fontWeight: 500,
                }}
              >
                NO. {pokedexNumber} {species} HT: {height} WT: {weight}
              </div>
            </div>
          </div>

          {/* Attack Section */}
          <div className="flex-1 flex flex-col justify-start py-1 px-1">
            {attacks.map((attack, index) => (
              <div key={index} className="mb-2">
                {/* Attack Row */}
                <div className="flex items-center gap-2">
                  {/* Energy Cost */}
                  <div className="flex items-center gap-0.5 min-w-[24px]">
                    {attack.energyCost.map((energy, i) => (
                      <EnergyIcon key={i} type={energy} size={18} />
                    ))}
                  </div>

                  {/* Attack Name */}
                  <span className="flex-1 text-base font-black text-black tracking-tight">{attack.name}</span>

                  {/* Damage */}
                  {attack.damage !== undefined && <span className="text-xl font-bold text-black">{attack.damage}</span>}
                </div>

                {/* Attack Description */}
                {attack.description && (
                  <p className="text-[9px] text-black leading-tight mt-0.5 ml-7">{attack.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Stats Footer Bar */}
          <div
            className="relative flex items-stretch rounded-lg overflow-hidden mb-2"
            style={{
              background: 'linear-gradient(180deg, #E0E0E0 0%, #B0B0B0 30%, #909090 70%, #A0A0A0 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
              height: '32px',
            }}
          >
            {/* Weakness */}
            <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-400/50 px-2">
              <span className="text-[7px] font-bold text-gray-600 uppercase tracking-wider">weakness</span>
              <div className="flex items-center gap-0.5">
                {weakness ? (
                  <>
                    <EnergyIcon type={weakness.type} size={14} />
                    <span className="text-xs font-bold text-black">{weakness.modifier}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>

            {/* Resistance */}
            <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-400/50 px-2">
              <span className="text-[7px] font-bold text-gray-600 uppercase tracking-wider">resistance</span>
              <div className="flex items-center gap-0.5">
                {resistance ? (
                  <>
                    <EnergyIcon type={resistance.type} size={14} />
                    <span className="text-xs font-bold text-black">{resistance.modifier}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>

            {/* Retreat */}
            <div className="flex-1 flex flex-col items-center justify-center px-2">
              <span className="text-[7px] font-bold text-gray-600 uppercase tracking-wider">retreat</span>
              <div className="flex items-center gap-0.5">
                {retreatCost > 0 ? (
                  Array.from({ length: Math.min(retreatCost, 4) }).map((_, i) => (
                    <EnergyIcon key={i} type="colorless" size={12} />
                  ))
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-end justify-between px-1 text-[7px]">
            {/* Left side - Illustrator & Set Info */}
            <div className="flex flex-col gap-0.5">
              <span className="italic text-gray-800">
                <span className="font-bold">Illus.</span> {illustrator}
              </span>
              <div className="flex items-center gap-1">
                <SetSymbol />
                <span className="font-bold text-black">
                  {cardNumber}/{setTotal}
                </span>
                <RaritySymbol rarity={rarity} />
              </div>
              <span className="text-gray-700 text-[6px]">©{year} Pokémon</span>
            </div>

            {/* Right side - Flavor Text */}
            <div className="max-w-[150px] text-right italic text-gray-800 leading-tight">{flavorText}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PokemonCard
