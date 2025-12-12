import type { Metadata } from 'next'
import './globals.css'
import { Poppins } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})
export const metadata: Metadata = {
  title: 'Leïla',
  description: 'Leïla',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="w-lvw overflow-hidden box-border fixed inset-0 ">
      <body className={`${poppins.className} antialiased font-poppins h-full w-full bg-zinc-900`}>
        <AuthProvider>
          <main className="h-full w-full gap-6 flex flex-col items-center justify-center font-nunito">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
