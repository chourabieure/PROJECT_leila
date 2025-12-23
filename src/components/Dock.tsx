'use client'

import { IconChristmasTree, IconGift, IconHome } from '@tabler/icons-react'
import { FloatingDock, DockItem } from './ui/floating-dock'

export const Dock = () => {
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
  ]

  return (
    <FloatingDock items={links} mobileClassName="fixed bottom-6 z-[1000]" desktopClassName="fixed bottom-6 z-[1000]" />
  )
}
