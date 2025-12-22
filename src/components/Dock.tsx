'use client'

import { IconChristmasTree, IconGift, IconHome, IconLogout } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FloatingDock, DockItem } from './ui/floating-dock'

export const Dock = () => {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const links: DockItem[] = [
    {
      title: 'Home',
      icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: '/',
    },
    {
      title: 'Booster',
      icon: <IconGift className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: '/booster',
    },
    {
      title: 'Noël',
      icon: <IconChristmasTree className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: '/noel',
    },
    {
      title: 'Déconnexion',
      icon: <IconLogout className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: handleLogout,
    },
  ]

  return (
    <FloatingDock items={links} mobileClassName="fixed bottom-6 z-[1000]" desktopClassName="fixed bottom-6 z-[1000]" />
  )
}
