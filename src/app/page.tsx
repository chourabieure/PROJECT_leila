import { Barcode } from '@/components/Barcode'
import { CometCard } from '@/components/ui/comet-card'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="h-full w-full flex items-center justify-center font-nunito">
      <CometCard>
        <div
          className="my-10 flex w-80 cursor-pointer flex-col items-stretch rounded-4xl border-0 bg-[#1F2121] p-2 saturate-0 md:my-20 md:p-4"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'none',
            opacity: 1,
          }}
        >
          <div className="flex-1">
            <div className="relative flex flex-col p-6 h-[300px] w-full bg-amber-800/50 rounded-3xl overflow-hidden">
              <span>
                <h2 className="text-2xl font-extrabold text-white">Alegría</h2>
                <h3 className="text-sm text-medium text-white">18 janvier 2026</h3>
              </span>
              <Image
                className="absolute -top-8 -left-8 -z-1 opacity-10"
                src="/CDS_Brand_DarkBack.svg"
                alt="Alegría"
                width={250}
                height={250}
              />
              <h3 className="mt-auto text-sm text-white/50 italic">Invitation pour les smols kitties</h3>
            </div>
          </div>
          <div className="w-[75%] h-[2px] m-auto border-2 border-amber-800/50 border-dashed" />
          <div className="flex-1">
            <div className="relative w-full bg-amber-800/50 rounded-3xl p-4">
              <Barcode />
            </div>
          </div>
        </div>
      </CometCard>
    </div>
  )
}
