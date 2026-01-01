import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔍 OAuth Callback - Code:', code ? 'exists' : 'missing')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ OAuth error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.session && data.user) {
      console.log('✅ OAuth success:', data.user.email)

      // Sync user with database
      try {
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          create: {
            supabaseId: data.user.id,
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            provider: data.user.app_metadata?.provider || 'email',
          },
          update: {
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          },
        })
        console.log('✅ User synced to database')
      } catch (dbError) {
        console.error('❌ Database sync error:', dbError)
      }

      // Create response with cookies
      const response = NextResponse.redirect(`${origin}${next}`)

      return response
    }
  }

  console.log('❌ No code provided')
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
