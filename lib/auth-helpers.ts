import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { User } from '@prisma/client'

/**
 * Get the current authenticated user from both Supabase and Prisma.
 * Redirects to login if user is not authenticated.
 *
 * @param redirectToLogin - Whether to redirect to login if not authenticated (default: true)
 * @returns The user object from Prisma database
 */
export async function getCurrentUser(redirectToLogin = true): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  if (!supabaseUser) {
    if (redirectToLogin) {
      redirect('/auth/login')
    }
    throw new Error('Not authenticated')
  }

  // Get user from Prisma database
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (!dbUser) {
    // User exists in Supabase but not in database - create them
    const newUser = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
        avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        provider: supabaseUser.app_metadata?.provider || 'email',
      },
    })
    return newUser
  }

  return dbUser
}

/**
 * Get the current authenticated user without redirecting.
 * Returns null if user is not authenticated.
 *
 * @returns The user object from Prisma database or null
 */
export async function getCurrentUserOptional(): Promise<User | null> {
  try {
    return await getCurrentUser(false)
  } catch (error) {
    return null
  }
}

/**
 * Check if a user is authenticated.
 *
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user
}

/**
 * Get the Supabase user object (without Prisma data).
 *
 * @returns Supabase User object or null
 */
export async function getSupabaseUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Require authentication and return the user.
 * Throws an error if not authenticated (useful for API routes).
 *
 * @returns The user object from Prisma database
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUserOptional()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
