import { Barcode } from '@/components/Barcode'
import { CometCard } from '@/components/ui/comet-card'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-1 w-full items-center justify-center">
      <CometCard className="w-full max-w-96">
        <div
          className="flex cursor-pointer flex-col items-stretch rounded-4xl border-0 bg-[#1F2121] p-2 saturate-0 md:my-20 md:p-4"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'none',
            opacity: 1,
          }}
        >
          <div className="flex-1">
            <div className="relative flex flex-col p-6 pb-4 h-[300px] w-full bg-amber-800/50 rounded-t-3xl overflow-hidden">
              <span className="flex flex-col gap-1">
                <h2 className="text-3xl font-extrabold text-white">Alegría</h2>
                <h3 className="text-md text-medium text-white">18 janvier 2026</h3>
              </span>
              <Image
                className="absolute -top-8 -left-8 -z-1 opacity-10"
                src="/CDS_Brand_DarkBack.svg"
                alt="Alegría"
                width={250}
                height={250}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex bg-amber-800/50 rounded-b-3xl overflow-hidden">
              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <span className="text-[10px] font-semibold text-white/70 tracking-wider uppercase">Porte</span>
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <div className="w-px h-[16px] my-auto bg-white/10" />
              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <span className="text-[10px] font-semibold text-white/70 tracking-wider uppercase">Section</span>
                <span className="text-2xl font-bold text-white">103</span>
              </div>
              <div className="w-px h-[16px] my-auto bg-white/10" />
              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <span className="text-[10px] font-semibold text-white/70 tracking-wider uppercase">Rangée</span>
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div className="w-px h-[16px] my-auto bg-white/10" />
              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <span className="text-[10px] font-semibold text-white/70 tracking-wider uppercase">Siège</span>
                <span className="text-2xl font-bold text-white">7</span>
              </div>
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
