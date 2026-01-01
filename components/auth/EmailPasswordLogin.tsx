'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EmailPasswordLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.session) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error logging in:', error)
      setError(error.message || 'Invalid email or password')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-claude-text mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder-claude-text-tertiary focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-claude-text mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full px-4 py-2.5 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder-claude-text-tertiary focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-claude-accent text-white rounded-lg hover:bg-claude-accent-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
