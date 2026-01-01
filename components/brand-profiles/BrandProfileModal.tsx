'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface BrandAsset {
  id: string
  fileName: string
  originalName: string
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'IMAGE'
  fileSize: number
  uploadedAt: string
}

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
  contentPillars?: string[]
  contentTypeFocus?: string[]
  targetKeywords?: string[]
  competitorChannels?: string[]
  communicationStyle?: string
  formality?: string
  emotionalTone?: string
  complexity?: string
  callToActionStyle?: string
  competitorAnalysis?: any
  _count: {
    assets: number
  }
}

interface BrandProfileModalProps {
  profile: BrandProfile
  assets: BrandAsset[]
  training: any
  onClose: () => void
  onEdit: () => void
  onDelete: (profileId: string) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingFile: boolean
  onTrain: () => void
  fetchProfiles: () => void
}

const InfoSection = ({ label, children, icon }: { label: string, children: React.ReactNode, icon?: string }) => (
  <div>
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
      {icon && <span>{icon}</span>}
      {label}
    </label>
    <div className="mt-2">{children}</div>
  </div>
)

export default function BrandProfileModal({
  profile,
  assets,
  training,
  onClose,
  onEdit,
  onDelete,
  onFileUpload,
  uploadingFile,
  onTrain,
  fetchProfiles
}: BrandProfileModalProps) {
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (profile.status === 'TRAINING' && !polling) {
      setPolling(true)
      const pollInterval = setInterval(() => {
        fetch(`/api/brand-profiles/${profile.id}/train`)
          .then(res => res.json())
          .then(data => {
            if (data.training?.status === 'COMPLETED' || data.training?.status === 'FAILED') {
              clearInterval(pollInterval)
              setPolling(false)
              fetchProfiles()
            }
          })
      }, 2000)
      return () => clearInterval(pollInterval)
    }
  }, [profile.status, profile.id, fetchProfiles, polling])

  const getIndustryIcon = (industry?: string) => {
    const icons: Record<string, string> = {
      'Technology': '💻',
      'Technology & Software Development': '💻',
      'Fashion & Beauty': '👗',
      'Fitness & Wellness': '💪',
      'Education': '📚',
      'Finance': '💰',
      'Gaming': '🎮',
      'Travel': '✈️',
      'Food & Beverage': '🍕'
    }
    return icons[industry || ''] || '🎨'
  }

  const getIndustryGradient = (industry?: string) => {
    const gradients: Record<string, string> = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Technology & Software Development': 'from-blue-500 to-cyan-500',
      'Fashion & Beauty': 'from-pink-500 to-rose-500',
      'Fitness & Wellness': 'from-green-500 to-emerald-500',
      'Education': 'from-purple-500 to-indigo-500',
      'Finance': 'from-amber-500 to-yellow-500',
      'Gaming': 'from-violet-500 to-purple-500',
      'Travel': 'from-sky-500 to-blue-500',
      'Food & Beverage': 'from-orange-500 to-red-500'
    }
    return gradients[industry || ''] || 'from-gray-500 to-slate-500'
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isDemoProfile = profile.id === 'demo-tech-influencer-profile'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Gradient Header */}
        <div className={cn(
          'h-32 relative bg-gradient-to-r',
          getIndustryGradient(profile.industry)
        )}>
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Header */}
          <div className="relative -mt-16 px-6 pb-4">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl border-4 border-white">
                {getIndustryIcon(profile.industry)}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profile.name}
                      {isDemoProfile && (
                        <span className="ml-2 text-sm px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">Demo</span>
                      )}
                    </h2>
                    {profile.description && (
                      <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                        {profile.description}
                      </p>
                    )}
                  </div>
                  {!isDemoProfile && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(profile.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {getStatusBadge(profile.status, profile.trainingProgress)}
                  {profile.industry && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      {profile.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Layout for Details */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              {/* Column 1: Basic Info & Content Strategy */}
              <div className="lg:col-span-2 space-y-4">
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
                      <InfoSection label="Target Audience" icon="👥">
                        <p className="text-sm text-gray-700">{profile.targetAudience || 'Not specified'}</p>
                      </InfoSection>
                      {profile.website && (
                        <InfoSection label="Website" icon="🌐">
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {profile.website}
                          </a>
                        </InfoSection>
                      )}
                    </div>
                    {profile.uniqueSellingProposition && (
                      <div className="mt-4">
                        <InfoSection label="Unique Selling Proposition" icon="⭐">
                          <p className="text-sm text-gray-700 leading-relaxed">{profile.uniqueSellingProposition}</p>
                        </InfoSection>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Content Strategy */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span>📝</span>
                      Content Strategy
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {profile.contentPillars && profile.contentPillars.length > 0 && (
                      <InfoSection label="Content Pillars" icon="📌">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.contentPillars.map((pillar, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium">
                              {pillar}
                            </span>
                          ))}
                        </div>
                      </InfoSection>
                    )}

                    {profile.contentTypeFocus && profile.contentTypeFocus.length > 0 && (
                      <InfoSection label="Content Types" icon="🎬">
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {profile.contentTypeFocus.map((type, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                              {type}
                            </span>
                          ))}
                        </div>
                      </InfoSection>
                    )}

                    {profile.targetKeywords && profile.targetKeywords.length > 0 && (
                      <InfoSection label="Target Keywords" icon="🎯">
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {profile.targetKeywords.map((keyword, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </InfoSection>
                    )}
                  </CardContent>
                </Card>

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
                    {profile.tone && profile.tone.length > 0 && (
                      <InfoSection label="Brand Tone Attributes" icon="🎨">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.tone.map((t, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </InfoSection>
                    )}

                    {profile.communicationStyle && (
                      <InfoSection label="Communication Style" icon="💬">
                        <p className="text-sm text-gray-700 leading-relaxed">{profile.communicationStyle}</p>
                      </InfoSection>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      {profile.formality && (
                        <InfoSection label="Formality">
                          <p className="text-sm text-gray-700 font-medium capitalize">{profile.formality}</p>
                        </InfoSection>
                      )}
                      {profile.complexity && (
                        <InfoSection label="Complexity">
                          <p className="text-sm text-gray-700 font-medium capitalize">{profile.complexity}</p>
                        </InfoSection>
                      )}
                      {profile.callToActionStyle && (
                        <InfoSection label="CTA Style">
                          <p className="text-sm text-gray-700 font-medium capitalize">{profile.callToActionStyle}</p>
                        </InfoSection>
                      )}
                    </div>

                    {profile.emotionalTone && (
                      <InfoSection label="Emotional Tone" icon="😊">
                        <p className="text-sm text-gray-700">{profile.emotionalTone}</p>
                      </InfoSection>
                    )}
                  </CardContent>
                </Card>

                {/* Competitive Analysis */}
                {profile.competitorChannels && profile.competitorChannels.length > 0 && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>🔍</span>
                        Competitive Analysis
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4">
                      <InfoSection label="Competitor Channels" icon="🏆">
                        <div className="space-y-1.5 mt-2">
                          {profile.competitorChannels.map((channel, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">#{i + 1}</span>
                              <a href={channel} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                                {channel}
                              </a>
                            </div>
                          ))}
                        </div>
                      </InfoSection>
                      {profile.competitorAnalysis?.competitors && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Analysis Results</p>
                          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {profile.competitorAnalysis.competitors.length} competitors analyzed
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Column 2: Training & Assets */}
              <div className="space-y-4">
                {/* Training Section */}
                {!isDemoProfile && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>🧠</span>
                        Voice Training
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4">
                      {profile.status === 'READY' && training && (
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-green-900 mb-1">Voice Model Ready!</p>
                              <p className="text-xs text-green-700">
                                Your AI is trained and ready to generate content in your unique voice.
                              </p>
                              {profile.lastTrainedAt && (
                                <p className="text-xs text-green-600 mt-2">
                                  Trained: {new Date(profile.lastTrainedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onTrain}
                            className="w-full mt-2 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retrain Model
                          </Button>
                        </div>
                      )}

                      {profile.status === 'TRAINING' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <p className="text-sm font-medium text-blue-900">
                              Training in progress...
                            </p>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${profile.trainingProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-blue-600">{profile.trainingProgress}% Complete</p>
                        </div>
                      )}

                      {(profile.status === 'DRAFT' || profile.status === 'ERROR') && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">
                            {profile.status === 'ERROR'
                              ? 'Training failed. Upload new assets and try again.'
                              : 'Upload documents to train your AI voice model.'}
                          </p>
                          <Button
                            onClick={onTrain}
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
                )}

                {/* Assets */}
                {!isDemoProfile && (
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
                            onChange={onFileUpload}
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
                )}

                {/* Demo profile notice */}
                {isDemoProfile && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">💡</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-900 mb-1">Demo Profile</p>
                        <p className="text-xs text-purple-700">
                          This is an example. Create your own profile to train AI with your actual brand voice.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
