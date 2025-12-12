'use client'

import { useState } from 'react'

interface BoosterPackProps {
  onClick: () => void
  disabled?: boolean
  isOpening?: boolean
}

export function BoosterPack({ onClick, disabled, isOpening }: BoosterPackProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-linear-to-br from-amber-500/40 via-purple-500/30 to-blue-500/40 rounded-3xl blur-3xl transition-opacity duration-500 ${
          isHovered && !disabled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: 'scale(1.5)' }}
      />

      {/* Booster Pack */}
      <button
        onClick={onClick}
        disabled={disabled || isOpening}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative group transition-all duration-500 ease-out
          ${disabled ? 'cursor-not-allowed grayscale opacity-50' : 'cursor-pointer hover:scale-105'}
          ${isOpening ? 'animate-pulse' : ''}
        `}
      >
        {/* Pack container */}
        <div
          className={`
            relative w-64 h-96 rounded-2xl overflow-hidden
            bg-linear-to-br from-slate-800 via-slate-900 to-slate-950
            border-2 transition-all duration-300
            ${disabled ? 'border-slate-700' : 'border-amber-500/50 hover:border-amber-400'}
            shadow-2xl
          `}
        >
          {/* Holographic pattern overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `
                linear-gradient(
                  125deg,
                  transparent 0%,
                  rgba(255, 200, 100, 0.3) 15%,
                  transparent 30%,
                  rgba(100, 200, 255, 0.3) 45%,
                  transparent 60%,
                  rgba(200, 100, 255, 0.3) 75%,
                  transparent 100%
                )
              `,
              backgroundSize: '400% 400%',
              animation: isHovered && !disabled ? 'shimmer 3s ease-in-out infinite' : 'none',
            }}
          />

          {/* Inner design */}
          <div className="absolute inset-3 rounded-xl bg-linear-to-br from-slate-950 via-purple-950/50 to-slate-950 border border-slate-700/50">
            {/* Center emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Pokeball-inspired design */}
                <div
                  className={`
                  w-32 h-32 rounded-full relative overflow-hidden
                  bg-linear-to-b from-red-500 to-red-700
                  shadow-lg transition-transform duration-300
                  ${isHovered && !disabled ? 'scale-110' : 'scale-100'}
                `}
                >
                  {/* White bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-b from-slate-100 to-slate-300" />

                  {/* Center line */}
                  <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 bg-slate-900" />

                  {/* Center button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-300 flex items-center justify-center">
                    <div
                      className={`
                      w-4 h-4 rounded-full transition-colors duration-300
                      ${isHovered && !disabled ? 'bg-amber-400' : 'bg-slate-600'}
                    `}
                    />
                  </div>
                </div>

                {/* Sparkles around emblem */}
                {!disabled && (
                  <>
                    <div
                      className="absolute -top-2 -right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping"
                      style={{ animationDelay: '0s' }}
                    />
                    <div
                      className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <div
                      className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"
                      style={{ animationDelay: '1s' }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Top text */}
            <div className="absolute top-4 left-0 right-0 text-center">
              <span className="text-xs font-bold tracking-[0.3em] text-amber-400/80 uppercase">Booster</span>
            </div>

            {/* Bottom text */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-yellow-300 to-amber-400">
                3 CARTES
              </span>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-500/30 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-500/30 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-500/30 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-500/30 rounded-br-lg" />
          </div>

          {/* Tear line effect */}
          <div className="absolute top-6 left-0 right-0 flex items-center gap-1 px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-slate-600/50 rounded" />
            ))}
          </div>
        </div>

        {/* Loading/Opening state */}
        {isOpening && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-amber-400 font-medium">Ouverture...</span>
            </div>
          </div>
        )}
      </button>

      {/* Action text */}
      <p
        className={`
        mt-6 text-lg font-medium transition-all duration-300
        ${disabled ? 'text-slate-600' : 'text-slate-400 group-hover:text-amber-400'}
      `}
      >
        {disabled ? 'Aucun booster disponible' : isOpening ? 'Ouverture en cours...' : 'Clique pour ouvrir'}
      </p>
    </div>
  )
}
