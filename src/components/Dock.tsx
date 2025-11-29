import { IconCat, IconChristmasTree, IconHome } from '@tabler/icons-react'
import { FloatingDock } from './ui/floating-dock'

const links = [
  {
    title: 'Home',
    icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: '/',
  },
  {
    title: 'Glitch',
    icon: <IconCat className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: '/glitch',
  },

  {
    title: 'Noël',
    icon: <IconChristmasTree className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: '/noel',
  },
]
export const Dock = () => {
  return <FloatingDock items={links} />
}
