'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import Image from 'next/image'
import './pokemon-card-effects.css'

// Helper functions (ported from Svelte)
const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision))
const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
  return round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))
}

export type CardRarity = 'common' | 'rare holo' | 'rare holo cosmos' | 'rare rainbow' | 'rare secret'
type CardType =
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
type CardSubtype = 'basic' | 'stage 1' | 'stage 2' | 'supporter' | 'item'
type CardSupertype = 'pokémon' | 'trainer' | 'energy'

interface PokemonCardWrapperProps {
  children: ReactNode
  rarity?: CardRarity
  type?: CardType
  subtypes?: CardSubtype
  supertype?: CardSupertype
  img?: string
  backImg?: string
  foil?: string
  mask?: string
  showcase?: boolean
  className?: string
  style?: React.CSSProperties
}

export function PokemonCardWrapper({
  children,
  rarity = 'rare holo',
  type = 'colorless',
  subtypes = 'basic',
  supertype = 'pokémon',
  img,
  backImg = '/cardBack.jpg',
  foil,
  mask,
  showcase = false,
  style,
  className = '',
}: PokemonCardWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)
  const [active, setActive] = useState(false)
  const [loaded] = useState(true)

  // Spring-like state values
  const [springGlare, setSpringGlare] = useState({ x: 50, y: 50, o: 0 })
  const [springRotate, setSpringRotate] = useState({ x: 0, y: 0 })
  const [springBackground, setSpringBackground] = useState({ x: 50, y: 50 })
  const [springScale] = useState(1)
  const [springTranslate] = useState({ x: 0, y: 0 })

  // Random seed for cosmos effects
  const [randomSeed] = useState(() => ({
    x: Math.random(),
    y: Math.random(),
  }))

  const cosmosPosition = {
    x: Math.floor(randomSeed.x * 734),
    y: Math.floor(randomSeed.y * 1280),
  }

  // Calculate derived values
  const pointerFromCenter = clamp(
    Math.sqrt((springGlare.y - 50) * (springGlare.y - 50) + (springGlare.x - 50) * (springGlare.x - 50)) / 50,
    0,
    1,
  )

  // Handle mouse/touch interaction
  const handleInteract = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current
    if (!el) return

    setInteracting(true)

    const rect = el.getBoundingClientRect()
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    }
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    }

    setSpringBackground({
      x: adjust(percent.x, 0, 100, 37, 63),
      y: adjust(percent.y, 0, 100, 33, 67),
    })
    setSpringRotate({
      x: round(-(center.x / 3.5)),
      y: round(center.y / 2),
    })
    setSpringGlare({
      x: round(percent.x),
      y: round(percent.y),
      o: 1,
    })
  }, [])

  // Handle interaction end
  const handleInteractEnd = useCallback(() => {
    setTimeout(() => {
      setInteracting(false)
      setSpringRotate({ x: 0, y: 0 })
      setSpringGlare({ x: 50, y: 50, o: 0 })
      setSpringBackground({ x: 50, y: 50 })
    }, 100)
  }, [])

  // Showcase animation
  useEffect(() => {
    if (!showcase) return

    let interval: NodeJS.Timeout
    let r = 0

    const timeout = setTimeout(() => {
      setInteracting(true)
      setActive(true)

      interval = setInterval(() => {
        r += 0.05
        setSpringRotate({ x: Math.sin(r) * 25, y: Math.cos(r) * 25 })
        setSpringGlare({
          x: 55 + Math.sin(r) * 55,
          y: 55 + Math.cos(r) * 55,
          o: 0.8,
        })
        setSpringBackground({
          x: 20 + Math.sin(r) * 20,
          y: 20 + Math.cos(r) * 20,
        })
      }, 20)

      setTimeout(() => {
        clearInterval(interval)
        handleInteractEnd()
      }, 4000)
    }, 2000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [showcase, handleInteractEnd])

  // CSS custom properties for effects
  const dynamicStyles = {
    '--pointer-x': `${springGlare.x}%`,
    '--pointer-y': `${springGlare.y}%`,
    '--pointer-from-center': pointerFromCenter,
    '--pointer-from-top': springGlare.y / 100,
    '--pointer-from-left': springGlare.x / 100,
    '--card-opacity': springGlare.o,
    '--rotate-x': `${springRotate.x}deg`,
    '--rotate-y': `${springRotate.y}deg`,
    '--background-x': `${springBackground.x}%`,
    '--background-y': `${springBackground.y}%`,
    '--card-scale': springScale,
    '--translate-x': `${springTranslate.x}px`,
    '--translate-y': `${springTranslate.y}px`,
    '--seedx': randomSeed.x,
    '--seedy': randomSeed.y,
    '--cosmosbg': `${cosmosPosition.x}px ${cosmosPosition.y}px`,
  } as React.CSSProperties

  const foilStyles =
    foil || mask
      ? ({
          '--mask': mask ? `url(${mask})` : undefined,
          '--foil': foil ? `url(${foil})` : undefined,
        } as React.CSSProperties)
      : {}

  const hasChildren = !img && children

  return (
    <div
      ref={cardRef}
      className={`card ${type} interactive ${interacting ? 'interacting' : ''} ${active ? 'active' : ''} ${!loaded ? 'loading' : ''} ${mask ? 'masked' : ''} ${hasChildren ? 'card--has-children' : ''}   ${className}`}
      data-rarity={rarity}
      data-subtypes={subtypes}
      data-supertype={supertype}
      style={{ ...dynamicStyles, ...style }}
    >
      <div className="card__translater">
        <div className="card__rotator" onPointerMove={handleInteract} onPointerLeave={handleInteractEnd}>
          {backImg && <Image className="card__back" src={backImg} alt="Card back" width={660} height={921} />}

          <div className="card__front" style={foilStyles}>
            <div className="card__shine z-10 absolute inset-0"></div>
            <div className="card__glare z-10 absolute inset-0"></div>
            <div className="card__content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PokemonCardWrapper
