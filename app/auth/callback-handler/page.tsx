'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CallbackHandler() {
  const [status, setStatus] = useState('Processing authentication...')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if there are tokens in the URL hash
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken) {
            setStatus('Setting up your session...')

            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })

            if (error) {
              console.error('❌ Error setting session:', error)
              setStatus('Authentication failed. Redirecting...')
              setTimeout(() => router.push('/auth/login'), 2000)
              return
            }

            if (data.session) {
              setStatus('Success! Redirecting to dashboard...')
              // Wait a bit for cookies to sync
              await new Promise(resolve => setTimeout(resolve, 1000))
              // Full page reload to ensure server sees the session
              window.location.href = '/dashboard'
              return
            }
          }
        }

        // If no tokens in hash, check if already authenticated
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setStatus('Already authenticated. Redirecting...')
          window.location.href = '/dashboard'
        } else {
          setStatus('No session found. Redirecting to login...')
          setTimeout(() => router.push('/auth/login'), 2000)
        }
      } catch (error) {
        console.error('Error in callback handler:', error)
        setStatus('An error occurred. Redirecting to login...')
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-claude-bg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-claude-accent mb-4"></div>
        <p className="text-claude-text text-lg">{status}</p>
      </div>
    </div>
  )
}
