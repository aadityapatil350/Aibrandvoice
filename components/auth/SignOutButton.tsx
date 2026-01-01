'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary rounded-lg transition-colors disabled:opacity-50"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
