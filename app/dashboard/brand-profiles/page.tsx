'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import AdvancedBrandProfileForm from '@/components/brand-profiles/AdvancedBrandProfileForm'

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

  const fetchTrainingStatus = async (profileId: string) => {
    try {
      const response = await fetch(`/api/brand-profiles/${profileId}/train`)
      const data = await response.json()
      if (response.ok) {
        setTraining(data.training)
      }
    } catch (error) {
      // Might not have training yet, that's ok
    }
  }

  const handleSubmit = async (data: any) => {
    // Convert advanced form data to match database schema
    const payload = {
      name: data.name,
      description: data.description,
      industry: data.industry,
      targetAudience: data.targetAudience,
      tone: data.tone || [],
      brandColors: data.brandColors || {},
      // Store additional data in JSON fields for future use
      website: data.website,
      uniqueSellingProposition: data.uniqueSellingProposition,
      competitorChannels: data.competitorChannels || [],
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
          // New profile created, select it
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
        fetchProfiles() // Update asset count
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
        fetchProfiles() // Update status
        // Poll for training status
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
      DRAFT: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      TRAINING: { color: 'bg-blue-100 text-blue-700', label: `Training ${progress || 0}%` },
      READY: { color: 'bg-green-100 text-green-700', label: 'Ready' },
      ERROR: { color: 'bg-red-100 text-red-700', label: 'Error' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.color
      )}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-claude-text mb-2">Brand Profiles</h1>
          <p className="text-claude-text-secondary">
            Create and manage multiple brand voices for different projects
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProfile(null)
            setCurrentView('create')
          }}
          className="bg-claude-accent hover:bg-claude-accent-hover"
        >
          + Create Profile
        </Button>
      </div>

      {/* Render different views based on currentView */}
      {currentView === 'list' && (
        <>
          {/* Mobile Create Form Button */}
          {profiles.length > 0 && (
            <div className="md:hidden mb-6">
              <Button
                onClick={() => {
                  setEditingProfile(null)
                  setCurrentView('create')
                }}
                className="w-full bg-claude-accent hover:bg-claude-accent-hover"
              >
                + Create New Profile
              </Button>
            </div>
          )}

          {/* Profiles List */}
          {profiles.length === 0 ? (
            <div className="bg-white rounded-lg border border-claude-border p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-6xl mb-4">🎨</div>
              <h3 className="text-lg sm:text-xl font-bold text-claude-text mb-2">No Brand Profiles Yet</h3>
              <p className="text-sm sm:text-base text-claude-text-secondary mb-6 max-w-md mx-auto">
                Create your first brand profile to train the AI with your unique voice and style
              </p>
              <Button
                onClick={() => setCurrentView('create')}
                className="bg-claude-accent hover:bg-claude-accent-hover w-full sm:w-auto"
              >
                Create Your First Profile
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Profiles List */}
              <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    hoverable
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedProfile?.id === profile.id && 'border-claude-accent ring-2 ring-claude-accent/20'
                    )}
                    onClick={() => {
                      setSelectedProfile(profile)
                      setCurrentView('detail')
                    }}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-claude-text text-sm sm:text-base truncate flex-1 mr-2">
                          {profile.name}
                        </h3>
                        <div className="flex-shrink-0">
                          {getStatusBadge(profile.status, profile.trainingProgress)}
                        </div>
                      </div>
                      {profile.description && (
                        <p className="text-xs sm:text-sm text-claude-text-secondary mb-2 line-clamp-2">
                          {profile.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-claude-text-tertiary">
                        <span>{profile._count.assets} assets</span>
                        <span className="hidden sm:inline">
                          {new Date(profile.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State for Detail View */}
              <div className="lg:col-span-2">
                <div className="w-full max-w-md mx-auto">
                  <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                      <div className="text-4xl sm:text-6xl mb-4">👈</div>
                      <h3 className="text-lg sm:text-xl font-bold text-claude-text mb-2">Select a Profile</h3>
                      <p className="text-sm sm:text-base text-claude-text-secondary">
                        Choose a brand profile from the list to view and manage details
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit View */}
      {(currentView === 'create' || currentView === 'edit') && (
        <AdvancedBrandProfileForm
          initialData={editingProfile}
          onSave={handleSubmit}
          onCancel={() => {
            setCurrentView('list')
            setEditingProfile(null)
          }}
          isEdit={!!editingProfile}
        />
      )}

      {/* Detail View */}
      {currentView === 'detail' && selectedProfile && (
        <div className="space-y-4 sm:space-y-6">
          {/* Back Navigation */}
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-claude-text-secondary hover:text-claude-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profiles
          </button>

          {/* Profile Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-claude-text mb-2">
                    {selectedProfile.name}
                  </h2>
                  {selectedProfile.description && (
                    <p className="text-claude-text-secondary mb-4">
                      {selectedProfile.description}
                    </p>
                  )}
                  {getStatusBadge(selectedProfile.status, selectedProfile.trainingProgress)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedProfile)}
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedProfile.id)}
                    className="text-red-600 hover:text-red-700"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Training Section */}
              <div className="border-t border-claude-border pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="font-semibold text-claude-text">Voice Training</h3>
                  {selectedProfile.status === 'READY' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">
                        ✓ Trained on {new Date(selectedProfile.lastTrainedAt!).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-claude-accent-light text-claude-accent px-2 py-1 rounded-full">
                        DeepSeek Model
                      </span>
                    </div>
                  )}
                </div>

                {/* Training Status Message */}
                {selectedProfile.status === 'TRAINING' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-claude-accent border-t-transparent rounded-full"></div>
                      <p className="text-sm text-claude-text-secondary">
                        Training AI voice model with {assets.filter(a => a.fileType !== 'IMAGE').length} documents...
                      </p>
                    </div>
                    <div className="w-full bg-claude-bg-secondary rounded-full h-3">
                      <div
                        className="bg-claude-accent h-3 rounded-full transition-all duration-500"
                        style={{ width: `${selectedProfile.trainingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-claude-text-tertiary">
                      {selectedProfile.trainingProgress}% Complete - Analyzing brand voice patterns...
                    </p>
                  </div>
                )}

                {selectedProfile.status === 'ERROR' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm text-red-800 font-medium">Training Failed</p>
                        <p className="text-xs text-red-600 mt-1">
                          Please check your assets and try again. Make sure you have text-based documents (PDF, DOCX, TXT).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ready State with Voice Model Info */}
                {selectedProfile.status === 'READY' && training && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 text-lg">✨</span>
                        <div className="flex-1">
                          <p className="text-sm text-green-800 font-medium">Voice Model Ready!</p>
                          <p className="text-xs text-green-600 mt-1">
                            Your brand voice has been successfully trained and can now be used in content generation tools.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Model Details */}
                    {training.vectorEmbeddings && (
                      <div className="p-3 bg-claude-bg-secondary rounded-lg">
                        <p className="text-xs font-medium text-claude-text mb-2">Voice Model Insights:</p>
                        <div className="space-y-1">
                          <p className="text-xs text-claude-text-secondary">
                            • Model: {training.vectorEmbeddings.model}
                          </p>
                          <p className="text-xs text-claude-text-secondary">
                            • Analyzed content: {training.vectorEmbeddings.textLength || 'N/A'} characters
                          </p>
                          <p className="text-xs text-claude-text-secondary">
                            • Training tokens: {training.vectorEmbeddings.tokensUsed || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Train/Retrain Buttons */}
                {(selectedProfile.status === 'DRAFT' || selectedProfile.status === 'ERROR') && (
                  <div className="mt-4">
                    <Button
                      onClick={handleTrain}
                      disabled={assets.filter(a => a.fileType !== 'IMAGE').length === 0}
                      className="w-full sm:w-auto"
                    >
                      <span className="flex items-center gap-2">
                        <span>🧠</span>
                        Train Voice Model
                      </span>
                    </Button>
                    {assets.filter(a => a.fileType !== 'IMAGE').length === 0 && (
                      <p className="text-xs text-claude-text-tertiary mt-2">
                        Upload text-based documents (PDF, DOCX, TXT) to enable voice training
                      </p>
                    )}
                  </div>
                )}

                {selectedProfile.status === 'READY' && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleTrain}
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <span className="flex items-center gap-2">
                        <span>🔄</span>
                        Retrain Model
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <span className="flex items-center gap-2">
                        <span>📊</span>
                        View Analytics
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assets Section */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="font-semibold text-claude-text">
                  Assets ({assets.length})
                </h3>
                <label className="cursor-pointer w-full sm:w-auto">
                  <Button
                    variant="outline"
                    disabled={uploadingFile}
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <span>
                      {uploadingFile ? 'Uploading...' : 'Upload Assets'}
                    </span>
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

              {assets.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-3">📁</div>
                  <p className="text-claude-text-secondary mb-2 text-sm sm:text-base">No assets uploaded</p>
                  <p className="text-xs sm:text-sm text-claude-text-tertiary">
                    Upload PDFs, DOCX, TXT files, and images to train your brand voice
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 border border-claude-border rounded-lg hover:bg-claude-bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">
                          {asset.fileType === 'PDF' && '📄'}
                          {asset.fileType === 'DOCX' && '📝'}
                          {asset.fileType === 'TXT' && '📃'}
                          {asset.fileType === 'IMAGE' && '🖼️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-claude-text truncate">
                            {asset.originalName}
                          </p>
                          <p className="text-xs text-claude-text-tertiary">
                            {formatFileSize(asset.fileSize)} • {asset.fileType}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}