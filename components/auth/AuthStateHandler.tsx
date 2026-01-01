'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthStateHandler() {
  const router = useRouter()

  useEffect(() => {
    // Handle the auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in, refreshing...')
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        router.push('/auth/login')
      }
    })

    // Handle hash fragment tokens (from OAuth implicit flow)
    // Redirect to callback handler if tokens are present
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')

      if (accessToken && !window.location.pathname.includes('/auth/callback-handler')) {
        console.log('🔑 Found tokens in URL, redirecting to callback handler...')
        window.location.href = '/auth/callback-handler' + window.location.hash
      }
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
