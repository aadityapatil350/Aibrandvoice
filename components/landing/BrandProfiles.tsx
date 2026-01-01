'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface BrandProfile {
  id: string
  name: string
  industry: string
  description: string
  brandColors?: string[]
  status: string
  _count?: {
    assets: number
  }
}

export default function BrandProfiles() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUserAndFetchProfiles = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          setLoading(false)
          return
        }

        setUser(currentUser)

        const response = await fetch('/api/brand-profiles')
        if (response.ok) {
          const data = await response.json()
          setProfiles(data.profiles || [])
        }
      } catch (error) {
        console.error('Error fetching profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserAndFetchProfiles()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getBrandColor = (colors?: string[]) => {
    if (colors && colors.length > 0) {
      return colors[0]
    }
    return '#F59E0B'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-green-100 text-green-700'
      case 'TRAINING': return 'bg-blue-100 text-blue-700'
      case 'DRAFT': return 'bg-gray-100 text-gray-700'
      case 'ERROR': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your Brand Profiles
            </h2>
            <p className="text-gray-600 text-lg">
              {user ? 'Manage and edit your brand voice profiles' : 'Sign in to manage your brand profiles'}
            </p>
          </div>
          {user && (
            <Link
              href="/dashboard/brand-profiles?action=create"
              className="hidden md:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Profile
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your profiles...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In to View Your Brand Profiles</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create and manage your brand voice profiles to generate personalized content
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brand Profiles Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first brand profile to start generating personalized content that matches your unique voice
            </p>
            <Link
              href="/dashboard/brand-profiles?action=create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Profile Card */}
            <Link
              href="/dashboard/brand-profiles?action=create"
              className="group relative bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-amber-500 p-8 flex flex-col items-center justify-center min-h-[280px] transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 bg-gray-100 group-hover:bg-amber-50 rounded-full flex items-center justify-center mb-4 transition-colors">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
                Create New Profile
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Add a new brand voice profile
              </span>
            </Link>

            {/* Existing Profile Cards */}
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/dashboard/brand-profiles?id=${profile.id}`}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Profile Header with Brand Color */}
                <div
                  className="h-24 relative"
                  style={{ backgroundColor: getBrandColor(profile.brandColors) }}
                >
                  <div className="absolute -bottom-10 left-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white"
                      style={{ backgroundColor: getBrandColor(profile.brandColors) }}
                    >
                      {getInitials(profile.name)}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(profile.status)}`}>
                      {profile.status}
                    </span>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="pt-12 pb-6 px-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{profile.industry}</p>

                  {profile.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {profile.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>{profile._count?.assets || 0} assets</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 group-hover:text-amber-700 transition-colors">
                      <span className="text-sm font-medium">Edit Profile</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {user && profiles.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/dashboard/brand-profiles"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              Manage All Profiles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
