'use client'

import { CometCard } from '@/components/ui/comet-card'
import Image from 'next/image'
import { useState } from 'react'

function getRandomImageNumber() {
  return Math.floor(Math.random() * 33) + 1
}

export default function Cats() {
  const [imageNum, setImageNum] = useState(getRandomImageNumber)

  const handleClick = () => {
    setImageNum(getRandomImageNumber())
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center">
      <CometCard
        className="w-full h-full flex max-w-[700px] max-h-[700px]"
        containerClassName="flex-1  overflow-hidden"
      >
        <div
          className="h-full p-4 flex cursor-pointer flex-col items-stretch border-0 bg-[#1F2121]"
          onClick={handleClick}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'none',
            opacity: 1,
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <Image src={`/glitch/image-${imageNum}.jpeg`} alt="Glitch" fill className="object-cover" />
          </div>
        </div>
      </CometCard>
    </div>
  )
}
