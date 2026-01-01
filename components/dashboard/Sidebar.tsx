'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/auth/SignOutButton'

export default function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Brand Profiles', href: '/dashboard/brand-profiles', icon: '🎨' },
  ]

  const tools = [
    { name: 'Create Content', href: '/dashboard/tools/content-optimizer', icon: '✨' },
    { name: 'YouTube Research', href: '/dashboard/youtube-research', icon: '📺' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-claude-border h-screen overflow-y-auto sticky top-0 flex flex-col">
      <div className="p-6 border-b border-claude-border">
        <Link href="/dashboard" className="text-xl font-bold text-claude-text">
          BrandVoice AI
        </Link>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-claude-accent text-white'
                  : 'text-claude-text hover:bg-claude-bg-secondary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}

        <div className="pt-4">
          <div className="px-4 py-2 text-claude-text-secondary font-medium text-sm">
            TOOLS
          </div>
          {tools.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-claude-accent text-white'
                    : 'text-claude-text hover:bg-claude-bg-secondary'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-claude-border">
        <SignOutButton />
      </div>
    </aside>
  )
}
