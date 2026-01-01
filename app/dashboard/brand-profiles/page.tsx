'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import AdvancedBrandProfileForm from '@/components/brand-profiles/AdvancedBrandProfileForm'
import ChannelCard from '@/components/brand-profiles/ChannelCard'

interface BrandProfile {
  id: string
  name: string
  description?: string
  industry?: string
  targetAudience?: string
  tone: string[]
  status: 'DRAFT' | 'TRAINING' | 'READY' | 'ERROR'
  trainingProgress: number
  lastTrainedAt?: string
  createdAt: string
  updatedAt: string
  website?: string
  uniqueSellingProposition?: string
  brandColors?: any
  competitorChannels?: string[]
  inspirationChannels?: string[]
  contentPillars?: string[]
  contentTypeFocus?: string[]
  targetKeywords?: string[]
  communicationStyle?: string
  formality?: string
  emotionalTone?: string
  complexity?: string
  callToActionStyle?: string
  _count: {
    assets: number
  }
}

interface BrandAsset {
  id: string
  fileName: string
  originalName: string
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'IMAGE'
  fileSize: number
  uploadedAt: string
}

export default function BrandProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'detail'>('list')
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<BrandProfile | null>(null)
  const [assets, setAssets] = useState<BrandAsset[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [training, setTraining] = useState<any>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    if (selectedProfile) {
      fetchAssets(selectedProfile.id)
      fetchTrainingStatus(selectedProfile.id)
    }
  }, [selectedProfile])

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/brand-profiles')
      const data = await response.json()
      if (response.ok) {
        setProfiles(data.profiles)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async (profileId: string) => {
    try {
      const response = await fetch(`/api/brand-profiles/${profileId}/assets`)
      const data = await response.json()
      if (response.ok) {
        setAssets(data.assets)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  const fetchTrainingStatus = async (profileId: string): Promise<any> => {
    try {
      const response = await fetch(`/api/brand-profiles/${profileId}/train`)
      const data = await response.json()
      if (response.ok) {
        setTraining(data.training)
        return data.training
      }
    } catch (error) {
      // Might not have training yet, that's ok
    }
    return null
  }

  const handleSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description,
      industry: data.industry,
      targetAudience: data.targetAudience,
      tone: data.tone || [],
      brandColors: data.brandColors || {},
      website: data.website,
      uniqueSellingProposition: data.uniqueSellingProposition,
      competitorChannels: data.competitorChannels || [],
      inspirationChannels: data.inspirationChannels || [],
      contentPillars: data.contentPillars || [],
      contentTypeFocus: data.contentTypeFocus || [],
      targetKeywords: data.targetKeywords || [],
      communicationStyle: data.communicationStyle,
      formality: data.formality,
      emotionalTone: data.emotionalTone,
      complexity: data.complexity,
      callToActionStyle: data.callToActionStyle,
      competitorAnalysis: data.competitorAnalysis || {}
    }

    try {
      const url = editingProfile
        ? `/api/brand-profiles/${editingProfile.id}`
        : '/api/brand-profiles'

      const response = await fetch(url, {
        method: editingProfile ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()

      if (response.ok) {
        fetchProfiles()
        setCurrentView('list')
        setEditingProfile(null)

        if (!editingProfile) {
          setSelectedProfile(responseData.profile)
          setCurrentView('detail')
        }
      } else {
        alert(responseData.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    }
  }

  const handleEdit = (profile: BrandProfile) => {
    setEditingProfile(profile)
    setCurrentView('edit')
  }

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this brand profile?')) return

    try {
      const response = await fetch(`/api/brand-profiles/${profileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProfiles()
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null)
          setAssets([])
        }
      } else {
        alert('Failed to delete profile')
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Failed to delete profile')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProfile) return

    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `/api/brand-profiles/${selectedProfile.id}/assets`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        fetchAssets(selectedProfile.id)
        fetchProfiles()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleTrain = async () => {
    if (!selectedProfile) return

    try {
      const response = await fetch(
        `/api/brand-profiles/${selectedProfile.id}/train`,
        { method: 'POST' }
      )

      const data = await response.json()

      if (response.ok) {
        setTraining(data.training)
        fetchProfiles()
        const pollInterval = setInterval(() => {
          fetchTrainingStatus(selectedProfile.id).then(t => {
            setTraining(t)
            if (t?.status === 'COMPLETED' || t?.status === 'FAILED') {
              clearInterval(pollInterval)
              fetchProfiles()
            }
          })
        }, 2000)
      } else {
        alert(data.error || 'Failed to start training')
      }
    } catch (error) {
      console.error('Error starting training:', error)
      alert('Failed to start training')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string, progress?: number) => {
    const statusConfig = {
      DRAFT: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Draft',
        icon: '📝'
      },
      TRAINING: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        label: `Training ${progress || 0}%`,
        icon: '🧠'
      },
      READY: {
        color: 'bg-green-50 text-green-700 border-green-200',
        label: 'Ready',
        icon: '✨'
      },
      ERROR: {
        color: 'bg-red-50 text-red-700 border-red-200',
        label: 'Error',
        icon: '⚠️'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        config.color
      )}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getIndustryIcon = (industry?: string) => {
    const icons: Record<string, string> = {
      'Technology': '💻',
      'Fashion & Beauty': '👗',
      'Fitness & Wellness': '💪',
      'Education': '📚',
      'Finance': '💰',
      'Gaming': '🎮',
      'Travel': '✈️',
      'Food': '🍕'
    }
    return icons[industry || ''] || '🎨'
  }

  const getIndustryGradient = (industry?: string) => {
    const gradients: Record<string, string> = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Fashion & Beauty': 'from-pink-500 to-rose-500',
      'Fitness & Wellness': 'from-green-500 to-emerald-500',
      'Education': 'from-purple-500 to-indigo-500',
      'Finance': 'from-amber-500 to-yellow-500',
      'Gaming': 'from-violet-500 to-purple-500',
      'Travel': 'from-sky-500 to-blue-500',
      'Food': 'from-orange-500 to-red-500'
    }
    return gradients[industry || ''] || 'from-gray-500 to-slate-500'
  }

  const handleProfileClick = (profile: BrandProfile) => {
    setSelectedProfile(profile)
    setCurrentView('detail')
    fetchAssets(profile.id)
    fetchTrainingStatus(profile.id)
  }

  const handleBackToList = () => {
    setSelectedProfile(null)
    setCurrentView('list')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Only show on list view */}
      {currentView === 'list' && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Brand Profiles
                  </span>
                </h1>
                <p className="text-gray-500 mt-1">
                  Create and manage AI-powered brand voices for your content
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingProfile(null)
                  setCurrentView('create')
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List View */}
        {currentView === 'list' && (
          <>
            {/* Create Your First Brand Profile Section - Only show when no profiles exist */}
            {profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your First Brand Profile</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Train the AI with your unique voice and style to generate personalized content
                </p>
                <Button
                  onClick={() => {
                    setEditingProfile(null)
                    setCurrentView('create')
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Profile
                </Button>
              </div>
            )}

            {/* Divider - Only show when there are profiles */}
            {profiles.length > 0 && (
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm font-medium text-gray-400">Your Profiles</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            )}

            {/* Your Brand Profiles Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                  {profiles.length}
                </span>
                Your Brand Profiles
              </h3>

              {profiles.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400">No profiles created yet. Create your first profile above!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleProfileClick(profile)}
                      className="group cursor-pointer transition-all duration-300"
                    >
                      {/* Circular Profile Card */}
                      <div className="relative">
                        {/* Profile Circle */}
                        <div className={cn(
                          'w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-lg',
                          'bg-gradient-to-br transition-all duration-300',
                          getIndustryGradient(profile.industry),
                          'group-hover:scale-110 group-hover:shadow-xl'
                        )}>
                          {getIndustryIcon(profile.industry)}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute -bottom-1 -right-1">
                          {profile.status === 'READY' && (
                            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {profile.status === 'TRAINING' && (
                            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          {profile.status === 'DRAFT' && (
                            <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs">📝</span>
                            </div>
                          )}
                          {profile.status === 'ERROR' && (
                            <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs">⚠️</span>
                            </div>
                          )}
                        </div>

                        {/* Hover Ring */}
                        <div className={cn(
                          'absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300',
                          'group-hover:border-amber-500 group-hover:scale-125'
                        )}></div>
                      </div>

                      {/* Profile Name */}
                      <div className="text-center mt-3">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors truncate max-w-[120px] mx-auto">
                          {profile.name}
                        </h4>
                        {profile.industry && (
                          <p className="text-xs text-gray-400 truncate max-w-[120px] mx-auto">{profile.industry}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Profiles Section - Always Show */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-sm px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">Demo</span>
                Example Brand Profiles
                <span className="text-xs font-normal text-gray-400 ml-2">(Click to explore)</span>
              </h3>

              <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                {/* TechFluencer Demo Profile */}
                <div
                  onClick={() => handleProfileClick({
                    id: 'demo-tech-influencer-profile',
                    name: 'TechFluencer',
                    description: 'A tech content creator focused on making complex technology accessible to everyone.',
                    industry: 'Technology',
                    targetAudience: 'Tech enthusiasts aged 18-35, early adopters, developers, and professionals.',
                    tone: ['Professional', 'Friendly', 'Educational', 'Engaging', 'Authentic'],
                    status: 'READY',
                    trainingProgress: 100,
                    lastTrainedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    website: 'https://youtube.com/@techfluencer',
                    uniqueSellingProposition: 'Breaking down complex tech concepts into simple, relatable content.',
                    competitorChannels: ['https://youtube.com/@techcompetitor1', 'https://youtube.com/@techcompetitor2'],
                    inspirationChannels: ['https://youtube.com/@techinspiration1', 'https://youtube.com/@techinspiration2'],
                    contentPillars: ['Web Development', 'AI & Machine Learning', 'Career Advice'],
                    contentTypeFocus: ['Quick Tips (60 seconds)', 'In-depth Tutorials (10-15 min)', 'Tech Explainers'],
                    targetKeywords: ['web development', 'react', 'nextjs', 'typescript', 'ai development'],
                    communicationStyle: 'Clear, concise, and example-driven. Uses analogies to explain complex concepts.',
                    formality: 'casual',
                    emotionalTone: 'Enthusiastic and encouraging',
                    complexity: 'moderate',
                    callToActionStyle: 'direct',
                    _count: { assets: 3 }
                  } as BrandProfile)}
                  className="group cursor-pointer transition-all duration-300"
                >
                  {/* Circular Profile Card */}
                  <div className="relative">
                    {/* Profile Circle */}
                    <div className={cn(
                      'w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-lg',
                      'bg-gradient-to-br from-blue-500 to-cyan-500',
                      'transition-all duration-300',
                      'group-hover:scale-110 group-hover:shadow-xl'
                    )}>
                      💻
                    </div>

                    {/* Status Badge */}
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Hover Ring */}
                    <div className={cn(
                      'absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300',
                      'group-hover:border-amber-500 group-hover:scale-125'
                    )}></div>
                  </div>

                  {/* Profile Name */}
                  <div className="text-center mt-3">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors truncate max-w-[120px] mx-auto">
                      TechFluencer
                    </h4>
                    <p className="text-xs text-gray-400 truncate max-w-[120px] mx-auto">Technology</p>
                  </div>
                </div>

                {/* Fitness Demo Profile */}
                <div
                  className="group cursor-pointer transition-all duration-300 opacity-60"
                >
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-4xl shadow-lg">
                      💪
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <h4 className="text-sm font-semibold text-gray-500 truncate max-w-[120px] mx-auto">FitCoach</h4>
                    <p className="text-xs text-gray-400 truncate max-w-[120px] mx-auto">Coming Soon</p>
                  </div>
                </div>

                {/* Fashion Demo Profile */}
                <div
                  className="group cursor-pointer transition-all duration-300 opacity-60"
                >
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-4xl shadow-lg">
                      👗
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <h4 className="text-sm font-semibold text-gray-500 truncate max-w-[120px] mx-auto">StyleGuru</h4>
                    <p className="text-xs text-gray-400 truncate max-w-[120px] mx-auto">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create/Edit View */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => {
                  setCurrentView('list')
                  setEditingProfile(null)
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profiles
              </button>
            </div>
            <AdvancedBrandProfileForm
              initialData={editingProfile}
              onSave={handleSubmit}
              onCancel={() => {
                setCurrentView('list')
                setEditingProfile(null)
              }}
              isEdit={!!editingProfile}
            />
          </div>
        )}

        {/* Detail View */}
        {currentView === 'detail' && selectedProfile && (
          <div className="max-w-5xl mx-auto">
            {/* Back Button Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profiles
              </button>
            </div>

            <div className="space-y-6">
            {/* Profile Header Card */}
            <Card variant="elevated">
              <CardContent className="px-6 py-6">
                {/* Profile Info */}
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center text-4xl bg-gradient-to-br",
                      getIndustryGradient(selectedProfile.industry)
                    )}>
                      {getIndustryIcon(selectedProfile.industry)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedProfile.name}
                          </h2>
                          {selectedProfile.description && (
                            <p className="text-gray-500 text-sm max-w-2xl">
                              {selectedProfile.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(selectedProfile)}
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(selectedProfile.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {getStatusBadge(selectedProfile.status, selectedProfile.trainingProgress)}
                        {selectedProfile.industry && (
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            {selectedProfile.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid Layout for Profile Details */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Column 1: Basic Info & Content Strategy */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Brand Information */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span>🎯</span>
                      Basic Information
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedProfile.targetAudience && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <span>👥</span> Target Audience
                          </label>
                          <p className="text-sm text-gray-700 mt-2">{selectedProfile.targetAudience}</p>
                        </div>
                      )}
                      {selectedProfile.website && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <span>🌐</span> Website
                          </label>
                          <a href={selectedProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 block">
                            {selectedProfile.website}
                          </a>
                        </div>
                      )}
                    </div>
                    {selectedProfile.uniqueSellingProposition && (
                      <div className="mt-4">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>⭐</span> Unique Selling Proposition
                        </label>
                        <p className="text-sm text-gray-700 leading-relaxed mt-2">{selectedProfile.uniqueSellingProposition}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Content Strategy */}
                {((selectedProfile.contentPillars && selectedProfile.contentPillars.length > 0) ||
                  (selectedProfile.contentTypeFocus && selectedProfile.contentTypeFocus.length > 0) ||
                  (selectedProfile.targetKeywords && selectedProfile.targetKeywords.length > 0)) && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>📝</span>
                        Content Strategy
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {selectedProfile.contentPillars && selectedProfile.contentPillars.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <span>📌</span> Content Pillars
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProfile.contentPillars.map((pillar, i) => (
                              <span key={i} className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium">
                                {pillar}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProfile.contentTypeFocus && selectedProfile.contentTypeFocus.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <span>🎬</span> Content Types
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {selectedProfile.contentTypeFocus.map((type, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProfile.targetKeywords && selectedProfile.targetKeywords.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <span>🎯</span> Target Keywords
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {selectedProfile.targetKeywords.map((keyword, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Voice & Tone */}
                <Card className="border-2 border-amber-300">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>🎙️</span>
                        Voice & Tone
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                        AI CORE
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {selectedProfile.tone && selectedProfile.tone.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>🎨</span> Brand Tone Attributes
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProfile.tone.map((t, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProfile.communicationStyle && (
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>💬</span> Communication Style
                        </label>
                        <p className="text-sm text-gray-700 leading-relaxed mt-2">{selectedProfile.communicationStyle}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      {selectedProfile.formality && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Formality</label>
                          <p className="text-sm text-gray-700 font-medium capitalize mt-1">{selectedProfile.formality}</p>
                        </div>
                      )}
                      {selectedProfile.complexity && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Complexity</label>
                          <p className="text-sm text-gray-700 font-medium capitalize mt-1">{selectedProfile.complexity}</p>
                        </div>
                      )}
                      {selectedProfile.callToActionStyle && (
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CTA Style</label>
                          <p className="text-sm text-gray-700 font-medium capitalize mt-1">{selectedProfile.callToActionStyle}</p>
                        </div>
                      )}
                    </div>

                    {selectedProfile.emotionalTone && (
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>😊</span> Emotional Tone
                        </label>
                        <p className="text-sm text-gray-700 mt-2">{selectedProfile.emotionalTone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Competitive Analysis */}
                {(selectedProfile.competitorChannels && selectedProfile.competitorChannels.length > 0) ||
                 (selectedProfile.inspirationChannels && selectedProfile.inspirationChannels.length > 0) ? (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>🎥</span>
                        Saved YouTube Channels
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      {/* Competitor Channels */}
                      {selectedProfile.competitorChannels && selectedProfile.competitorChannels.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
                            Competitor Channels ({selectedProfile.competitorChannels.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedProfile.competitorChannels.map((channel, i) => (
                              <ChannelCard
                                key={i}
                                channel={{ url: channel }}
                                type="competitor"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Inspiration Channels */}
                      {selectedProfile.inspirationChannels && selectedProfile.inspirationChannels.length > 0 && (
                        <div className={selectedProfile.competitorChannels && selectedProfile.competitorChannels.length > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                            Inspiration Channels ({selectedProfile.inspirationChannels.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedProfile.inspirationChannels.map((channel, i) => (
                              <ChannelCard
                                key={i}
                                channel={{ url: channel }}
                                type="inspiration"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              {/* Column 2: Training & Assets */}
              <div className="space-y-6">
                {/* Training Section */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span>🧠</span>
                      Voice Training
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4">
                  {selectedProfile.status === 'READY' && training && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900 mb-1">Voice Model Ready!</p>
                          <p className="text-xs text-green-600 mb-3">
                            Your brand voice has been successfully trained and can now be used in content generation tools.
                          </p>
                          {selectedProfile.lastTrainedAt && (
                            <p className="text-xs text-green-600">
                              Trained on {new Date(selectedProfile.lastTrainedAt).toLocaleDateString()} with DeepSeek AI
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTrain}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retrain
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedProfile.status === 'TRAINING' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm font-medium text-blue-900">
                          Training AI voice model with {assets.filter(a => a.fileType !== 'IMAGE').length} documents...
                        </p>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedProfile.trainingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-600">
                        {selectedProfile.trainingProgress}% Complete - Analyzing brand voice patterns...
                      </p>
                    </div>
                  )}

                  {(selectedProfile.status === 'DRAFT' || selectedProfile.status === 'ERROR') && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedProfile.status === 'ERROR'
                          ? 'Training failed. Please check your assets and try again.'
                          : 'Upload text-based documents (PDF, DOCX, TXT) to train your brand voice model.'}
                      </p>
                      <Button
                        onClick={handleTrain}
                        disabled={assets.filter(a => a.fileType !== 'IMAGE').length === 0}
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Train Voice Model
                      </Button>
                    </div>
                  )}
                  </CardContent>
                </Card>

                {/* Assets Card */}
                <Card>
              <CardHeader className="bg-gray-50 border-b border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>📁</span>
                    Assets ({assets.length})
                  </h3>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingFile}
                      className="text-xs"
                    >
                      {uploadingFile ? 'Uploading...' : '+ Upload'}
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardHeader>

              <CardContent className="p-3">
                {assets.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400">No assets uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-base shadow-sm">
                          {asset.fileType === 'PDF' && '📄'}
                          {asset.fileType === 'DOCX' && '📝'}
                          {asset.fileType === 'TXT' && '📃'}
                          {asset.fileType === 'IMAGE' && '🖼️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {asset.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(asset.fileSize)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
