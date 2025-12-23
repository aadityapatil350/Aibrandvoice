'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Brand Profiles', href: '/dashboard/brand-profiles', icon: '🎨' },
  ]

  const tools = [
    { name: 'Content Optimizer', href: '/dashboard/tools/content-optimizer', icon: '🚀' },
    { name: 'Script Generator', href: '/dashboard/tools/script-generator', icon: '📝' },
  ]

  const videoTools = [
    { name: 'Text-to-Video', href: '/dashboard/video/text-to-video', icon: '🎬' },
    { name: 'AI Avatar Video', href: '/dashboard/video/ai-avatar', icon: '👤' },
    { name: 'Auto Subtitles', href: '/dashboard/video/subtitles', icon: '💬' },
    { name: 'AI Voice-Over', href: '/dashboard/video/voiceover', icon: '🎙️' },
    { name: 'Auto Dubbing', href: '/dashboard/video/dubbing', icon: '🌐' },
    { name: 'Highlight Extraction', href: '/dashboard/video/highlights', icon: '✂️' },
    { name: 'Video Cropping', href: '/dashboard/video/cropping', icon: '📐' },
    { name: 'Music Library', href: '/dashboard/video/music', icon: '🎵' },
    { name: 'Effects & Transitions', href: '/dashboard/video/effects', icon: '✨' },
    { name: 'Speed Optimizer', href: '/dashboard/video/speed', icon: '⚡' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-claude-border h-screen overflow-y-auto sticky top-0">
      <div className="p-6 border-b border-claude-border">
        <Link href="/dashboard" className="text-xl font-bold text-claude-text">
          BrandVoice AI
        </Link>
      </div>

      <nav className="p-4 space-y-1">
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

        <div className="pt-4">
          <div className="px-4 py-2 text-claude-text-secondary font-medium text-sm">
            VIDEO TOOLS
          </div>
          {videoTools.map((item) => {
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
    </aside>
  )
}
