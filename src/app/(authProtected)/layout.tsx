import { Dock } from '@/components/Dock'

export default function AuthProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Dock />
    </>
  )
}
